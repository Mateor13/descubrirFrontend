import { Link } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { IconoLogo } from '../../componentes/publico/Logo'

// Página 404 personalizada (Vercel la sirve con estado HTTP 404 gracias a 404.html)
const NoEncontrado = ({ dentroDeApp = false }) => {
    useSeo({ titulo: 'Página no encontrada', indexar: false })
    return (
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
            <IconoLogo className="h-16 w-16" />
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-verde-700">Error 404</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Esta página no existe</h1>
            <p className="mt-3 max-w-md text-slate-700">
                Puede que el enlace esté mal escrito o que la página haya cambiado de lugar. Te ayudamos a volver al camino.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {dentroDeApp
                    ? <Link to="/app" className="btn-primario">Ir al inicio de la plataforma</Link>
                    : <>
                        <Link to="/" className="btn-primario">Ir a la página principal</Link>
                        <Link to="/login" className="btn-secundario">Ingresar a la plataforma</Link>
                    </>}
            </div>
        </section>
    )
}

export default NoEncontrado
