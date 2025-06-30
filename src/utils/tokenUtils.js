import { jwtDecode } from 'jwt-decode';

/**
 * Verifica si un token JWT es válido y no ha expirado
 * @param {string} token - El token JWT a verificar
 * @returns {boolean} - true si el token es válido, false si no lo es
 */
export const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
        const decodedToken = jwtDecode(token);
        
        // Verificar si el token ha expirado
        const currentTime = Date.now() / 1000;
        return decodedToken.exp > currentTime;
    } catch (error) {
        return false;
    }
};

/**
 * Obtiene la información del token decodificado
 * @param {string} token - El token JWT a decodificar
 * @returns {object|null} - Los datos decodificados del token o null si es inválido
 */
export const getTokenData = (token) => {
    if (!isTokenValid(token)) return null;
    
    try {
        return jwtDecode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Limpia el token del localStorage si es inválido
 */
export const cleanInvalidToken = () => {
    const token = localStorage.getItem('token');
    if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        return false;
    }
    return true;
};
