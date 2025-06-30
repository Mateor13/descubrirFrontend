import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

/**
 * Hook personalizado para manejar el estado del año lectivo activo
 * Primero intenta obtener el estado del token, y si es necesario,
 * consulta el endpoint para verificar el estado real
 */
export const useAnioLectivo = () => {
    const [anioLectivoActivo, setAnioLectivoActivo] = useState(true); // Por defecto true para evitar flickering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para decodificar el token JWT
    const decodificarToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    };

    // Función para consultar el endpoint de años lectivos
    const consultarAniosLectivos = async (idAnioToken) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/listar-anios`;
            const respuesta = await axios.get(url);
            if (respuesta.data && Array.isArray(respuesta.data)) {
                // Buscar el año lectivo con el ID del token
                const anioEncontrado = respuesta.data.find(anio => anio._id === idAnioToken);

                if (anioEncontrado) {
                    // Si se encuentra, devolver su estado
                    return anioEncontrado.estado;
                } else {
                    // Si no se encuentra, considerar inactivo por seguridad
                    return false;
                }
            } else {
                // Respuesta inválida del endpoint
                return false;
            }
        } catch (error) {
            // En caso de error de red, mantener el comportamiento por defecto
            throw error;
        }
    };

    // Efecto principal para determinar el estado del año lectivo
    useEffect(() => {
        const obtenerEstadoAnioLectivo = async () => {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setAnioLectivoActivo(false);
                setLoading(false);
                return;
            }

            const payload = decodificarToken(token);
            if (!payload) {
                setAnioLectivoActivo(false);
                setLoading(false);
                return;
            }

            // Si tenemos el ID del año lectivo
            if (payload.anio) {
                try {
                    const idAnio = payload.anio;
                    
                    const estadoConsultado = await consultarAniosLectivos(idAnio);
                    setAnioLectivoActivo(estadoConsultado);
                } catch (error) {
                    setError('Error al consultar el estado del año lectivo');
                    // En caso de error, mantener como activo para no bloquear la aplicación
                    setAnioLectivoActivo(true);
                }
            } else {
                // Si no hay información del año lectivo en el token, asumir inactivo
                console.warn('No se encontró información del año lectivo en el token');
                setAnioLectivoActivo(false);
            }

            setLoading(false);
        };

        obtenerEstadoAnioLectivo();
    }, []);

    // Función para refrescar el estado (útil si se necesita actualizar después de cambios)
    const refrescarEstado = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAnioLectivoActivo(false);
            return;
        }

        const payload = decodificarToken(token);
        if (!payload || (!payload.anioLectivoId && !payload.anioLectivo?.id)) {
            setAnioLectivoActivo(false);
            return;
        }

        try {
            const idAnio = payload.anioLectivoId || payload.anioLectivo.id;
            const estadoConsultado = await consultarAniosLectivos(idAnio);
            setAnioLectivoActivo(estadoConsultado);
        } catch (error) {
            setError('Error al refrescar el estado del año lectivo');
        }
    };

    return {
        anioLectivoActivo,
        loading,
        error,
        refrescarEstado
    };
};
