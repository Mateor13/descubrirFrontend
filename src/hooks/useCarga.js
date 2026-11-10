import { useCallback, useEffect, useRef, useState } from 'react'
import { mensajeError } from '../api/cliente'

// Carga datos de la API con estados de carga y error. `deps` vuelve a cargar al cambiar.
export const useCarga = (cargar, deps = [], { activo = true } = {}) => {
    const [estado, setEstado] = useState({ datos: null, cargando: activo, error: null })
    const ultima = useRef(0)
    const cargarRef = useRef(cargar)
    cargarRef.current = cargar

    const recargar = useCallback(async ({ silencioso = false } = {}) => {
        const id = ++ultima.current
        if (!silencioso) setEstado(e => ({ ...e, cargando: true, error: null }))
        try {
            const datos = await cargarRef.current()
            if (id === ultima.current) setEstado({ datos, cargando: false, error: null })
            return datos
        } catch (error) {
            if (id === ultima.current) setEstado(e => ({ ...e, cargando: false, error: mensajeError(error), estado: error.response?.status }))
            return null
        }
    }, [])

    useEffect(() => {
        if (activo) recargar()
        else setEstado({ datos: null, cargando: false, error: null })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activo, ...deps])

    return { ...estado, recargar, setDatos: (datos) => setEstado(e => ({ ...e, datos: typeof datos === 'function' ? datos(e.datos) : datos })) }
}
