import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'
import { periodos as api, academico, estudiantes as apiEstudiantes } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { usePeriodo } from '../../context/Periodo'
import { useCarga } from '../../hooks/useCarga'
import { Encabezado, Insignia, Tabla, Aviso } from '../../componentes/ui/Pagina'
import { Modal, PieModal, Confirmar } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Cargando, Vacio } from '../../componentes/ui/Estados'
import { ESTADOS_PERIODO, NIVELES, TIPOS_EVALUACION, aISO, fecha, nombreCompleto } from '../../lib/formato'

const TONO_ESTADO = { activo: 'verde', planificado: 'azul', cerrado: 'gris' }

const siguienteNombre = (periodos) => {
    const anios = periodos.map(p => Number(p.nombre.split('-')[1])).filter(Boolean)
    const inicio = anios.length ? Math.max(...anios) : new Date().getFullYear()
    return `${inicio}-${inicio + 1}`
}

const FormularioPeriodo = ({ periodo, sugerido, alGuardar, alCancelar }) => {
    const nuevo = !periodo
    const [form, setForm] = useState({
        nombre: sugerido ?? '', inicio: '', fin: aISO(periodo?.fin),
        notaMinima: periodo?.notaMinima ?? 7, nivelMinimoReprobacion: periodo?.nivelMinimoReprobacion ?? 5,
        ponderaciones: { deber: 25, taller: 25, prueba: 25, examen: 25, ...periodo?.ponderaciones }
    })
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)
    const suma = Object.values(form.ponderaciones).reduce((a, b) => a + (Number(b) || 0), 0)

    const guardar = async (e) => {
        e.preventDefault()
        if (Math.abs(suma - 100) > 1e-9) { setErrores({ ponderaciones: 'Las ponderaciones deben sumar 100%' }); return }
        const datos = {
            ponderaciones: Object.fromEntries(Object.entries(form.ponderaciones).map(([k, v]) => [k, Number(v)])),
            notaMinima: Number(form.notaMinima),
            nivelMinimoReprobacion: Number(form.nivelMinimoReprobacion),
            ...(form.fin && { fin: form.fin })
        }
        setGuardando(true)
        try {
            const resultado = nuevo
                ? await api.crear({ nombre: form.nombre.trim(), inicio: form.inicio, ...datos })
                : await api.configurar(periodo.id, datos)
            toast.success(nuevo ? `Periodo ${resultado.nombre} creado` : 'Configuración guardada')
            alGuardar()
        } catch (err) {
            setErrores(erroresPorCampo(err))
            toast.error(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={guardar} className="space-y-4">
            {nuevo && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Nombre" required pattern="\d{4}-\d{4}" placeholder="2026-2027" ayuda="Formato AAAA-AAAA" value={form.nombre} error={errores.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                    <Campo etiqueta="Fecha de inicio" type="date" required value={form.inicio} error={errores.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} />
                </div>
            )}
            <Campo etiqueta="Fecha de fin" type="date" opcional value={form.fin} error={errores.fin} ayuda="Al llegar esta fecha el periodo se cierra automáticamente."
                onChange={(e) => setForm({ ...form, fin: e.target.value })} />
            <fieldset>
                <legend className="etiqueta">Ponderaciones del promedio final</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Object.entries(TIPOS_EVALUACION).map(([tipo, nombre]) => (
                        <Campo key={tipo} etiqueta={`${nombre} (%)`} type="number" min="0" max="100" step="1" required inputMode="numeric"
                            value={form.ponderaciones[tipo]} onChange={(e) => setForm({ ...form, ponderaciones: { ...form.ponderaciones, [tipo]: e.target.value } })} />
                    ))}
                </div>
                <p className={`mt-2 text-sm font-medium ${Math.abs(suma - 100) < 1e-9 ? 'text-verde-700' : 'text-red-700'}`} aria-live="polite">
                    Total: {suma}% {Math.abs(suma - 100) < 1e-9 ? '✓' : '(debe sumar 100%)'}
                </p>
                {errores.ponderaciones && <p className="text-sm text-red-700">{errores.ponderaciones}</p>}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nota mínima para aprobar" type="number" min="0" max="10" step="0.01" required value={form.notaMinima}
                    onChange={(e) => setForm({ ...form, notaMinima: e.target.value })} />
                <Campo etiqueta="Se puede reprobar desde" como="select" value={form.nivelMinimoReprobacion}
                    ayuda="En los niveles anteriores todos los estudiantes son promovidos."
                    onChange={(e) => setForm({ ...form, nivelMinimoReprobacion: e.target.value })}>
                    {NIVELES.map((n, i) => <option key={n} value={i + 1}>{n} de básica</option>)}
                </Campo>
            </div>
            <PieModal>
                <button type="button" className="btn-secundario" onClick={alCancelar}>Cancelar</button>
                <Boton type="submit" cargando={guardando}>{nuevo ? 'Crear periodo' : 'Guardar'}</Boton>
            </PieModal>
        </form>
    )
}

// ---------- Promoción de año (por partes, con barra de progreso) ----------
const esperar = (ms) => new Promise(r => setTimeout(r, ms))

const VistaPrevia = ({ origen }) => {
    const cursos = useCarga(() => academico.cursos(), [])
    const [curso, setCurso] = useState('')
    const vista = useCarga(async () => {
        const [resultado, lista] = await Promise.all([api.vistaPrevia(origen.id, curso), apiEstudiantes.delCurso(curso, origen.id)])
        const nombres = new Map(lista.map(e => [e.id, nombreCompleto(e)]))
        return resultado.map(r => ({ ...r, id: r.estudiante, nombre: nombres.get(r.estudiante) ?? 'Estudiante' })).sort((a, b) => a.nombre.localeCompare(b.nombre))
    }, [curso], { activo: Boolean(curso) })

    return (
        <details className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <summary className="cursor-pointer font-semibold text-slate-800">Vista previa por curso (no guarda nada)</summary>
            <Campo etiqueta="Curso" como="select" className="mt-3" value={curso} onChange={(e) => setCurso(e.target.value)}>
                <option value="">Seleccione un curso…</option>
                {(cursos.datos ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Campo>
            {vista.cargando && <Cargando className="py-4" />}
            {vista.error && <p className="mt-3 text-sm text-red-700">{vista.error}</p>}
            {vista.datos && (vista.datos.length === 0
                ? <p className="mt-3 text-sm text-slate-600">No hay estudiantes en este curso.</p>
                : (
                    <ul className="mt-3 max-h-64 divide-y divide-slate-200 overflow-y-auto rounded-lg bg-white text-sm ring-1 ring-slate-200">
                        {vista.datos.map(r => (
                            <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2">
                                <span>{r.nombre}</span>
                                {r.aprueba
                                    ? <Insignia tono="verde">{r.nivelDestino ? `Pasa a ${NIVELES[r.nivelDestino - 1]}` : 'Egresa'}</Insignia>
                                    : <Insignia tono="rojo">Repite ({r.clasesReprobadas} {r.clasesReprobadas === 1 ? 'materia' : 'materias'})</Insignia>}
                            </li>
                        ))}
                    </ul>
                ))}
        </details>
    )
}

const Promocion = ({ origen, periodos, alTerminar }) => {
    const destinos = periodos.filter(p => p.id !== origen.id && p.estado !== 'cerrado')
    const [destino, setDestino] = useState(destinos[0]?.id ?? '')
    const [copiarClases, setCopiarClases] = useState(true)
    const [proceso, setProceso] = useState(null)
    const [trabajando, setTrabajando] = useState(false)
    const [error, setError] = useState('')
    const cancelado = useRef(false)

    // ¿Ya hay un proceso iniciado (por ejemplo, desde otra pestaña o interrumpido)?
    useEffect(() => {
        cancelado.current = false
        api.estadoPromocion(origen.id).then(setProceso).catch(() => setProceso(null))
        return () => { cancelado.current = true }
    }, [origen.id])

    const avanzar = async (estado) => {
        let actual = estado
        setProceso(actual)
        while (actual.estado !== 'completado' && !cancelado.current) {
            try {
                actual = await api.procesarPromocion(origen.id)
                setProceso(actual)
            } catch (err) {
                // 409: otra petición está procesando; se reintenta en unos segundos
                if (err.response?.status === 409) { await esperar(3000); continue }
                throw err
            }
        }
        return actual
    }

    const iniciar = async () => {
        setError('')
        setTrabajando(true)
        try {
            const inicial = proceso?.estado === 'en_progreso' ? proceso : await api.iniciarPromocion(origen.id, { destino: proceso?.destino ?? destino, copiarClases })
            const final = await avanzar(inicial)
            if (final.estado === 'completado') { toast.success('Promoción completada'); alTerminar() }
        } catch (err) {
            setError(mensajeError(err))
        } finally {
            setTrabajando(false)
        }
    }

    const porcentaje = proceso?.total ? Math.round((proceso.procesados / proceso.total) * 100) : proceso?.estado === 'completado' ? 100 : 0
    const r = proceso?.resumen

    return (
        <div className="space-y-5">
            <p className="text-sm text-slate-700">
                Matricula a los estudiantes de <strong>{origen.nombre}</strong> en el periodo de destino: quienes aprueban pasan al siguiente nivel,
                quienes reprueban repiten y los de séptimo aprobado egresan. Se puede repetir sin duplicar matrículas.
            </p>
            {!proceso && (
                destinos.length === 0
                    ? <Aviso titulo="No hay periodo de destino">Cree primero el periodo siguiente (quedará como planificado).</Aviso>
                    : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Campo etiqueta="Periodo de destino" como="select" value={destino} onChange={(e) => setDestino(e.target.value)}>
                                {destinos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({ESTADOS_PERIODO[p.estado].toLowerCase()})</option>)}
                            </Campo>
                            <label className="flex items-center gap-3 self-end rounded-xl p-2 text-sm">
                                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-verde-700 focus:ring-verde-600" checked={copiarClases} onChange={(e) => setCopiarClases(e.target.checked)} />
                                Copiar la planta docente (clases) al nuevo periodo
                            </label>
                        </div>
                    )
            )}
            {!proceso && <VistaPrevia origen={origen} />}
            {proceso && (
                <div className="rounded-xl bg-verde-50 p-4 ring-1 ring-verde-100">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span>{proceso.estado === 'completado' ? 'Promoción completada' : trabajando ? 'Procesando cursos…' : 'Promoción en progreso (pausada)'}</span>
                        <span>{proceso.procesados} / {proceso.total} cursos</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-white ring-1 ring-verde-200" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de la promoción">
                        <div className="h-full rounded-full bg-verde-600 transition-all" style={{ width: `${porcentaje}%` }} />
                    </div>
                    {r && (
                        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                            {[['Promovidos', r.promovidos], ['Repiten', r.repiten], ['Egresados', r.egresados], ['Ya matriculados', r.yaMatriculados], ['Clases copiadas', r.clasesCopiadas]].map(([k, v]) => (
                                <div key={k} className="rounded-lg bg-white p-2 text-center ring-1 ring-verde-100"><dt className="text-xs text-slate-600">{k}</dt><dd className="text-lg font-bold text-verde-800">{v}</dd></div>
                            ))}
                        </dl>
                    )}
                </div>
            )}
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
            {proceso?.estado !== 'completado' && (destinos.length > 0 || proceso) && (
                <div className="flex justify-end">
                    <Boton variante="acento" cargando={trabajando} onClick={iniciar}>
                        {proceso?.estado === 'en_progreso' ? 'Continuar promoción' : 'Iniciar promoción'}
                    </Boton>
                </div>
            )}
        </div>
    )
}

const Periodos = () => {
    const { periodos, activo, recargar, cargando } = usePeriodo()
    const [modal, setModal] = useState(null) // { tipo: 'crear'|'configurar'|'promover'|'activar'|'cerrar', periodo }
    const [procesando, setProcesando] = useState(false)
    const cerrarModal = () => setModal(null)
    const sugerido = useMemo(() => siguienteNombre(periodos), [periodos])

    const cambiarEstado = async () => {
        setProcesando(true)
        try {
            const p = modal.tipo === 'activar' ? await api.activar(modal.periodo.id) : await api.cerrar(modal.periodo.id)
            toast.success(`Periodo ${p.nombre} ${p.estado === 'activo' ? 'activado' : 'cerrado'}`)
            cerrarModal()
            recargar()
        } catch (err) {
            toast.error(mensajeError(err))
        } finally {
            setProcesando(false)
        }
    }

    const columnas = [
        { titulo: 'Periodo', render: p => <span className="font-semibold">{p.nombre}</span> },
        { titulo: 'Estado', render: p => <Insignia tono={TONO_ESTADO[p.estado]}>{ESTADOS_PERIODO[p.estado]}</Insignia> },
        { titulo: 'Fechas', render: p => <span className="text-slate-700">{fecha(p.inicio)} – {p.fin ? fecha(p.fin) : 'sin fin'}</span> },
        { titulo: 'Ponderaciones', render: p => <span className="text-slate-700">{Object.keys(TIPOS_EVALUACION).map(t => p.ponderaciones?.[t] ?? 0).join(' / ')}</span> },
        { titulo: 'Nota mín.', render: p => p.notaMinima },
        {
            titulo: 'Acciones', clase: 'text-right', render: p => (
                <div className="flex flex-wrap justify-end gap-2">
                    {p.estado !== 'cerrado' && <button type="button" className="btn-secundario btn-sm" onClick={() => setModal({ tipo: 'configurar', periodo: p })}>Configurar</button>}
                    {p.estado === 'planificado' && !activo && <button type="button" className="btn-primario btn-sm" onClick={() => setModal({ tipo: 'activar', periodo: p })}>Activar</button>}
                    {p.estado === 'activo' && <button type="button" className="btn-peligro btn-sm" onClick={() => setModal({ tipo: 'cerrar', periodo: p })}>Cerrar</button>}
                    {p.estado === 'cerrado' && <button type="button" className="btn-acento btn-sm" onClick={() => setModal({ tipo: 'promover', periodo: p })}>Promoción</button>}
                </div>
            )
        }
    ]

    return (
        <>
            <Encabezado
                titulo="Periodos lectivos"
                descripcion="Solo puede haber un periodo activo. Al cerrarlo ya no admite cambios y se habilita la promoción de año."
                acciones={<button type="button" className="btn-primario" onClick={() => setModal({ tipo: 'crear' })}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nuevo periodo</button>}
            />
            <div className="tarjeta overflow-hidden">
                {cargando ? <Cargando /> : periodos.length === 0
                    ? <Vacio titulo="Aún no hay periodos">Cree el primer periodo lectivo y actívelo para empezar.</Vacio>
                    : <Tabla columnas={columnas} filas={periodos} etiqueta="Periodos lectivos" />}
            </div>

            <Modal abierto={modal?.tipo === 'crear' || modal?.tipo === 'configurar'} alCerrar={cerrarModal}
                titulo={modal?.tipo === 'crear' ? 'Nuevo periodo lectivo' : `Configurar ${modal?.periodo?.nombre}`}
                descripcion={modal?.tipo === 'crear' ? 'Se crea como planificado; actívelo cuando empiece el año.' : undefined} ancho="max-w-2xl">
                {(modal?.tipo === 'crear' || modal?.tipo === 'configurar') && (
                    <FormularioPeriodo periodo={modal.periodo} sugerido={sugerido} alCancelar={cerrarModal} alGuardar={() => { cerrarModal(); recargar() }} />
                )}
            </Modal>

            <Modal abierto={modal?.tipo === 'promover'} alCerrar={cerrarModal} titulo={`Promoción de año · ${modal?.periodo?.nombre ?? ''}`} ancho="max-w-2xl">
                {modal?.tipo === 'promover' && <Promocion origen={modal.periodo} periodos={periodos} alTerminar={recargar} />}
            </Modal>

            <Confirmar abierto={modal?.tipo === 'activar' || modal?.tipo === 'cerrar'} alCerrar={cerrarModal} cargando={procesando} alConfirmar={cambiarEstado}
                titulo={modal?.tipo === 'activar' ? `¿Activar ${modal?.periodo?.nombre}?` : `¿Cerrar ${modal?.periodo?.nombre}?`}
                textoConfirmar={modal?.tipo === 'activar' ? 'Activar' : 'Cerrar periodo'} variante={modal?.tipo === 'activar' ? 'primario' : 'peligro'}>
                {modal?.tipo === 'activar'
                    ? 'Las notas, la asistencia y las matrículas nuevas se registrarán en este periodo.'
                    : 'Un periodo cerrado ya no admite cambios en notas, asistencia ni matrículas. Esta acción no se puede deshacer.'}
            </Confirmar>
        </>
    )
}

export default Periodos
