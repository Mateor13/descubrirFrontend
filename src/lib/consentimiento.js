// Preferencias de cookies del visitante. Se guardan en localStorage (técnicamente necesario).
const CLAVE = 'descubrir.cookies'
const VERSION = 1

export const leerConsentimiento = () => {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE))
        return guardado?.version === VERSION ? guardado : null
    } catch { return null }
}

export const guardarConsentimiento = ({ analitica }) => {
    const valor = { version: VERSION, analitica: Boolean(analitica), fecha: new Date().toISOString() }
    try { localStorage.setItem(CLAVE, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
    window.dispatchEvent(new CustomEvent('consentimiento:cambio', { detail: valor }))
    return valor
}

export const abrirPreferenciasCookies = () => window.dispatchEvent(new Event('consentimiento:abrir'))
