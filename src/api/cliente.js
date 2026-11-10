import axios from 'axios'

// URL de la API v2. Por defecto: <VITE_BACKEND_URL>/v2 (VITE_BACKEND_URL ya termina en /api).
const base = import.meta.env.VITE_API_V2_URL
    || `${(import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')}/v2`

const CLAVE_TOKEN = 'descubrir.token'
localStorage.removeItem('token') // token de la v1: no sirve en la v2

export const token = {
    leer: () => { try { return localStorage.getItem(CLAVE_TOKEN) } catch { return null } },
    guardar: (valor) => { try { localStorage.setItem(CLAVE_TOKEN, valor) } catch { /* modo privado */ } },
    borrar: () => { try { localStorage.removeItem(CLAVE_TOKEN) } catch { /* modo privado */ } }
}

export const api = axios.create({ baseURL: base, timeout: 30000 })

api.interceptors.request.use((config) => {
    const valor = token.leer()
    if (valor) config.headers.Authorization = `Bearer ${valor}`
    return config
})

// Sesión vencida o cuenta desactivada: se avisa a la app para que cierre sesión
api.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
        if (error.response?.status === 401 && token.leer()) {
            token.borrar()
            window.dispatchEvent(new CustomEvent('sesion:expirada', { detail: error.response.data?.error }))
        }
        return Promise.reject(error)
    }
)

// Mensaje legible para la persona a partir de un error de la API ({ error, detalles })
export const mensajeError = (error, porDefecto = 'Ocurrió un error, inténtelo de nuevo') => {
    if (error?.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Inténtelo de nuevo.'
    if (!error?.response) return 'No se pudo conectar con el servidor. Revise su conexión a internet.'
    const { status, data } = error.response
    if (status === 429) return data?.error || 'Demasiados intentos. Espere unos minutos.'
    if (status >= 500) return 'El servidor tuvo un problema. Inténtelo más tarde.'
    return data?.error || porDefecto
}

// Errores por campo (para mostrarlos bajo cada input)
export const erroresPorCampo = (error) => Object.fromEntries(
    (error?.response?.data?.detalles ?? []).filter(d => d?.campo).map(d => [d.campo, d.mensaje])
)

// Helpers: devuelven directamente los datos
export const get = (url, params) => api.get(url, { params }).then(r => r.data)
export const post = (url, datos, config) => api.post(url, datos, config).then(r => r.data)
export const patch = (url, datos, config) => api.patch(url, datos, config).then(r => r.data)
export const put = (url, datos) => api.put(url, datos).then(r => r.data)
export const del = (url) => api.delete(url).then(r => r.data)
