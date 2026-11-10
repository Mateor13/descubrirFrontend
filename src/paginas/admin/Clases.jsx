import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'
import { academico, usuarios } from '../../api/v2'
import { mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { usePeriodo } from '../../context/Periodo'
import { Encabezado, Tabla, Aviso } from '../../componentes/ui/Pagina'
import { Modal, PieModal, Confirmar } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { nombreCompleto } from '../../lib/formato'

const Clases = () => {
    const [params, setParams] = useSearchParams()
    const curso = params.get('curso') ?? ''
    const profesor = params.get('profesor') ?? ''
    const { periodoConsulta, editable, activo } = usePeriodo()
    const cursos = useCarga(() => academico.cursos(), [])
    const profesores = useCarga(() => usuarios.listar({ rol: 'profesor' }), [])
    const asignaturas = useCarga(() => academico.asignaturas(), [])
    const carga = useCarga(() => academico.clases({ curso, profesor, periodo: periodoConsulta }), [curso, profesor, periodoConsulta])
    const [modal, setModal] = useState(null)
    const [form, setForm] = useState({})
    const [guardando, setGuardando] = useState(false)

    const filtrar = (clave, valor) => {
        const nuevos = new URLSearchParams(params)
        if (valor) nuevos.set(clave, valor); else nuevos.delete(clave)
        setParams(nuevos, { replace: true })
    }

    const abrir = (tipo, clase) => {
        setForm(tipo === 'crear' ? { curso, asignatura: '', profesor } : { profesor: clase.profesor.id })
        setModal({ tipo, clase })
    }

    const guardar = async (e) => {
        e?.preventDefault()
        setGuardando(true)
        try {
            if (modal.tipo === 'crear') await academico.crearClase(form)
            else if (modal.tipo === 'profesor') await academico.cambiarProfesor(modal.clase.id, form.profesor)
            else await academico.desactivarClase(modal.clase.id)
            toast.success(modal.tipo === 'crear' ? 'Clase creada' : modal.tipo === 'profesor' ? 'Docente actualizado' : 'Clase eliminada')
            setModal(null)
            carga.recargar()
        } catch (err) { toast.error(mensajeError(err)) } finally { setGuardando(false) }
    }

    const opcionesProfesor = (profesores.datos ?? []).map(p => <option key={p.id} value={p.id}>{nombreCompleto(p)}</option>)

    const columnas = [
        { titulo: 'Asignatura', render: c => <Link to={`/app/clases/${c.id}`} className="enlace">{c.asignatura.nombre}</Link> },
        { titulo: 'Curso', render: c => c.curso.nombre },
        { titulo: 'Docente', render: c => `${c.profesor.apellido} ${c.profesor.nombre}` },
        {
            titulo: 'Acciones', clase: 'text-right', render: c => editable && (
                <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" className="btn-secundario btn-sm" onClick={() => abrir('profesor', c)}>Cambiar docente</button>
                    <button type="button" className="btn-fantasma btn-sm text-red-700 hover:bg-red-50" onClick={() => abrir('eliminar', c)}>Eliminar</button>
                </div>
            )
        }
    ]

    return (
        <>
            <Encabezado titulo="Clases y docentes" descripcion="Una clase es una asignatura dictada en un curso por un docente durante el periodo."
                acciones={editable && <button type="button" className="btn-primario" onClick={() => abrir('crear')}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nueva clase</button>} />
            {!activo && <Aviso titulo="No hay periodo activo">Las clases se crean en el periodo activo.</Aviso>}
            <div className="tarjeta overflow-hidden">
                <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2">
                    <select className="control" aria-label="Filtrar por curso" value={curso} onChange={(e) => filtrar('curso', e.target.value)}>
                        <option value="">Todos los cursos</option>
                        {(cursos.datos ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <select className="control" aria-label="Filtrar por docente" value={profesor} onChange={(e) => filtrar('profesor', e.target.value)}>
                        <option value="">Todos los docentes</option>
                        {opcionesProfesor}
                    </select>
                </div>
                <Contenido carga={carga} vacio={<Vacio titulo="No hay clases con esos filtros">Cree una clase para asignar una asignatura y un docente a un curso.</Vacio>}>
                    {(clases) => <Tabla columnas={columnas} filas={[...clases].sort((a, b) => a.curso.nivel - b.curso.nivel || a.curso.paralelo.localeCompare(b.curso.paralelo) || a.asignatura.nombre.localeCompare(b.asignatura.nombre))} etiqueta="Clases" />}
                </Contenido>
            </div>

            <Modal abierto={modal?.tipo === 'crear' || modal?.tipo === 'profesor'} alCerrar={() => setModal(null)}
                titulo={modal?.tipo === 'crear' ? 'Nueva clase' : `Cambiar docente · ${modal?.clase?.asignatura.nombre} (${modal?.clase?.curso.nombre})`}>
                <form onSubmit={guardar} className="space-y-4">
                    {modal?.tipo === 'crear' && (
                        <>
                            <Campo etiqueta="Curso" como="select" required value={form.curso ?? ''} onChange={(e) => setForm({ ...form, curso: e.target.value })}>
                                <option value="">Seleccione…</option>
                                {(cursos.datos ?? []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </Campo>
                            <Campo etiqueta="Asignatura" como="select" required value={form.asignatura ?? ''} onChange={(e) => setForm({ ...form, asignatura: e.target.value })}>
                                <option value="">Seleccione…</option>
                                {(asignaturas.datos ?? []).map(a => <option key={a._id} value={a._id}>{a.nombre}</option>)}
                            </Campo>
                        </>
                    )}
                    <Campo etiqueta="Docente" como="select" required value={form.profesor ?? ''} onChange={(e) => setForm({ ...form, profesor: e.target.value })}
                        ayuda={profesores.datos?.length === 0 ? 'No hay docentes: cree una cuenta con rol Profesor en “Usuarios”.' : undefined}>
                        <option value="">Seleccione…</option>
                        {opcionesProfesor}
                    </Campo>
                    <PieModal>
                        <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
                        <Boton type="submit" cargando={guardando}>Guardar</Boton>
                    </PieModal>
                </form>
            </Modal>
            <Confirmar abierto={modal?.tipo === 'eliminar'} alCerrar={() => setModal(null)} titulo="¿Eliminar la clase?" textoConfirmar="Eliminar" cargando={guardando} alConfirmar={guardar}>
                La clase {modal?.clase?.asignatura.nombre} de {modal?.clase?.curso.nombre} dejará de mostrarse. Las evaluaciones y notas registradas se conservan en la base de datos.
            </Confirmar>
        </>
    )
}

export default Clases
