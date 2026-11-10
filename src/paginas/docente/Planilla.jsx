import { useEffect, useMemo, useState } from 'react'
import { useBlocker, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { evaluaciones as api } from '../../api/v2'
import { mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { usePeriodo } from '../../context/Periodo'
import { Encabezado, Insignia, Aviso } from '../../componentes/ui/Pagina'
import { Boton } from '../../componentes/ui/Boton'
import { Cargando, ErrorCarga, Vacio } from '../../componentes/ui/Estados'
import { Confirmar } from '../../componentes/ui/Modal'
import { TIPO_SINGULAR, fecha, nombreCompleto, nota } from '../../lib/formato'

const aTexto = (n) => (typeof n === 'number' ? String(n) : '')
const valida = (t) => t === '' || (/^\d{1,2}([.,]\d{1,2})?$/.test(t) && Number(t.replace(',', '.')) <= 10)

// Planilla de calificaciones: una fila por estudiante del curso; se guarda todo de una vez
const Planilla = () => {
    const { id } = useParams()
    const { editable, seleccionado } = usePeriodo()
    const carga = useCarga(() => api.planilla(id), [id])
    const [notas, setNotas] = useState({})
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (carga.datos) setNotas(Object.fromEntries(carga.datos.estudiantes.map(e => [e.id, aTexto(e.nota)])))
    }, [carga.datos])

    const originales = useMemo(() => Object.fromEntries((carga.datos?.estudiantes ?? []).map(e => [e.id, aTexto(e.nota)])), [carga.datos])
    const cambios = Object.entries(notas).filter(([k, v]) => v !== originales[k] && v !== '')
    const invalidas = Object.entries(notas).filter(([, v]) => !valida(v)).map(([k]) => k)
    const pendientes = cambios.length > 0
    const bloqueo = useBlocker(({ currentLocation, nextLocation }) => pendientes && currentLocation.pathname !== nextLocation.pathname)

    useEffect(() => {
        if (!pendientes) return undefined
        const avisar = (e) => { e.preventDefault(); e.returnValue = '' }
        window.addEventListener('beforeunload', avisar)
        return () => window.removeEventListener('beforeunload', avisar)
    }, [pendientes])

    const guardar = async (e) => {
        e.preventDefault()
        if (invalidas.length) { toast.error('Corrija las notas marcadas: deben estar entre 0 y 10'); return }
        if (!cambios.length) { toast.info('No hay cambios para guardar'); return }
        setGuardando(true)
        try {
            const { registradas } = await api.calificar(id, cambios.map(([estudiante, v]) => ({ estudiante, nota: Number(v.replace(',', '.')) })))
            toast.success(`${registradas} calificación(es) guardada(s)`)
            await carga.recargar({ silencioso: true })
        } catch (err) { toast.error(mensajeError(err)) } finally { setGuardando(false) }
    }

    if (carga.cargando && !carga.datos) return <Cargando />
    if (carga.error && !carga.datos) return <ErrorCarga mensaje={carga.error} reintentar={carga.recargar} />
    const { evaluacion, estudiantes } = carga.datos
    const conNota = estudiantes.filter(e => typeof e.nota === 'number')
    const promedio = conNota.length ? conNota.reduce((a, e) => a + e.nota, 0) / conNota.length : null
    const minima = seleccionado?.notaMinima ?? 7

    return (
        <>
            <Encabezado titulo={evaluacion.titulo} volver={{ a: `/app/clases/${evaluacion.clase}`, texto: 'Volver a la clase' }}
                descripcion={<span className="flex flex-wrap items-center gap-2"><Insignia tono="verde">{TIPO_SINGULAR[evaluacion.tipo]}</Insignia>{fecha(evaluacion.fecha)}</span>} />
            {!editable && <Aviso tono="morado">Periodo en solo lectura: no se pueden modificar las notas.</Aviso>}
            <dl className="mb-4 grid grid-cols-3 gap-3">
                <div className="tarjeta p-4"><dt className="text-sm text-slate-600">Estudiantes</dt><dd className="text-2xl font-extrabold">{estudiantes.length}</dd></div>
                <div className="tarjeta p-4"><dt className="text-sm text-slate-600">Con nota</dt><dd className="text-2xl font-extrabold">{conNota.length}</dd></div>
                <div className="tarjeta p-4"><dt className="text-sm text-slate-600">Promedio</dt><dd className="text-2xl font-extrabold">{nota(promedio)}</dd></div>
            </dl>
            {estudiantes.length === 0 ? <div className="tarjeta"><Vacio titulo="El curso no tiene estudiantes matriculados" /></div> : (
                <form onSubmit={guardar}>
                    <div className="tarjeta overflow-hidden">
                        <ul className="divide-y divide-slate-100">
                            {estudiantes.map((e, i) => {
                                const valor = notas[e.id] ?? ''
                                const error = !valida(valor)
                                const n = Number(valor.replace(',', '.'))
                                return (
                                    <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <span className="w-6 shrink-0 text-right text-sm text-slate-500">{i + 1}</span>
                                        <label htmlFor={`nota-${e.id}`} className="min-w-0 flex-1">
                                            <span className="block truncate font-medium text-slate-900">{nombreCompleto(e)}</span>
                                            {valor !== originales[e.id] && <span className="text-xs font-medium text-morado-700">{valor === '' ? 'Sin cambios (no se borra la nota)' : 'Cambio sin guardar'}</span>}
                                        </label>
                                        <input
                                            id={`nota-${e.id}`} inputMode="decimal" autoComplete="off" placeholder="—" disabled={!editable}
                                            value={valor} onChange={(ev) => setNotas({ ...notas, [e.id]: ev.target.value.trim() })}
                                            onFocus={(ev) => ev.target.select()}
                                            aria-invalid={error} aria-describedby={error ? `error-${e.id}` : undefined}
                                            className={`control w-24 text-center text-lg font-semibold ${error ? 'control-error' : valor !== '' && n < minima ? 'text-red-700' : 'text-verde-800'}`}
                                        />
                                        {error && <span id={`error-${e.id}`} className="sr-only">Nota no válida: debe estar entre 0 y 10</span>}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    {editable && (
                        <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:shadow-suave">
                            <p className="text-sm text-slate-700" aria-live="polite">{pendientes ? `${cambios.length} cambio(s) sin guardar` : 'Todo guardado'}</p>
                            <Boton type="submit" cargando={guardando} disabled={!pendientes}>Guardar notas</Boton>
                        </div>
                    )}
                </form>
            )}
            <Confirmar abierto={bloqueo.state === 'blocked'} alCerrar={() => bloqueo.reset?.()} titulo="¿Salir sin guardar?" textoConfirmar="Salir sin guardar" alConfirmar={() => bloqueo.proceed?.()}>
                Tiene {cambios.length} nota(s) sin guardar. Si sale ahora, se perderán.
            </Confirmar>
        </>
    )
}

export default Planilla
