import { sitio, enlaceWhatsapp } from '../../config/sitio'
import { registrarEvento } from '../../lib/analitica'

export const IconoWhatsapp = ({ className = 'h-5 w-5' }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.38 9.38 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.05.7C5.8.7.7 5.79.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.33 11.33 0 0 0 5.43 1.38h.01c6.25 0 11.34-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02z" />
    </svg>
)

// Llamada a la acción ÚNICA del sitio: pedir información por WhatsApp
// (si no hay WhatsApp configurado, se usa el teléfono o el email)
export const accionContacto = () => {
    const { whatsapp, telefono, email } = sitio.contacto
    if (whatsapp) return { href: enlaceWhatsapp(), texto: 'Escríbenos por WhatsApp', externo: true, whatsapp: true }
    if (telefono) return { href: `tel:${telefono.replace(/\s/g, '')}`, texto: 'Llámanos', externo: false }
    if (email) return { href: `mailto:${email}`, texto: 'Escríbenos', externo: false }
    return null
}

export const BotonContacto = ({ className = '', origen }) => {
    const accion = accionContacto()
    if (!accion) return null
    return (
        <a
            href={accion.href}
            {...(accion.externo && { target: '_blank', rel: 'noopener noreferrer' })}
            onClick={() => registrarEvento('contacto', { metodo: accion.whatsapp ? 'whatsapp' : 'otro', origen })}
            className={`btn bg-morado-600 px-6 text-base text-white shadow-lg shadow-morado-900/20 hover:bg-morado-700 ${className}`}
        >
            {accion.whatsapp && <IconoWhatsapp />}
            {accion.texto}
            {accion.externo && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
        </a>
    )
}

// Botón flotante de WhatsApp, visible en todas las páginas públicas
export const BotonWhatsapp = () => {
    const href = enlaceWhatsapp()
    if (!href) return null
    return (
        <a
            href={href} target="_blank" rel="noopener noreferrer"
            onClick={() => registrarEvento('contacto', { metodo: 'whatsapp', origen: 'flotante' })}
            className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#128C4B] text-white shadow-xl ring-4 ring-white transition-transform hover:scale-105 hover:bg-[#0e7a40] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
            aria-label="Escríbenos por WhatsApp (se abre en una pestaña nueva)"
            title="Escríbenos por WhatsApp"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
            <IconoWhatsapp className="h-8 w-8" />
        </a>
    )
}
