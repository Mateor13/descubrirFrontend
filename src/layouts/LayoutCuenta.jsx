import { Link, Outlet } from 'react-router-dom'
import { Logo } from '../componentes/publico/Logo'
import { Foto } from '../componentes/ui/Imagen'
import { BotonWhatsapp } from '../componentes/publico/Contacto'
import { SaltarAlContenido } from './LayoutPublico'
import { sitio } from '../config/sitio'

// Pantallas de acceso (login, recuperar, activar): formulario + foto de la escuela
const LayoutCuenta = () => (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
        <SaltarAlContenido />
        <div className="flex flex-col px-4 py-6 sm:px-10">
            <Logo />
            <main id="contenido" tabIndex={-1} className="flex flex-1 items-center justify-center py-10">
                <div className="w-full max-w-md"><Outlet /></div>
            </main>
            <nav aria-label="Información legal" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                <Link to="/" className="hover:underline">Inicio</Link>
                <Link to="/aviso-legal" className="hover:underline">Aviso legal</Link>
                <Link to="/privacidad" className="hover:underline">Privacidad</Link>
                <Link to="/cookies" className="hover:underline">Cookies</Link>
                <span>© {new Date().getFullYear()} {sitio.nombreCorto}</span>
            </nav>
        </div>
        <div className="relative hidden overflow-hidden bg-verde-900 lg:block">
            <Foto nombre="descubrir3" alt="Estudiantes de la Escuela Descubrir con trajes típicos bailando en el patio durante un festival escolar" sizes="50vw" className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-verde-950/80 via-verde-950/10 to-transparent" />
            <p className="absolute bottom-10 left-10 right-10 text-3xl font-bold leading-tight text-white">{sitio.eslogan}</p>
        </div>
        <BotonWhatsapp />
    </div>
)

export default LayoutCuenta
