import { Link } from 'react-router-dom'
import { sitio } from '../../config/sitio'

export const IconoLogo = ({ className = 'h-10 w-10' }) => (
    <img src="/favicon.svg" alt="" width="40" height="40" className={className} aria-hidden="true" />
)

export const Logo = ({ a = '/', claro = false }) => (
    <Link to={a} className="flex items-center gap-2.5 rounded-lg" aria-label={`${sitio.nombreCorto}: ir al inicio`}>
        <IconoLogo />
        <span className="leading-tight">
            <span className={`block text-[11px] font-semibold uppercase tracking-[0.14em] ${claro ? 'text-verde-200' : 'text-verde-700'}`}>Escuela</span>
            <span className={`block text-lg font-extrabold ${claro ? 'text-white' : 'text-slate-900'}`}>Descubrir</span>
        </span>
    </Link>
)
