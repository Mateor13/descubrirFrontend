// Datos públicos de la escuela. Se definen en /sitio.config.js y Vite los inyecta al compilar.
/* global __SITIO__ */
export const sitio = __SITIO__

export const enlaceWhatsapp = (mensaje = sitio.contacto.mensajeWhatsapp) => sitio.contacto.whatsapp
    ? `https://wa.me/${sitio.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`
    : ''
