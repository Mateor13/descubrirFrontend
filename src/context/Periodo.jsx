import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { periodos as apiPeriodos } from '../api/v2'

// Periodo lectivo con el que se consulta la información. Por defecto el activo;
// se puede elegir uno anterior para ver el histórico (solo lectura).
const PeriodoContext = createContext(null)
const CLAVE = 'descubrir.periodo'

export const PeriodoProvider = ({ children }) => {
    const [lista, setLista] = useState([])
    const [cargando, setCargando] = useState(true)
    const [seleccionadoId, setSeleccionadoId] = useState(() => sessionStorage.getItem(CLAVE) || '')

    const recargar = useCallback(async () => {
        try {
            setLista(await apiPeriodos.listar())
        } catch {
            setLista([])
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => { recargar() }, [recargar])

    const activo = lista.find(p => p.estado === 'activo') ?? null
    // Sin periodo activo, se muestra el más reciente (la lista llega ordenada por inicio descendente)
    const seleccionado = lista.find(p => p.id === seleccionadoId) ?? activo ?? lista[0] ?? null

    const seleccionar = useCallback((id) => {
        setSeleccionadoId(id)
        try { sessionStorage.setItem(CLAVE, id) } catch { /* sin almacenamiento */ }
    }, [])

    const valor = useMemo(() => ({
        periodos: lista,
        activo,
        seleccionado,
        // Para las consultas: undefined = el activo (comportamiento por defecto de la API)
        periodoConsulta: seleccionado && seleccionado.id !== activo?.id ? seleccionado.id : undefined,
        esHistorico: Boolean(seleccionado && seleccionado.id !== activo?.id),
        editable: Boolean(seleccionado && seleccionado.estado !== 'cerrado' && seleccionado.id === activo?.id),
        cargando,
        seleccionar,
        recargar
    }), [lista, activo, seleccionado, cargando, seleccionar, recargar])

    return <PeriodoContext.Provider value={valor}>{children}</PeriodoContext.Provider>
}

export const usePeriodo = () => useContext(PeriodoContext)
