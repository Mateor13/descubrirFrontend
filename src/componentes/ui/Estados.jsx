import { ExclamationTriangleIcon, InboxIcon } from '@heroicons/react/24/outline'
import { Spinner } from './Boton'

export const Cargando = ({ texto = 'Cargando…', className = 'py-12' }) => (
    <div className={`flex items-center justify-center gap-3 text-slate-600 ${className}`} role="status">
        <Spinner className="h-6 w-6 text-verde-700" />
        <span>{texto}</span>
    </div>
)

export const Vacio = ({ titulo = 'Sin resultados', children, icono: Icono = InboxIcon }) => (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <Icono className="h-10 w-10 text-verde-300" aria-hidden="true" />
        <p className="font-semibold text-slate-800">{titulo}</p>
        {children && <div className="max-w-md text-sm text-slate-600">{children}</div>}
    </div>
)

export const ErrorCarga = ({ mensaje, reintentar }) => (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center" role="alert">
        <ExclamationTriangleIcon className="h-10 w-10 text-amber-600" aria-hidden="true" />
        <p className="text-slate-800">{mensaje}</p>
        {reintentar && <button type="button" className="btn-secundario btn-sm" onClick={() => reintentar()}>Reintentar</button>}
    </div>
)

// Muestra cargando / error / contenido según el estado de useCarga
export const Contenido = ({ carga, children, vacio }) => {
    if (carga.cargando && carga.datos == null) return <Cargando />
    if (carga.error && carga.datos == null) return <ErrorCarga mensaje={carga.error} reintentar={carga.recargar} />
    if (vacio && (carga.datos == null || (Array.isArray(carga.datos) && carga.datos.length === 0))) return vacio
    return children(carga.datos)
}
