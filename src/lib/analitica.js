import { sitio } from '../config/sitio'

// Google Analytics 4 con "Consent Mode": el script solo se descarga si el visitante acepta
// las cookies de analítica. Si las rechaza después, se deniega el almacenamiento y se borran.
const id = sitio.analitica.ga4
let cargado = false

const gtag = (...args) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push(args) }

export const activarAnalitica = () => {
    if (!id || cargado) {
        if (cargado) gtag('consent', 'update', { analytics_storage: 'granted' })
        return
    }
    cargado = true
    window.gtag = gtag
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
    gtag('js', new Date())
    // La app registra cada cambio de página (es una SPA), por eso send_page_view: false
    gtag('config', id, { send_page_view: false, anonymize_ip: true })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)
}

export const desactivarAnalitica = () => {
    if (cargado) gtag('consent', 'update', { analytics_storage: 'denied' })
    // Borra las cookies _ga del dominio
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n.startsWith('_ga'))
        .forEach((n) => {
            const dominio = location.hostname.split('.').slice(-2).join('.')
            document.cookie = `${n}=; Max-Age=0; path=/`
            document.cookie = `${n}=; Max-Age=0; path=/; domain=.${dominio}`
        })
}

// Las rutas privadas se agrupan para no enviar identificadores (ids de estudiantes, tokens) a Google
const rutaAnonima = (ruta) => ruta
    .replace(/^\/v2\/(activar|restablecer)\/.+/, '/v2/$1')
    .replace(/\/[0-9a-f]{24}(?=\/|$)/g, '/:id')

export const registrarPagina = (ruta, titulo) => {
    if (!cargado) return
    gtag('event', 'page_view', { page_path: rutaAnonima(ruta), page_location: location.origin + rutaAnonima(ruta), page_title: titulo })
}

export const registrarEvento = (nombre, parametros = {}) => { if (cargado) gtag('event', nombre, parametros) }
