import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { leerConsentimiento, guardarConsentimiento } from '../../lib/consentimiento'
import { activarAnalitica, desactivarAnalitica } from '../../lib/analitica'
import { sitio } from '../../config/sitio'

// Aviso de cookies: la analítica NO se carga hasta que la persona la acepta.
// Si no hay analítica configurada, no hay cookies opcionales y el aviso no se muestra.
export const AvisoCookies = () => {
    const hayOpcionales = Boolean(sitio.analitica.ga4)
    const [visible, setVisible] = useState(() => hayOpcionales && !leerConsentimiento())

    useEffect(() => {
        const aplicar = (c) => (c?.analitica ? activarAnalitica() : desactivarAnalitica())
        aplicar(leerConsentimiento())
        const alCambiar = (e) => aplicar(e.detail)
        const alAbrir = () => setVisible(true)
        window.addEventListener('consentimiento:cambio', alCambiar)
        window.addEventListener('consentimiento:abrir', alAbrir)
        return () => {
            window.removeEventListener('consentimiento:cambio', alCambiar)
            window.removeEventListener('consentimiento:abrir', alAbrir)
        }
    }, [])

    if (!visible) return null
    const decidir = (analitica) => { guardarConsentimiento({ analitica }); setVisible(false) }

    return (
        <section
            aria-label="Aviso de cookies"
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:bottom-6 sm:p-5"
        >
            <p className="text-sm text-slate-700">
                Usamos cookies técnicas para que la plataforma funcione y, solo si lo aceptas, cookies de analítica
                (Google Analytics) para saber cómo se usa el sitio y mejorarlo. Más información en el{' '}
                <Link to="/cookies" className="enlace">aviso de cookies</Link>.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" className="btn-secundario" onClick={() => decidir(false)}>Solo necesarias</button>
                <button type="button" className="btn-primario" onClick={() => decidir(true)}>Aceptar analítica</button>
            </div>
        </section>
    )
}
