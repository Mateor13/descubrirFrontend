import { Link } from 'react-router-dom'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { sitio } from '../../config/sitio'
import { abrirPreferenciasCookies } from '../../lib/consentimiento'
import { Logo } from './Logo'

export const direccionTexto = () => [sitio.direccion.calle, sitio.direccion.ciudad, sitio.direccion.provincia].filter(Boolean).join(', ')

export const PiePublico = () => {
    const anio = new Date().getFullYear()
    const direccion = direccionTexto()
    return (
        <footer className="bg-verde-950 text-verde-100">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
                <div>
                    <Logo claro />
                    <p className="mt-4 text-sm leading-relaxed text-verde-200">{sitio.eslogan}.</p>
                </div>
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contacto</h2>
                    <ul className="mt-4 space-y-3 text-sm">
                        {direccion && (
                            <li className="flex gap-2"><MapPinIcon className="h-5 w-5 shrink-0 text-verde-300" aria-hidden="true" />
                                {sitio.fichaGoogle
                                    ? <a href={sitio.fichaGoogle} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{direccion}<span className="sr-only"> (ver en Google Maps, se abre en una pestaña nueva)</span></a>
                                    : <span>{direccion}</span>}
                            </li>
                        )}
                        {!direccion && sitio.fichaGoogle && (
                            <li className="flex gap-2"><MapPinIcon className="h-5 w-5 shrink-0 text-verde-300" aria-hidden="true" />
                                <a href={sitio.fichaGoogle} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">Ver ubicación en Google Maps</a>
                            </li>
                        )}
                        {sitio.contacto.telefono && (
                            <li className="flex gap-2"><PhoneIcon className="h-5 w-5 shrink-0 text-verde-300" aria-hidden="true" />
                                <a href={`tel:${sitio.contacto.telefono.replace(/\s/g, '')}`} className="hover:underline">{sitio.contacto.telefono}</a></li>
                        )}
                        {sitio.contacto.email && (
                            <li className="flex gap-2"><EnvelopeIcon className="h-5 w-5 shrink-0 text-verde-300" aria-hidden="true" />
                                <a href={`mailto:${sitio.contacto.email}`} className="break-all hover:underline">{sitio.contacto.email}</a></li>
                        )}
                        <li className="flex gap-2"><ClockIcon className="h-5 w-5 shrink-0 text-verde-300" aria-hidden="true" />{sitio.horario}</li>
                    </ul>
                </div>
                <nav aria-label="Información legal y enlaces">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">Información</h2>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><Link to="/login" className="hover:underline">Plataforma académica</Link></li>
                        <li><Link to="/aviso-legal" className="hover:underline">Aviso legal</Link></li>
                        <li><Link to="/privacidad" className="hover:underline">Política de privacidad</Link></li>
                        <li><Link to="/cookies" className="hover:underline">Aviso de cookies</Link></li>
                        {sitio.analitica.ga4 && <li><button type="button" onClick={abrirPreferenciasCookies} className="hover:underline">Preferencias de cookies</button></li>}
                        {sitio.redes.map(r => (
                            <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{r.nombre}<span className="sr-only"> (se abre en una pestaña nueva)</span></a></li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="border-t border-white/10">
                <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-verde-200 sm:px-6">© {anio} {sitio.nombre}. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
