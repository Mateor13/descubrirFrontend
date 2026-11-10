import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { academico, asistencias as api } from '../../api/v2'
import { mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { useSesion } from '../../context/Sesion'
import { usePeriodo } from '../../context/Periodo'
import { Encabezado, Insignia, Aviso } from '../../componentes/ui/Pagina'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { ModalJustificar } from '../app/Estudiante'
import { ESTADOS_ASISTENCIA, fechaLarga, hoyISO, nombreCompleto } from '../../lib/formato'

const OPCIONES = [
    { estado: 'presente', corto: 'P', activo: 'bg-verde-700 text-white ring-verde-700' },
    { estado: 'atraso', corto: 'T', activo: 'bg-amber-500 text-slate-950 ring-amber-600' },
    { estado: 'ausente', corto: 'A', activo: 'bg-red-700 text-white ring-red-700' }
]

// Toma de asistencia del día: una fila por estudiante con Presente / Atraso / Ausente
const Asistencia = () => {
    const [params, setParams] = useSearchParams()
    const curso = params.get('curso') ?? ''
    const fecha = params.get('fecha') ?? hoyISO()
    const { tieneRol } = useSesion()
    const { activo, esHistorico } = usePeriodo()
    const esAdmin = tieneRol('admin')

    // El admin ve todos los cursos; el docente, los cursos donde dicta alguna clase
    const cursos = useCarga(async () => {
        if (esAdmin) return academico.cursos()
        const clases = await academico.clases()
        const unicos = new Map(clases.map(c => [c.curso.id, c.curso]))
        return [...unicos.values()].sort((a, b) => a.nivel - b.nivel || a.paralelo.localeCompare(b.paralelo))
    }, [esAdmin], { activo: Boolean(activo) })
    const lista = useCarga(() => api.delDia(curso, fecha), [curso, fecha], { activo: Boolean(curso && activo) })
    const [marcas, setMarcas] = useState({})
    const [guardando, setGuardando] = useState(false)
    const [justificando, setJustificando] = useState(null)

    useEffect(() => {
        if (lista.datos) setMarcas(Object.fromEntries(lista.datos.estudiantes.map(e => [e.id, e.estado])))
    }, [lista.datos])

    // Un solo curso: se selecciona automáticamente
    useEffect(() => {
        if (!curso && cursos.datos?.length === 1) cambiarParam('curso', cursos.datos[0].id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursos.datos])

    const cambiarParam = (clave, valor) => {
        const nuevos = new URLSearchParams(params)
        if (valor) nuevos.set(clave, valor); else nuevos.delete(clave)
        setParams(nuevos, { replace: true })
    }

    const estudiantes = lista.datos?.estudiantes ?? []
    // Los ya justificados no se reenvían (se perdería la justificación)
    const editables = estudiantes.filter(e => e.estado !== 'justificado')
    const sinMarcar = editables.filter(e => !marcas[e.id]).length
    const conteo = useMemo(() => Object.values(marcas).reduce((acc, m) => ({ ...acc, [m]: (acc[m] ?? 0) + 1 }), {}), [marcas])

    const todosPresentes = () => setMarcas(m => ({ ...m, ...Object.fromEntries(editables.filter(e => !m[e.id]).map(e => [e.id, 'presente'])) }))

    const guardar = async () => {
        if (sinMarcar) { toast.error(`Faltan ${sinMarcar} estudiante(s) por marcar`); return }
        setGuardando(true)
        try {
            await api.registrar(curso, { fecha, registros: editables.map(e => ({ estudiante: e.id, estado: marcas[e.id] })) })
            toast.success('Asistencia guardada')
            lista.recargar({ silencioso: true })
        } catch (err) { toast.error(mensajeError(err)) } finally { setGuardando(false) }
    }

    return (
        <>
            <Encabezado titulo="Asistencia" descripcion="Registre la asistencia diaria del curso. Puede corregirla volviendo a guardar." />
            {(!activo || esHistorico) && <Aviso tono="morado">{activo ? 'La asistencia se registra en el periodo activo; cambie el selector de periodo para usarla.' : 'Sin periodo activo no se puede registrar asistencia.'}</Aviso>}
            {activo && (
                <>
                    <div className="tarjeta mb-4 grid gap-3 p-4 sm:grid-cols-2">
                        <label>
                            <span className="etiqueta">Curso</span>
                            <select className="control" value={curso} onChange={(e) => cambiarParam('curso', e.target.value)}>
                                <option value="">Seleccione un curso…</option>
                                {(cursos.datos ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className="etiqueta">Fecha</span>
                            <input type="date" className="control" value={fecha} max={hoyISO()} onChange={(e) => cambiarParam('fecha', e.target.value || hoyISO())} />
                        </label>
                    </div>
                    {!curso ? <div className="tarjeta"><Vacio titulo="Seleccione un curso" /></div> : (
                        <Contenido carga={lista} vacio={null}>
                            {() => estudiantes.length === 0 ? <div className="tarjeta"><Vacio titulo="No hay estudiantes matriculados en este curso" /></div> : (
                                <>
                                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-slate-700 first-letter:uppercase">
                                            {fechaLarga(lista.datos.fecha)} · {lista.datos.registrada ? <Insignia tono="verde">Registrada</Insignia> : <Insignia tono="ambar">Sin registrar</Insignia>}
                                        </p>
                                        <button type="button" className="btn-secundario btn-sm" onClick={todosPresentes} disabled={!sinMarcar}>Marcar el resto como presentes</button>
                                    </div>
                                    <div className="tarjeta overflow-hidden">
                                        <ul className="divide-y divide-slate-100">
                                            {estudiantes.map((e, i) => (
                                                <li key={e.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 text-right text-sm text-slate-500">{i + 1}</span>
                                                        <Link to={`/app/estudiantes/${e.id}`} className="font-medium text-slate-900 hover:underline">{nombreCompleto(e)}</Link>
                                                    </div>
                                                    {e.estado === 'justificado' ? (
                                                        <span className="pl-9 sm:pl-0"><Insignia tono="azul">Justificado</Insignia></span>
                                                    ) : (
                                                        <div className="flex items-center gap-2 pl-9 sm:pl-0">
                                                            <div role="radiogroup" aria-label={`Asistencia de ${nombreCompleto(e)}`} className="flex gap-1.5">
                                                                {OPCIONES.map(o => {
                                                                    const marcado = marcas[e.id] === o.estado
                                                                    return (
                                                                        <button key={o.estado} type="button" role="radio" aria-checked={marcado}
                                                                            onClick={() => setMarcas({ ...marcas, [e.id]: o.estado })}
                                                                            className={`h-11 min-w-[44px] rounded-xl px-3 text-sm font-bold ring-1 transition-colors ${marcado ? o.activo : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
                                                                            <span aria-hidden="true" className="sm:hidden">{o.corto}</span>
                                                                            <span className="sr-only sm:not-sr-only">{ESTADOS_ASISTENCIA[o.estado]}</span>
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                            {esAdmin && e.asistenciaId && ['ausente', 'atraso'].includes(e.estado) && (
                                                                <button type="button" className="btn-fantasma btn-sm" onClick={() => setJustificando({ id: e.asistenciaId, estado: e.estado, fecha: lista.datos.fecha, nombre: nombreCompleto(e) })}>Justificar</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:shadow-suave">
                                        <p className="text-sm text-slate-700" aria-live="polite">
                                            {OPCIONES.map(o => `${ESTADOS_ASISTENCIA[o.estado]}: ${conteo[o.estado] ?? 0}`).join(' · ')}{sinMarcar ? ` · Sin marcar: ${sinMarcar}` : ''}
                                        </p>
                                        <Boton onClick={guardar} cargando={guardando}>Guardar asistencia</Boton>
                                    </div>
                                </>
                            )}
                        </Contenido>
                    )}
                </>
            )}
            <ModalJustificar registro={justificando} alCerrar={() => setJustificando(null)} alGuardar={() => { setJustificando(null); lista.recargar({ silencioso: true }) }} />
        </>
    )
}

export default Asistencia
