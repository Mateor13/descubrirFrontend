import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'
import { academico } from '../../api/v2'
import { mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { Encabezado } from '../../componentes/ui/Pagina'
import { Modal, PieModal } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { NIVELES, PARALELOS } from '../../lib/formato'

const Cursos = () => {
    const carga = useCarga(() => academico.cursos(), [])
    const [abierto, setAbierto] = useState(false)
    const [form, setForm] = useState({ nivel: 1, paralelo: 'A' })
    const [guardando, setGuardando] = useState(false)

    const crear = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            const curso = await academico.crearCurso({ nivel: Number(form.nivel), paralelo: form.paralelo })
            toast.success(`Curso ${curso.nombre} creado`)
            setAbierto(false)
            carga.recargar()
        } catch (err) { toast.error(mensajeError(err)) } finally { setGuardando(false) }
    }

    return (
        <>
            <Encabezado titulo="Cursos" descripcion="Catálogo de cursos (nivel y paralelo). Desde cada curso puede ver sus estudiantes, clases y asistencia."
                acciones={<button type="button" className="btn-primario" onClick={() => setAbierto(true)}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nuevo curso</button>} />
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="Aún no hay cursos">Cree los cursos de la escuela (por ejemplo, Primero A).</Vacio></div>}>
                {(cursos) => (
                    <div className="space-y-6">
                        {NIVELES.map((nivel, i) => {
                            const delNivel = cursos.filter(c => c.nivel === i + 1)
                            if (!delNivel.length) return null
                            return (
                                <section key={nivel} aria-labelledby={`nivel-${i}`}>
                                    <h2 id={`nivel-${i}`} className="mb-3 text-sm font-bold uppercase tracking-wider text-verde-800">{nivel} de básica</h2>
                                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {delNivel.map(c => (
                                            <li key={c.id} className="tarjeta p-4">
                                                <p className="text-lg font-bold">{c.nombre}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Link to={`/app/estudiantes?curso=${c.id}`} className="btn-secundario btn-sm">Estudiantes</Link>
                                                    <Link to={`/app/clases?curso=${c.id}`} className="btn-secundario btn-sm">Clases</Link>
                                                    <Link to={`/app/asistencia?curso=${c.id}`} className="btn-secundario btn-sm">Asistencia</Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )
                        })}
                    </div>
                )}
            </Contenido>
            <Modal abierto={abierto} alCerrar={() => setAbierto(false)} titulo="Nuevo curso" ancho="max-w-md">
                <form onSubmit={crear}>
                    <div className="grid grid-cols-2 gap-4">
                        <Campo etiqueta="Nivel" como="select" value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
                            {NIVELES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
                        </Campo>
                        <Campo etiqueta="Paralelo" como="select" value={form.paralelo} onChange={(e) => setForm({ ...form, paralelo: e.target.value })}>
                            {PARALELOS.map(p => <option key={p} value={p}>{p}</option>)}
                        </Campo>
                    </div>
                    <PieModal>
                        <button type="button" className="btn-secundario" onClick={() => setAbierto(false)}>Cancelar</button>
                        <Boton type="submit" cargando={guardando}>Crear curso</Boton>
                    </PieModal>
                </form>
            </Modal>
        </>
    )
}

export default Cursos
