import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { academico, estudiantes as api, usuarios } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { usePeriodo } from '../../context/Periodo'
import { Encabezado, Insignia, Tabla, Aviso } from '../../componentes/ui/Pagina'
import { Modal, PieModal } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { nombreCompleto } from '../../lib/formato'

const ESTADO_MATRICULA = { activa: ['verde', 'Activa'], aprobada: ['verde', 'Aprobada'], reprobada: ['rojo', 'Reprobada'], retirada: ['gris', 'Retirada'] }
export const InsigniaMatricula = ({ estado }) => {
    const [tono, texto] = ESTADO_MATRICULA[estado] ?? ['gris', estado]
    return <Insignia tono={tono}>{texto}</Insignia>
}

// Selector de representantes con búsqueda (para vincular a un estudiante)
export const SelectorRepresentantes = ({ seleccionados, alCambiar, excluir = [] }) => {
    const reps = useCarga(() => usuarios.listar({ rol: 'representante' }), [])
    const [texto, setTexto] = useState('')
    const visibles = (reps.datos ?? []).filter(r => !excluir.includes(r.id))
        .filter(r => `${r.nombre} ${r.apellido} ${r.cedula}`.toLowerCase().includes(texto.toLowerCase().trim()))
    return (
        <fieldset>
            <legend className="etiqueta">Representantes</legend>
            <input type="search" className="control" placeholder="Buscar por nombre o cédula" aria-label="Buscar representante" value={texto} onChange={(e) => setTexto(e.target.value)} />
            <ul className="mt-2 max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-xl ring-1 ring-slate-200">
                {reps.cargando && <li className="px-3 py-2 text-sm text-slate-600">Cargando…</li>}
                {!reps.cargando && visibles.length === 0 && <li className="px-3 py-2 text-sm text-slate-600">Sin resultados. Cree la cuenta del representante en “Usuarios”.</li>}
                {visibles.map(r => (
                    <li key={r.id}>
                        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-3 text-sm hover:bg-verde-50">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-verde-700 focus:ring-verde-600"
                                checked={seleccionados.includes(r.id)}
                                onChange={() => alCambiar(seleccionados.includes(r.id) ? seleccionados.filter(id => id !== r.id) : [...seleccionados, r.id])} />
                            <span>{nombreCompleto(r)} <span className="text-slate-600">· {r.cedula}</span></span>
                        </label>
                    </li>
                ))}
            </ul>
        </fieldset>
    )
}

const NuevoEstudiante = ({ cursos, cursoInicial, alCancelar }) => {
    const navigate = useNavigate()
    const { activo } = usePeriodo()
    const [form, setForm] = useState({ nombre: '', apellido: '', cedula: '', curso: cursoInicial ?? '', representantes: [] })
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)
    const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const guardar = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            const { curso, ...resto } = form
            const nuevo = await api.crear({ ...resto, ...(curso && { curso }) })
            toast.success(`${nuevo.nombre} ${nuevo.apellido} registrado${curso ? ' y matriculado' : ''}`)
            navigate(`/app/estudiantes/${nuevo.id}`)
        } catch (err) {
            setErrores(erroresPorCampo(err))
            toast.error(mensajeError(err))
        } finally { setGuardando(false) }
    }

    return (
        <form onSubmit={guardar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nombres" name="nombre" required value={form.nombre} onChange={cambiar} error={errores.nombre} />
                <Campo etiqueta="Apellidos" name="apellido" required value={form.apellido} onChange={cambiar} error={errores.apellido} />
                <Campo etiqueta="Cédula" name="cedula" required inputMode="numeric" pattern="\d{10}" maxLength={10} value={form.cedula} onChange={cambiar} error={errores.cedula} ayuda="10 dígitos" />
                <Campo etiqueta={`Curso${activo ? ` (${activo.nombre})` : ''}`} como="select" name="curso" required={Boolean(activo)} disabled={!activo} value={form.curso} onChange={cambiar}
                    ayuda={activo ? 'Se matricula en el periodo activo.' : 'Sin periodo activo no se puede matricular.'}>
                    <option value="">Seleccione…</option>
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Campo>
            </div>
            <SelectorRepresentantes seleccionados={form.representantes} alCambiar={(representantes) => setForm({ ...form, representantes })} />
            <PieModal>
                <button type="button" className="btn-secundario" onClick={alCancelar}>Cancelar</button>
                <Boton type="submit" cargando={guardando}>Registrar estudiante</Boton>
            </PieModal>
        </form>
    )
}

const Estudiantes = () => {
    const [params, setParams] = useSearchParams()
    const curso = params.get('curso') ?? ''
    const { periodoConsulta, activo } = usePeriodo()
    const cursos = useCarga(() => academico.cursos(), [])
    const carga = useCarga(() => api.delCurso(curso, periodoConsulta), [curso, periodoConsulta], { activo: Boolean(curso) })
    const [creando, setCreando] = useState(false)
    const [texto, setTexto] = useState('')
    const navigate = useNavigate()

    const filtrados = useMemo(() => (carga.datos ?? []).filter(e => `${e.nombre} ${e.apellido} ${e.cedula}`.toLowerCase().includes(texto.toLowerCase().trim())), [carga.datos, texto])

    const columnas = [
        { titulo: 'Estudiante', render: e => <Link to={`/app/estudiantes/${e.id}`} className="enlace" onClick={(ev) => ev.stopPropagation()}>{nombreCompleto(e)}</Link> },
        { titulo: 'Cédula', render: e => e.cedula },
        { titulo: 'Matrícula', render: e => <InsigniaMatricula estado={e.matricula?.estado} /> }
    ]

    return (
        <>
            <Encabezado titulo="Estudiantes" descripcion="Elija un curso para ver a sus estudiantes matriculados."
                acciones={<button type="button" className="btn-primario" onClick={() => setCreando(true)} disabled={!cursos.datos}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nuevo estudiante</button>} />
            {!activo && <Aviso titulo="No hay periodo activo">Puede registrar estudiantes, pero no matricularlos hasta activar un periodo.</Aviso>}
            <div className="tarjeta overflow-hidden">
                <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2">
                    <select className="control" aria-label="Curso" value={curso} onChange={(e) => setParams(e.target.value ? { curso: e.target.value } : {}, { replace: true })}>
                        <option value="">Seleccione un curso…</option>
                        {(cursos.datos ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <label className="relative">
                        <span className="sr-only">Buscar estudiante</span>
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                        <input type="search" className="control pl-10" placeholder="Buscar por nombre o cédula" value={texto} onChange={(e) => setTexto(e.target.value)} disabled={!curso} />
                    </label>
                </div>
                {!curso
                    ? <Vacio titulo="Seleccione un curso">Los estudiantes se listan por curso y periodo.</Vacio>
                    : (
                        <Contenido carga={carga} vacio={<Vacio titulo="No hay estudiantes matriculados en este curso" />}>
                            {() => (
                                <>
                                    <p className="px-4 pt-3 text-sm text-slate-600" aria-live="polite">{filtrados.length} estudiante(s)</p>
                                    <Tabla columnas={columnas} filas={filtrados} etiqueta="Estudiantes del curso" alClic={(e) => navigate(`/app/estudiantes/${e.id}`)} />
                                </>
                            )}
                        </Contenido>
                    )}
            </div>
            <Modal abierto={creando} alCerrar={() => setCreando(false)} titulo="Nuevo estudiante" ancho="max-w-2xl">
                {creando && <NuevoEstudiante cursos={cursos.datos ?? []} cursoInicial={curso} alCancelar={() => setCreando(false)} />}
            </Modal>
        </>
    )
}

export default Estudiantes
