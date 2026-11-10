import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { registrarPagina } from '../../lib/analitica'

// La app es de una sola página: se registra cada cambio de ruta como una página vista
// y se lleva el foco al contenido principal (accesibilidad al navegar).
export const RastreadorPaginas = () => {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
        const t = setTimeout(() => registrarPagina(pathname, document.title), 50)
        return () => clearTimeout(t)
    }, [pathname])
    return null
}
