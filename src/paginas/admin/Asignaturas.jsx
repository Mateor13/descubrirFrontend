import { useState } from 'react'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'
import { academico } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { useCarga } from '../../hooks/useCarga'
import { Encabezado, Tabla } from '../../componentes/ui/Pagina'
import { Modal, PieModal, Confirmar } from '../../componentes/ui/Modal'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { Contenido, Vacio } from '../../componentes/ui/Estados'

const Asignaturas = () => {
    const carga = useCarga(() => academico.asignaturas(), [])
    const [modal, setModal] = useState(null) // { tipo: 'form'|'desactivar', asignatura? }
    const [nombre, setNombre] = useState('')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const abrirFormulario = (asignatura) => { setNombre(asignatura?.nombre ?? ''); setError(''); setModal({ tipo: 'form', asignatura }) }

    const guardar = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            if (modal.asignatura) await academico.actualizarAsignatura(modal.asignatura._id, { nombre: nombre.trim() })
            else await academico.crearAsignatura({ nombre: nombre.trim() })
            toast.success(modal.asignatura ? 'Asignatura actualizada' : 'Asignatura creada')
            setModal(null)
            carga.recargar()
        } catch (err) {
            setError(erroresPorCampo(err).nombre ?? mensajeError(err))
        } finally { setGuardando(false) }
    }

    const desactivar = async () => {
        setGuardando(true)
        try {
            await academico.actualizarAsignatura(modal.asignatura._id, { activo: false })
            toast.success('Asignatura retirada del catálogo')
            setModal(null)
            carga.recargar()
        } catch (err) { toast.error(mensajeError(err)) } finally { setGuardando(false) }
    }

    const columnas = [
        { titulo: 'Asignatura', render: a => <span className="font-semibold">{a.nombre}</span> },
        {
            titulo: 'Acciones', clase: 'text-right', render: a => (
                <div className="flex justify-end gap-2">
                    <button type="button" className="btn-secundario btn-sm" onClick={() => abrirFormulario(a)}>Renombrar</button>
                    <button type="button" className="btn-fantasma btn-sm text-red-700 hover:bg-red-50" onClick={() => setModal({ tipo: 'desactivar', asignatura: a })}>Retirar</button>
                </div>
            )
        }
    ]

    return (
        <>
            <Encabezado titulo="Asignaturas" descripcion="Catálogo de materias. Para que se dicten, asígnelas a un curso y un docente en “Clases y docentes”."
                acciones={<button type="button" className="btn-primario" onClick={() => abrirFormulario()}><PlusIcon className="h-5 w-5" aria-hidden="true" />Nueva asignatura</button>} />
            <div className="tarjeta overflow-hidden">
                <Contenido carga={carga} vacio={<Vacio titulo="Aún no hay asignaturas" />}>
                    {(lista) => <Tabla columnas={columnas} filas={lista} clave="_id" etiqueta="Asignaturas" />}
                </Contenido>
            </div>
            <Modal abierto={modal?.tipo === 'form'} alCerrar={() => setModal(null)} titulo={modal?.asignatura ? 'Renombrar asignatura' : 'Nueva asignatura'} ancho="max-w-md">
                <form onSubmit={guardar}>
                    <Campo etiqueta="Nombre" required minLength={2} maxLength={60} value={nombre} onChange={(e) => setNombre(e.target.value)} error={error} placeholder="Matemáticas" />
                    <PieModal>
                        <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
                        <Boton type="submit" cargando={guardando}>Guardar</Boton>
                    </PieModal>
                </form>
            </Modal>
            <Confirmar abierto={modal?.tipo === 'desactivar'} alCerrar={() => setModal(null)} titulo={`¿Retirar ${modal?.asignatura?.nombre ?? ''}?`} textoConfirmar="Retirar" cargando={guardando} alConfirmar={desactivar}>
                Dejará de aparecer al crear clases nuevas. Las clases y notas existentes se conservan.
            </Confirmar>
        </>
    )
}

export default Asignaturas
