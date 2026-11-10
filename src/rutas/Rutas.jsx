import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../context/Sesion'
import { Cargando } from '../componentes/ui/Estados'

// Exige sesión (y opcionalmente uno de los roles). Recuerda a dónde quería ir la persona.
export const RutaPrivada = ({ roles, children }) => {
    const { autenticado, cargando, tieneRol } = useSesion()
    const location = useLocation()
    if (cargando) return <Cargando className="min-h-dvh" texto="Verificando sesión…" />
    if (!autenticado) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
    if (roles && !tieneRol(...roles)) return <Navigate to="/app" replace />
    return children
}

// Si ya hay sesión, el login lleva directo a la plataforma
export const SoloInvitados = ({ children }) => {
    const { autenticado, cargando } = useSesion()
    if (cargando) return <Cargando className="min-h-[50vh]" texto="Verificando sesión…" />
    if (autenticado) return <Navigate to="/app" replace />
    return children
}
