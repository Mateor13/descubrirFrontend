import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PrinterIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { academico, asistencias as apiAsistencias, estudiantes as api } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { useSesion } from '../../context/Sesion'
import { usePeriodo } from '../../context/Periodo'
import { Encabezado, Insignia, Pestanas, Aviso } from '../../componentes/ui/Pagina'
import { Modal, PieModal, Confirmar } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio, Cargando, ErrorCarga } from '../../componentes/ui/Estados'
import { InsigniaMatricula, SelectorRepresentantes } from '../admin/Estudiantes'
import { ESTADOS_ASISTENCIA, TIPOS_EVALUACION, TIPO_SINGULAR, fecha, fechaHora, nombreCompleto, nota } from '../../lib/formato'

// ---------- Calificaciones (boletín) ----------
const colorNota = (n, minima) => (typeof n !== 'number' ? 'text-slate-500' : n < minima ? 'text-red-700' : 'text-verde-800')

const Boletin = ({ id }) => {
    const { periodoConsulta, seleccionado } = usePeriodo()
    const carga = useCarga(() => api.boletin(id, periodoConsulta), [id, periodoConsulta])
    const minima = seleccionado?.notaMinima ?? 7

    if (carga.estado === 404 && !carga.datos) return <Vacio titulo="Sin matrícula en este periodo">No hay calificaciones para mostrar.</Vacio>
    return (
        <Contenido carga={carga}>
            {({ materias, resultado, periodo }) => (
                <div className="space-y-4">
                    <div className={`flex flex-col gap-2 rounded-2xl p-4 ring-1 sm:flex-row sm:items-center sm:justify-between ${resultado.aprueba ? 'bg-verde-100 ring-verde-300' : 'bg-red-50 ring-red-200'}`}>
                        <div>
                            <p className="font-bold text-slate-900">{resultado.aprueba ? 'Aprueba el año' : `Reprueba ${resultado.clasesReprobadas} materia(s)`}</p>
                            <p className="text-sm text-slate-700">{resultado.provisional ? `Resultado provisional: el periodo ${periodo.nombre} aún no se ha cerrado.` : `Resultado final del periodo ${periodo.nombre}.`} Nota mínima: {minima}.</p>
                        </div>
                        <button type="button" className="btn-secundario btn-sm print:hidden" onClick={() => window.print()}><PrinterIcon className="h-4 w-4" aria-hidden="true" />Imprimir</button>
                    </div>
                    {materias.length === 0 && <Vacio titulo="El curso no tiene clases en este periodo" />}
                    {materias.map(({ clase, promedio, evaluaciones }) => (
                        <details key={clase.id} className="tarjeta group overflow-hidden">
                            <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">{clase.asignatura.nombre}</p>
                                    <p className="text-sm text-slate-600">{clase.profesor ? `${clase.profesor.nombre} ${clase.profesor.apellido}` : ''} · {evaluaciones.length} evaluación(es)</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <dl className="hidden gap-3 text-center text-xs sm:flex">
                                        {Object.entries(TIPOS_EVALUACION).map(([tipo, n]) => (
                                            <div key={tipo}><dt className="text-slate-600">{n}</dt><dd className={`font-semibold ${colorNota(promedio.porTipo[tipo], minima)}`}>{nota(promedio.porTipo[tipo])}</dd></div>
                                        ))}
                                    </dl>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-600">Promedio</p>
                                        <p className={`text-2xl font-extrabold ${colorNota(promedio.final, minima)}`}>{nota(promedio.final)}</p>
                                    </div>
                                </div>
                            </summary>
                            <div className="border-t border-slate-100 px-4 pb-4">
                                <dl className="grid grid-cols-4 gap-2 py-3 text-center text-xs sm:hidden">
                                    {Object.entries(TIPOS_EVALUACION).map(([tipo, n]) => (
                                        <div key={tipo}><dt className="text-slate-600">{n}</dt><dd className={`font-semibold ${colorNota(promedio.porTipo[tipo], minima)}`}>{nota(promedio.porTipo[tipo])}</dd></div>
                                    ))}
                                </dl>
                                {evaluaciones.length === 0 ? <p className="py-3 text-sm text-slate-600">Aún no hay evaluaciones.</p> : (
                                    <ul className="divide-y divide-slate-100">
                                        {evaluaciones.map(e => (
                                            <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                                <span className="min-w-0">
                                                    <span className="font-medium">{e.titulo}</span>
                                                    <span className="block text-xs text-slate-600">{TIPO_SINGULAR[e.tipo]} · {fecha(e.fecha)}
                                                        {e.evidenciaUrl && <> · <a href={e.evidenciaUrl} target="_blank" rel="noopener noreferrer" className="enlace inline-flex items-center gap-0.5"><PaperClipIcon className="h-3 w-3" aria-hidden="true" />evidencia</a></>}
                                                    </span>
                                                </span>
                                                <span className={`font-bold ${colorNota(e.nota, minima)}`}>{e.nota === null ? 'Sin nota' : nota(e.nota)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </Contenido>
    )
}

// ---------- Asistencia ----------
const TONO_ASISTENCIA = { presente: 'verde', ausente: 'rojo', atraso: 'ambar', justificado: 'azul' }

export const ModalJustificar = ({ registro, alCerrar, alGuardar }) => {
    const [texto, setTexto] = useState('')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)
    const guardar = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            await apiAsistencias.justificar(registro.id, texto.trim())
            toast.success('Inasistencia justificada')
            alGuardar()
        } catch (err) {
            setError(erroresPorCampo(err).justificacion ?? mensajeError(err))
        } finally { setGuardando(false) }
    }
    return (
        <Modal abierto={Boolean(registro)} alCerrar={alCerrar} titulo="Justificar" descripcion={registro ? `${ESTADOS_ASISTENCIA[registro.estado]} del ${fecha(registro.fecha)}${registro.nombre ? ` · ${registro.nombre}` : ''}` : ''} ancho="max-w-md">
            <form onSubmit={guardar}>
                <Campo etiqueta="Motivo" como="textarea" rows={3} required minLength={5} maxLength={300} value={texto} onChange={(e) => setTexto(e.target.value)} error={error}
                    placeholder="Ej.: certificado médico presentado por el representante" />
                <PieModal>
                    <button type="button" className="btn-secundario" onClick={alCerrar}>Cancelar</button>
                    <Boton type="submit" cargando={guardando}>Justificar</Boton>
                </PieModal>
            </form>
        </Modal>
    )
}

const Asistencia = ({ id }) => {
    const { periodoConsulta, editable } = usePeriodo()
    const { tieneRol } = useSesion()
    const carga = useCarga(() => api.asistencias(id, periodoConsulta), [id, periodoConsulta])
    const [justificando, setJustificando] = useState(null)
    return (
        <Contenido carga={carga}>
            {({ resumen, registros }) => (
                <>
                    <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Object.entries(ESTADOS_ASISTENCIA).map(([estado, nombre]) => (
                            <div key={estado} className="tarjeta p-4">
                                <dt className="text-sm text-slate-600">{nombre}</dt>
                                <dd className="text-2xl font-extrabold text-slate-900">{resumen[estado] ?? 0}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="tarjeta overflow-hidden">
                        {registros.length === 0 ? <Vacio titulo="Sin registros de asistencia" /> : (
                            <ul className="divide-y divide-slate-100">
                                {registros.map(r => (
                                    <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-medium">{fecha(r.fecha)}</p>
                                            {r.justificacion && <p className="text-sm text-slate-600">Justificación: {r.justificacion}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Insignia tono={TONO_ASISTENCIA[r.estado]}>{ESTADOS_ASISTENCIA[r.estado]}</Insignia>
                                            {tieneRol('admin') && editable && ['ausente', 'atraso'].includes(r.estado) && (
                                                <button type="button" className="btn-secundario btn-sm" onClick={() => setJustificando(r)}>Justificar</button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <ModalJustificar registro={justificando} alCerrar={() => setJustificando(null)} alGuardar={() => { setJustificando(null); carga.recargar({ silencioso: true }) }} />
                </>
            )}
        </Contenido>
    )
}

// ---------- Observaciones ----------
const Observaciones = ({ id }) => {
    const { periodoConsulta, esHistorico, activo } = usePeriodo()
    const { tieneRol } = useSesion()
    const carga = useCarga(() => api.observaciones(id, periodoConsulta), [id, periodoConsulta])
    const [texto, setTexto] = useState('')
    const [guardando, setGuardando] = useState(false)
    const puedeEscribir = tieneRol('admin', 'profesor') && !esHistorico && activo

    const guardar = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            await api.observar(id, texto.trim())
            setTexto('')
            toast.success('Observación registrada')
            carga.recargar({ silencioso: true })
        } catch (err) { toast.error(mensajeError(err)) } finally { setGuardando(false) }
    }

    return (
        <div className="space-y-4">
            {puedeEscribir && (
                <form onSubmit={guardar} className="tarjeta p-4">
                    <Campo etiqueta="Nueva observación" como="textarea" rows={3} required minLength={5} maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)}
                        ayuda={`${texto.length}/1000 · Visible para la administración, los docentes del curso y los representantes.`} />
                    <div className="mt-3 flex justify-end"><Boton type="submit" cargando={guardando}>Registrar</Boton></div>
                </form>
            )}
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="Sin observaciones en este periodo" /></div>}>
                {(lista) => (
                    <ol className="space-y-3">
                        {lista.map(o => (
                            <li key={o.id} className="tarjeta p-4">
                                <p className="whitespace-pre-line text-slate-800">{o.texto}</p>
                                <p className="mt-2 text-xs text-slate-600">{o.autor ? `${o.autor.nombre} ${o.autor.apellido}` : 'Docente'} · {fechaHora(o.fecha)}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </Contenido>
        </div>
    )
}

// ---------- Datos y matrícula (solo administración) ----------
const Administrar = ({ estudiante, recargar }) => {
    const { activo, editable } = usePeriodo()
    const cursos = useCarga(() => academico.cursos(), [])
    const [datos, setDatos] = useState({ nombre: estudiante.nombre, apellido: estudiante.apellido, cedula: estudiante.cedula })
    const [errores, setErrores] = useState({})
    const [modal, setModal] = useState(null)
    const [valor, setValor] = useState('')
    const [nuevosReps, setNuevosReps] = useState([])
    const [ocupado, setOcupado] = useState(false)

    const ejecutar = async (accion, exito) => {
        setOcupado(true)
        try {
            await accion()
            toast.success(exito)
            setModal(null)
            recargar()
        } catch (err) {
            setErrores(erroresPorCampo(err))
            toast.error(mensajeError(err))
        } finally { setOcupado(false) }
    }

    const guardarDatos = (e) => {
        e.preventDefault()
        const cambios = Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, v.trim()]).filter(([k, v]) => v !== estudiante[k]))
        if (!Object.keys(cambios).length) return toast.info('No hay cambios')
        ejecutar(() => api.actualizar(estudiante.id, cambios), 'Datos actualizados')
    }

    const m = estudiante.matricula
    const opcionesCurso = (cursos.datos ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={guardarDatos} className="tarjeta p-5">
                <h2 className="text-lg font-bold">Datos del estudiante</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Nombres" required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} error={errores.nombre} />
                    <Campo etiqueta="Apellidos" required value={datos.apellido} onChange={(e) => setDatos({ ...datos, apellido: e.target.value })} error={errores.apellido} />
                    <Campo etiqueta="Cédula" required inputMode="numeric" pattern="\d{10}" maxLength={10} value={datos.cedula} onChange={(e) => setDatos({ ...datos, cedula: e.target.value })} error={errores.cedula} />
                </div>
                <div className="mt-5 flex flex-wrap justify-between gap-2">
                    {estudiante.activo && <button type="button" className="btn-fantasma text-red-700 hover:bg-red-50" onClick={() => setModal('desactivar')}>Desactivar estudiante</button>}
                    <Boton type="submit" cargando={ocupado && !modal}>Guardar</Boton>
                </div>
            </form>

            <section className="tarjeta p-5" aria-labelledby="matricula">
                <h2 id="matricula" className="text-lg font-bold">Matrícula</h2>
                {m ? (
                    <>
                        <p className="mt-2 text-slate-700">{m.curso.nombre} · periodo {m.periodo} <InsigniaMatricula estado={m.estado} /></p>
                        {editable && m.estado === 'activa' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button type="button" className="btn-secundario btn-sm" onClick={() => { setValor(m.curso.id); setModal('cambiar') }}>Cambiar de curso</button>
                                <button type="button" className="btn-fantasma btn-sm text-red-700 hover:bg-red-50" onClick={() => setModal('retirar')}>Registrar retiro</button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <p className="mt-2 text-slate-700">Sin matrícula en este periodo.</p>
                        {activo && editable && <button type="button" className="btn-primario btn-sm mt-4" onClick={() => { setValor(''); setModal('matricular') }}>Matricular en {activo.nombre}</button>}
                    </>
                )}
            </section>

            <section className="tarjeta p-5 lg:col-span-2" aria-labelledby="representantes">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="representantes" className="text-lg font-bold">Representantes</h2>
                    <button type="button" className="btn-secundario btn-sm" onClick={() => { setNuevosReps([]); setModal('vincular') }}>Vincular representante</button>
                </div>
                {estudiante.representantes.length === 0 ? <p className="mt-2 text-sm text-slate-600">No tiene representantes vinculados.</p> : (
                    <ul className="mt-3 divide-y divide-slate-100">
                        {estudiante.representantes.map(r => (
                            <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">{nombreCompleto(r)}</p>
                                    <p className="text-sm text-slate-600">{[r.email, r.telefono].filter(Boolean).join(' · ')}</p>
                                </div>
                                <button type="button" className="btn-fantasma btn-sm self-start text-red-700 hover:bg-red-50 sm:self-auto" onClick={() => ejecutar(() => api.desvincular(estudiante.id, r.id), 'Representante desvinculado')}>Desvincular</button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <Modal abierto={modal === 'cambiar' || modal === 'matricular'} alCerrar={() => setModal(null)} titulo={modal === 'cambiar' ? 'Cambiar de curso' : `Matricular en ${activo?.nombre}`} ancho="max-w-md">
                <form onSubmit={(e) => {
                    e.preventDefault()
                    if (modal === 'cambiar') ejecutar(() => api.cambiarCurso(m.id, valor), 'Curso actualizado')
                    else ejecutar(() => api.matricular({ estudiante: estudiante.id, curso: valor }), 'Estudiante matriculado')
                }}>
                    <Campo etiqueta="Curso" como="select" required value={valor} onChange={(e) => setValor(e.target.value)}>
                        <option value="">Seleccione…</option>{opcionesCurso}
                    </Campo>
                    <PieModal>
                        <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
                        <Boton type="submit" cargando={ocupado}>Guardar</Boton>
                    </PieModal>
                </form>
            </Modal>
            <Modal abierto={modal === 'vincular'} alCerrar={() => setModal(null)} titulo="Vincular representantes">
                <SelectorRepresentantes seleccionados={nuevosReps} alCambiar={setNuevosReps} excluir={estudiante.representantes.map(r => r.id)} />
                <PieModal>
                    <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
                    <Boton cargando={ocupado} disabled={!nuevosReps.length}
                        onClick={() => ejecutar(() => Promise.all(nuevosReps.map(rep => api.vincular(estudiante.id, rep))), 'Representante(s) vinculado(s). Se les notificó por correo.')}>Vincular</Boton>
                </PieModal>
            </Modal>
            <Confirmar abierto={modal === 'retirar'} alCerrar={() => setModal(null)} titulo="¿Registrar el retiro?" textoConfirmar="Registrar retiro" cargando={ocupado}
                alConfirmar={() => ejecutar(() => api.retirar(m.id), 'Retiro registrado')}>
                El estudiante dejará de aparecer en las listas del curso. Sus notas y asistencia se conservan.
            </Confirmar>
            <Confirmar abierto={modal === 'desactivar'} alCerrar={() => setModal(null)} titulo="¿Desactivar al estudiante?" textoConfirmar="Desactivar" cargando={ocupado}
                alConfirmar={() => ejecutar(() => api.desactivar(estudiante.id), 'Estudiante desactivado')}>
                No aparecerá en las listas ni podrá matricularse. Su historial se conserva.
            </Confirmar>
        </div>
    )
}

const Estudiante = () => {
    const { id } = useParams()
    const { tieneRol } = useSesion()
    const { periodoConsulta } = usePeriodo()
    const carga = useCarga(() => api.obtener(id, periodoConsulta), [id, periodoConsulta])
    const [pestana, setPestana] = useState('notas')
    const pestanas = [
        { id: 'notas', titulo: 'Calificaciones' },
        { id: 'asistencia', titulo: 'Asistencia' },
        { id: 'observaciones', titulo: 'Observaciones' },
        ...(tieneRol('admin') ? [{ id: 'admin', titulo: 'Datos y matrícula' }] : [])
    ]
    const volver = tieneRol('admin') ? { a: carga.datos?.matricula ? `/app/estudiantes?curso=${carga.datos.matricula.curso.id}` : '/app/estudiantes', texto: 'Estudiantes' }
        : tieneRol('representante') ? { a: '/app/mis-estudiantes', texto: 'Mis estudiantes' } : { a: '/app/mis-clases', texto: 'Mis clases' }

    if (carga.cargando && !carga.datos) return <Cargando />
    if (carga.error && !carga.datos) return <ErrorCarga mensaje={carga.error} reintentar={carga.recargar} />
    const e = carga.datos
    return (
        <>
            <Encabezado titulo={`${e.nombre} ${e.apellido}`} volver={volver}
                descripcion={<span className="flex flex-wrap items-center gap-2">Cédula {e.cedula} · {e.matricula ? <>{e.matricula.curso.nombre} <InsigniaMatricula estado={e.matricula.estado} /></> : 'Sin matrícula en este periodo'}{!e.activo && <Insignia tono="gris">Desactivado</Insignia>}</span>} />
            {!e.activo && <Aviso tono="gris">Este estudiante está desactivado.</Aviso>}
            <Pestanas pestanas={pestanas} activa={pestana} alCambiar={setPestana} />
            <div role="tabpanel">
                {pestana === 'notas' && <Boletin id={id} />}
                {pestana === 'asistencia' && <Asistencia id={id} />}
                {pestana === 'observaciones' && <Observaciones id={id} />}
                {pestana === 'admin' && <Administrar key={e.id + (e.matricula?.id ?? '')} estudiante={e} recargar={() => carga.recargar({ silencioso: true })} />}
            </div>
        </>
    )
}

export default Estudiante
