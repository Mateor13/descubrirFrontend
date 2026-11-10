import { useState } from 'react'
import { ArrowTopRightOnSquareIcon, PaperClipIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { Modal } from './Modal'
import { Spinner } from './Boton'

// Las evidencias se guardan en Imgur. Si llega la URL de la página (imgur.com/abc) en lugar de la imagen
// directa (i.imgur.com/abc.jpg), se convierte para poder mostrarla.
export const urlImagen = (url = '') => {
    const pagina = url.match(/^https?:\/\/(?:www\.|m\.)?imgur\.com\/([a-zA-Z0-9]+)$/)
    return pagina ? `https://i.imgur.com/${pagina[1]}.jpg` : url
}

// Enlace "Ver evidencia" que abre la imagen en un modal (sin salir de la plataforma)
export const VerEvidencia = ({ url, titulo, texto = 'Ver evidencia', className = 'enlace inline-flex items-center gap-1 text-sm' }) => {
    const [abierto, setAbierto] = useState(false)
    const [estado, setEstado] = useState('cargando') // cargando | lista | error
    const abrir = () => { setEstado('cargando'); setAbierto(true) }

    return (
        <>
            <button type="button" onClick={abrir} className={className}>
                <PaperClipIcon className="h-4 w-4" aria-hidden="true" />{texto}
            </button>
            <Modal abierto={abierto} alCerrar={() => setAbierto(false)} titulo="Evidencia" descripcion={titulo} ancho="max-w-4xl">
                <div className="relative flex min-h-[200px] items-center justify-center rounded-xl bg-slate-100">
                    {estado === 'cargando' && (
                        <span className="absolute flex items-center gap-2 text-sm text-slate-600" role="status"><Spinner className="h-5 w-5 text-verde-700" />Cargando imagen…</span>
                    )}
                    {estado === 'error' ? (
                        <div className="flex flex-col items-center gap-2 p-8 text-center text-slate-700">
                            <PhotoIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />
                            <p>No se pudo mostrar la imagen aquí.</p>
                        </div>
                    ) : (
                        <img
                            src={urlImagen(url)}
                            alt={titulo ? `Evidencia: ${titulo}` : 'Evidencia de la evaluación'}
                            // Imgur puede rechazar imágenes enlazadas desde otros sitios según el "referer"
                            referrerPolicy="no-referrer"
                            onLoad={() => setEstado('lista')}
                            onError={() => setEstado('error')}
                            className={`max-h-[70dvh] w-auto max-w-full rounded-xl object-contain transition-opacity ${estado === 'lista' ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>
                <div className="mt-4 flex justify-end">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secundario btn-sm">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />Abrir en una pestaña nueva
                    </a>
                </div>
            </Modal>
        </>
    )
}
