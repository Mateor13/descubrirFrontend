import { useEffect } from 'react'
import { sitio } from '../config/sitio'

const meta = (selector, atributo, valor) => {
    let el = document.head.querySelector(selector)
    if (!el) {
        el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
        const [, clave, nombre] = selector.match(/\[(\w+)="([^"]+)"\]/)
        el.setAttribute(clave, nombre)
        document.head.appendChild(el)
    }
    el.setAttribute(atributo, valor)
}

// Título, descripción, indexación y URL canónica de cada página
export const useSeo = ({ titulo, descripcion = sitio.descripcion, indexar = false, ruta }) => {
    useEffect(() => {
        const completo = titulo ? `${titulo} | ${sitio.nombreCorto}` : `${sitio.nombreCorto} | ${sitio.eslogan}`
        document.title = completo
        meta('meta[name="description"]', 'content', descripcion)
        meta('meta[name="robots"]', 'content', indexar ? 'index, follow' : 'noindex, nofollow')
        meta('meta[property="og:title"]', 'content', completo)
        meta('meta[property="og:description"]', 'content', descripcion)
        if (sitio.url && ruta !== undefined) {
            meta('link[rel="canonical"]', 'href', `${sitio.url}${ruta}`)
            meta('meta[property="og:url"]', 'content', `${sitio.url}${ruta}`)
        }
    }, [titulo, descripcion, indexar, ruta])
}
