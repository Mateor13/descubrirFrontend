import { Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthProvider';
import axios from 'axios';
import { isTokenValid } from '../utils/tokenUtils';

export const PrivateRoute = ({ children, allowedRoles }) => {
    const { auth, setAuth } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        const verifyTokenAndGetRole = async () => {
            if (!token || !isTokenValid(token)) {
                localStorage.removeItem('token');
                setAuth(null);
                setIsLoading(false);
                return;
            }

            try {
                // Si tenemos los datos del usuario en el context, usamos eso
                if (auth && auth.rol) {
                    setUserRole(auth.rol);
                    setIsLoading(false);
                    return;
                }

                // Si no tenemos los datos, hacemos petición al endpoint /perfil
                const perfilUrl = `${import.meta.env.VITE_BACKEND_URL}/perfil`;
                const respuesta = await axios.get(perfilUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setAuth(respuesta.data);
                setUserRole(respuesta.data.rol);
                
            } catch (error) {
                localStorage.removeItem('token');
                setAuth(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyTokenAndGetRole();
    }, [token, auth, setAuth]);

    // Mostrar loading mientras verificamos el token
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Si no hay token válido, redirigir a login
    if (!token || !isTokenValid(token)) return <Navigate to='/login' />;

    // Si se requieren roles específicos y el usuario no tiene el rol adecuado
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'administrador') return <Navigate to='/dashboard' />;
        if (userRole === 'profesor') return <Navigate to='/profesor-dashboard' />;
        return <Navigate to='/login' />;
    }

    return children;
};