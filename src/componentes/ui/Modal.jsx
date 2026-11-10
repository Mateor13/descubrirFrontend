import { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Ventana modal con <dialog> nativo: gestiona el foco, Esc y el fondo sin librerías
export const Modal = ({ abierto, alCerrar, titulo, descripcion, children, ancho = 'max-w-lg' }) => {
    const ref = useRef(null)

    useEffect(() => {
        const dialogo = ref.current
        if (!dialogo) return
        if (abierto && !dialogo.open) dialogo.showModal()
        if (!abierto && dialogo.open) dialogo.close()
    }, [abierto])

    return (
        <dialog
            ref={ref}
            onCancel={(e) => { e.preventDefault(); alCerrar() }}
            onClick={(e) => { if (e.target === ref.current) alCerrar() }}
            className={`m-auto w-[calc(100%-1.5rem)] ${ancho} rounded-2xl bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm`}
            aria-labelledby="modal-titulo"
        >
            {abierto && (
                <div className="flex max-h-[90dvh] flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 id="modal-titulo" className="text-lg font-bold">{titulo}</h2>
                            {descripcion && <p className="mt-0.5 text-sm text-slate-600">{descripcion}</p>}
                        </div>
                        <button type="button" onClick={alCerrar} className="btn-fantasma btn-sm -mr-2" aria-label="Cerrar">
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="overflow-y-auto px-5 py-4">{children}</div>
                </div>
            )}
        </dialog>
    )
}

export const PieModal = ({ children }) => (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
)

export const Confirmar = ({ abierto, alCerrar, titulo, children, textoConfirmar = 'Confirmar', variante = 'peligro', alConfirmar, cargando }) => (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={titulo} ancho="max-w-md">
        <div className="text-sm text-slate-700">{children}</div>
        <PieModal>
            <button type="button" className="btn-secundario" onClick={alCerrar}>Cancelar</button>
            <button type="button" className={`btn-${variante}`} onClick={alConfirmar} disabled={cargando}>{cargando ? 'Procesando…' : textoConfirmar}</button>
        </PieModal>
    </Modal>
)
