import axios from "axios"
import { createContext, useEffect, useState } from "react"
import { isTokenValid } from "../utils/tokenUtils"

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({})

    const perfil = async() => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token || !isTokenValid(token)) {
                localStorage.removeItem('token');
                setAuth({});
                return;
            }

            const url = `${import.meta.env.VITE_BACKEND_URL}/perfil`;
            const respuesta = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAuth(respuesta.data)
        } catch (error) {
            localStorage.removeItem('token');
            setAuth({});
        }
    }

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        setAuth({});
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if(token && isTokenValid(token)) {
            perfil()
        } else if (token) {
            // Si el token existe pero no es válido, lo removemos
            localStorage.removeItem('token');
        }
    }, [])

    const actualizarPerfil = async(datos) => {
        const token = localStorage.getItem('token')
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/cambiar-datos`
            const options = {
                headers: {
                    method: 'PATCH',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
            const respuesta = await axios.patch(url, datos, options)
            perfil(token)
            return {respuesta:respuesta.data.mensaje,tipo:true}
        } catch (error) {
            return {respuesta:error.response.data.error,tipo:false}
        }
}


const actualizarPassword = async (datos) => {
    const token = localStorage.getItem('token')
    try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/cambiar-password`
        const options = {
            headers: {
                method: 'PATCH',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        }
        const respuesta = await axios.patch(url, datos, options)
        return { respuesta: respuesta.data.mensaje, tipo: true }
    } catch (error) {
        return { respuesta: error.response.data.error, tipo: false }
    }
}
    
    return (
        <AuthContext.Provider value={
            {
                auth,
                setAuth,
                actualizarPerfil,
                actualizarPassword,
                cerrarSesion
            }
        }>
            {children}
        </AuthContext.Provider>
    )
}
export {
    AuthProvider
}
export default AuthContext