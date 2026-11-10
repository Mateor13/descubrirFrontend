import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'
import { PencilSquareIcon, TrashIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { academico, evaluaciones as api, estudiantes as apiEstudiantes } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { useSesion } from '../../context/Sesion'
import { usePeriodo } from '../../context/Periodo'
import { Encabezado, Insignia, Pestanas, Aviso } from '../../componentes/ui/Pagina'
import { Modal, PieModal, Confirmar } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio, Cargando, ErrorCarga } from '../../componentes/ui/Estados'
import { comprimirImagen } from '../../lib/imagen'
import { VerEvidencia } from '../../componentes/ui/Evidencia'
import { TIPOS_EVALUACION, TIPO_SINGULAR, aISO, fecha, hoyISO, nombreCompleto } from '../../lib/formato'

const TONO_TIPO = { deber: 'azul', taller: 'verde', prueba: 'ambar', examen: 'morado' }

const FormularioEvaluacion = ({ claseId, evaluacion, alGuardar, alCancelar }) => {
    const nueva = !evaluacion
    const [form, setForm] = useState({
        tipo: evaluacion?.tipo ?? 'deber', titulo: evaluacion?.titulo ?? '', descripcion: evaluacion?.descripcion ?? '',
        fecha: evaluacion ? aISO(evaluacion.fecha) : hoyISO()
    })
    const [archivo, setArchivo] = useState(null)
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)
    const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const guardar = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            const evidencia = archivo && await comprimirImagen(archivo)
            if (evidencia && evidencia.size > 10 * 1024 * 1024) { setErrores({ evidencia: 'La imagen supera los 10 MB' }); return }
            const datos = new FormData()
            Object.entries(form).forEach(([k, v]) => { if (nueva ? v !== '' : v !== (k === 'fecha' ? aISO(evaluacion.fecha) : evaluacion[k] ?? '')) datos.append(k, k === 'titulo' ? v.trim() : v) })
            if (evidencia) datos.append('evidencia', evidencia)
            const resultado = nueva ? await api.crear(claseId, datos) : await api.actualizar(evaluacion.id, datos)
            toast.success(nueva ? 'Evaluación creada' : 'Evaluación actualizada')
            alGuardar(resultado)
        } catch (err) {
            setErrores(erroresPorCampo(err))
            toast.error(mensajeError(err))
        } finally { setGuardando(false) }
    }

    return (
        <form onSubmit={guardar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Tipo" como="select" name="tipo" value={form.tipo} onChange={cambiar}>
                    {Object.entries(TIPO_SINGULAR).map(([t, n]) => <option key={t} value={t}>{n}</option>)}
                </Campo>
                <Campo etiqueta="Fecha" type="date" name="fecha" required max={hoyISO()} value={form.fecha} onChange={cambiar} error={errores.fecha} />
            </div>
            <Campo etiqueta="Título" name="titulo" required minLength={2} maxLength={100} value={form.titulo} onChange={cambiar} error={errores.titulo} placeholder="Ej.: Lectura comprensiva, capítulo 3" />
            <Campo etiqueta="Descripción" como="textarea" rows={3} name="descripcion" opcional maxLength={500} value={form.descripcion} onChange={cambiar} error={errores.descripcion} />
            <Campo etiqueta="Evidencia (imagen)" type="file" accept="image/jpeg,image/png,image/webp,image/gif" opcional onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                error={errores.evidencia} ayuda={evaluacion?.evidenciaUrl ? 'Ya tiene una evidencia; si sube otra, la reemplaza.' : 'JPG, PNG, WEBP o GIF. Las fotos grandes se comprimen automáticamente.'}
                className="[&_input]:py-2 [&_input]:file:mr-3 [&_input]:file:rounded-lg [&_input]:file:border-0 [&_input]:file:bg-verde-100 [&_input]:file:px-3 [&_input]:file:py-1.5 [&_input]:file:font-semibold [&_input]:file:text-verde-800" />
            <PieModal>
                <button type="button" className="btn-secundario" onClick={alCancelar}>Cancelar</button>
                <Boton type="submit" cargando={guardando}>{nueva ? 'Crear evaluación' : 'Guardar'}</Boton>
            </PieModal>
        </form>
    )
}

const Evaluaciones = ({ clase, editable }) => {
    const [tipo, setTipo] = useState('')
    const carga = useCarga(() => api.listar(clase.id, tipo || undefined), [clase.id, tipo])
    const [modal, setModal] = useState(null)
    const [eliminando, setEliminando] = useState(false)

    const eliminar = async () => {
        setEliminando(true)
        try {
            await api.eliminar(modal.evaluacion.id)
            toast.success('Evaluación eliminada')
            setModal(null)
            carga.recargar({ silencioso: true })
        } catch (err) { toast.error(mensajeError(err)) } finally { setEliminando(false) }
    }

    return (
        <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Pestanas pestanas={[{ id: '', titulo: 'Todas' }, ...Object.entries(TIPOS_EVALUACION).map(([id, titulo]) => ({ id, titulo }))]} activa={tipo} alCambiar={setTipo} />
                {editable && <button type="button" className="btn-primario mb-6 shrink-0" onClick={() => setModal({ tipo: 'form' })}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nueva evaluación</button>}
            </div>
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="Aún no hay evaluaciones">{editable ? 'Cree la primera evaluación para registrar calificaciones.' : null}</Vacio></div>}>
                {(lista) => (
                    <ul className="space-y-3">
                        {[...lista].reverse().map(ev => (
                            <li key={ev.id} className="tarjeta flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Insignia tono={TONO_TIPO[ev.tipo]}>{TIPO_SINGULAR[ev.tipo]}</Insignia>
                                        <span className="text-sm text-slate-600">{fecha(ev.fecha)}</span>
                                    </div>
                                    <p className="mt-1 font-semibold text-slate-900">{ev.titulo}</p>
                                    {ev.descripcion && <p className="text-sm text-slate-600">{ev.descripcion}</p>}
                                    {ev.evidenciaUrl && <VerEvidencia url={ev.evidenciaUrl} titulo={ev.titulo} className="enlace mt-1 inline-flex items-center gap-1 text-sm" />}
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <Link to={`/app/evaluaciones/${ev.id}`} className="btn-primario btn-sm"><ClipboardDocumentListIcon className="h-4 w-4" aria-hidden="true" />{editable ? 'Calificar' : 'Ver notas'}</Link>
                                    {editable && <button type="button" className="btn-secundario btn-sm" onClick={() => setModal({ tipo: 'form', evaluacion: ev })} aria-label={`Editar ${ev.titulo}`}><PencilSquareIcon className="h-4 w-4" aria-hidden="true" /><span className="sm:sr-only">Editar</span></button>}
                                    {editable && <button type="button" className="btn-fantasma btn-sm text-red-700 hover:bg-red-50" onClick={() => setModal({ tipo: 'eliminar', evaluacion: ev })} aria-label={`Eliminar ${ev.titulo}`}><TrashIcon className="h-4 w-4" aria-hidden="true" /><span className="sm:sr-only">Eliminar</span></button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Contenido>
            <Modal abierto={modal?.tipo === 'form'} alCerrar={() => setModal(null)} titulo={modal?.evaluacion ? 'Editar evaluación' : 'Nueva evaluación'} descripcion={`${clase.asignatura.nombre} · ${clase.curso.nombre}`}>
                {modal?.tipo === 'form' && <FormularioEvaluacion claseId={clase.id} evaluacion={modal.evaluacion} alCancelar={() => setModal(null)} alGuardar={() => { setModal(null); carga.recargar({ silencioso: true }) }} />}
            </Modal>
            <Confirmar abierto={modal?.tipo === 'eliminar'} alCerrar={() => setModal(null)} titulo="¿Eliminar la evaluación?" textoConfirmar="Eliminar" cargando={eliminando} alConfirmar={eliminar}>
                Se borrarán “{modal?.evaluacion?.titulo}” y todas sus calificaciones. Esta acción no se puede deshacer.
            </Confirmar>
        </>
    )
}

const EstudiantesClase = ({ clase }) => {
    const { periodoConsulta } = usePeriodo()
    const carga = useCarga(() => apiEstudiantes.delCurso(clase.curso.id, periodoConsulta), [clase.curso.id, periodoConsulta])
    return (
        <div className="tarjeta overflow-hidden">
            <Contenido carga={carga} vacio={<Vacio titulo="No hay estudiantes matriculados" />}>
                {(lista) => (
                    <ul className="divide-y divide-slate-100">
                        {lista.map((e, i) => (
                            <li key={e.id}>
                                <Link to={`/app/estudiantes/${e.id}`} className="flex min-h-[52px] items-center gap-3 px-4 hover:bg-verde-50">
                                    <span className="w-6 text-right text-sm text-slate-500">{i + 1}</span>
                                    <span className="font-medium text-slate-900">{nombreCompleto(e)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Contenido>
        </div>
    )
}

const Clase = () => {
    const { claseId } = useParams()
    const { tieneRol } = useSesion()
    const { periodoConsulta, editable } = usePeriodo()
    const carga = useCarga(async () => {
        const clases = await academico.clases({ periodo: periodoConsulta })
        return clases.find(c => c.id === claseId) ?? null
    }, [claseId, periodoConsulta])
    const [pestana, setPestana] = useState('evaluaciones')
    const volver = tieneRol('admin') ? { a: '/app/clases', texto: 'Clases y docentes' } : { a: '/app/mis-clases', texto: 'Mis clases' }

    if (carga.cargando && carga.datos == null) return <Cargando />
    if (carga.error) return <ErrorCarga mensaje={carga.error} reintentar={carga.recargar} />
    if (!carga.datos) return <><Encabezado titulo="Clase no encontrada" volver={volver} /><div className="tarjeta"><Vacio titulo="Esta clase no existe en el periodo seleccionado" /></div></>
    const clase = carga.datos
    return (
        <>
            <Encabezado titulo={clase.asignatura.nombre} descripcion={`${clase.curso.nombre} · Docente: ${clase.profesor.nombre} ${clase.profesor.apellido}`} volver={volver}
                acciones={editable && <Link to={`/app/asistencia?curso=${clase.curso.id}`} className="btn-secundario">Tomar asistencia</Link>} />
            {!editable && <Aviso tono="morado">Periodo en solo lectura: puede consultar, pero no modificar evaluaciones ni notas.</Aviso>}
            <Pestanas pestanas={[{ id: 'evaluaciones', titulo: 'Evaluaciones' }, { id: 'estudiantes', titulo: 'Estudiantes' }]} activa={pestana} alCambiar={setPestana} />
            {pestana === 'evaluaciones' ? <Evaluaciones clase={clase} editable={editable} /> : <EstudiantesClase clase={clase} />}
        </>
    )
}

export default Clase
