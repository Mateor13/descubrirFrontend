import { useEffect, useState } from 'react'
import { Link, useRouteError } from 'react-router-dom'
import { IconoLogo } from '../../componentes/publico/Logo'
import { Cargando } from '../../componentes/ui/Estados'
import { esErrorDeVersion, puedeRecargar, recargarPorVersionNueva } from '../../lib/versionNueva'

// Pantalla para errores inesperados de la interfaz (en lugar de la página por defecto de React Router)
const ErrorApp = () => {
    const error = useRouteError()
    const deVersion = esErrorDeVersion(error)
    // Versión nueva desplegada: se recarga sola una vez; si vuelve a fallar, se muestra el aviso
    const [recargando] = useState(() => deVersion && puedeRecargar())

    useEffect(() => {
        document.title = 'Algo salió mal | Escuela Descubrir'
        if (recargando) recargarPorVersionNueva()
        else if (!deVersion) console.error(error)
    }, [error, deVersion, recargando])

    if (recargando) return <Cargando className="min-h-dvh" texto="Actualizando a la versión más reciente…" />

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center bg-verde-50 px-4 text-center">
            <IconoLogo className="h-16 w-16" />
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
                {deVersion ? 'Hay una versión nueva de la plataforma' : 'Algo salió mal'}
            </h1>
            <p className="mt-3 max-w-md text-slate-700">
                {deVersion
                    ? 'Recargue la página para usar la versión más reciente. No perderá su sesión.'
                    : 'Ocurrió un error inesperado. Recargue la página; si el problema continúa, contacte a la administración.'}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="btn-primario" onClick={() => window.location.reload()}>Recargar la página</button>
                <Link to="/app" reloadDocument className="btn-secundario">Ir al inicio de la plataforma</Link>
            </div>
        </main>
    )
}

export default ErrorApp
