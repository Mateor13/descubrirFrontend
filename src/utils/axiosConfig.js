import axios from 'axios';
import { isTokenValid } from './tokenUtils';

// Configurar interceptor para requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        if (token && isTokenValid(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (token) {
            // Si el token existe pero no es válido, lo removemos
            localStorage.removeItem('token');
            // Redirigir a login si estamos en una ruta protegida
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Configurar interceptor para responses
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            
            // Redirigir a login solo si no estamos ya ahí
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axios;
