import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { jwtDecode } from 'jwt-decode'
import { token } from '../api/cliente'
import { auth } from '../api/v2'

const SesionContext = createContext(null)

const tokenVigente = (valor) => {
    if (!valor) return false
    try { return jwtDecode(valor).exp * 1000 > Date.now() } catch { return false }
}

export const SesionProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(() => tokenVigente(token.leer()))

    const cerrarSesion = useCallback(() => {
        token.borrar()
        setUsuario(null)
    }, [])

    // Al abrir la app con un token guardado, se recupera el perfil
    useEffect(() => {
        const guardado = token.leer()
        if (!tokenVigente(guardado)) { token.borrar(); setCargando(false); return }
        auth.perfil().then(setUsuario).catch(() => token.borrar()).finally(() => setCargando(false))
    }, [])

    // El cliente HTTP avisa cuando la sesión expira (401)
    useEffect(() => {
        const alExpirar = (e) => {
            setUsuario(null)
            toast.info(e.detail || 'Su sesión ha expirado. Ingrese nuevamente.', { toastId: 'sesion-expirada' })
        }
        window.addEventListener('sesion:expirada', alExpirar)
        return () => window.removeEventListener('sesion:expirada', alExpirar)
    }, [])

    // Cierra la sesión automáticamente cuando vence el token, aunque la pestaña quede abierta
    useEffect(() => {
        if (!usuario) return undefined
        try {
            const ms = jwtDecode(token.leer()).exp * 1000 - Date.now()
            const t = setTimeout(() => window.dispatchEvent(new CustomEvent('sesion:expirada')), Math.max(ms, 0))
            return () => clearTimeout(t)
        } catch { return undefined }
    }, [usuario])

    const iniciarSesion = useCallback(async (credenciales) => {
        const { token: nuevo, usuario: perfil } = await auth.login(credenciales)
        token.guardar(nuevo)
        setUsuario(perfil)
        return perfil
    }, [])

    const valor = useMemo(() => ({
        usuario,
        cargando,
        autenticado: Boolean(usuario),
        tieneRol: (...roles) => roles.some(r => usuario?.roles?.includes(r)),
        iniciarSesion,
        cerrarSesion,
        setUsuario
    }), [usuario, cargando, iniciarSesion, cerrarSesion])

    return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

export const useSesion = () => useContext(SesionContext)
