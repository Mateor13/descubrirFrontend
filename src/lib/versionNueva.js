// Tras un despliegue nuevo, los archivos JS cambian de nombre (llevan un hash). Una pestaña abierta antes del
// despliegue pide archivos que ya no existen y falla con "Failed to fetch dynamically imported module".
// La solución es recargar la página una vez para obtener la versión nueva.
const CLAVE = 'descubrir.recargaPorVersion'

export const esErrorDeVersion = (error) => /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i
    .test(String(error?.message ?? error ?? ''))

// Recarga como máximo una vez por minuto (evita bucles si el problema fuera otro)
export const puedeRecargar = () => {
    let ultima = 0
    try { ultima = Number(sessionStorage.getItem(CLAVE)) || 0 } catch { /* sin almacenamiento */ }
    return Date.now() - ultima >= 60_000
}

export const recargarPorVersionNueva = () => {
    if (!puedeRecargar()) return false
    try { sessionStorage.setItem(CLAVE, String(Date.now())) } catch { /* sin almacenamiento */ }
    window.location.reload()
    return true
}

// Vite emite este evento cuando falla la precarga de un módulo
export const escucharVersionNueva = () => {
    window.addEventListener('vite:preloadError', (evento) => {
        if (recargarPorVersionNueva()) evento.preventDefault()
    })
}
