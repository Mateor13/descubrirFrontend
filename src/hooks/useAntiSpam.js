import { useRef, useState } from 'react'

// Protección de formularios públicos contra bots:
//  1. Campo trampa ("honeypot") invisible para personas: si llega con texto, es un bot.
//     También se envía al servidor, que rechaza la petición si viene lleno.
//  2. Tiempo mínimo de llenado: un bot envía el formulario en milisegundos.
// El servidor además limita los intentos por IP + email (rate limit).
const TIEMPO_MINIMO_MS = 1500

export const useAntiSpam = () => {
    const inicio = useRef(Date.now())
    const [trampa, setTrampa] = useState('')

    const esSospechoso = () => trampa.trim() !== '' || Date.now() - inicio.current < TIEMPO_MINIMO_MS

    const campoTrampa = {
        value: trampa,
        onChange: (e) => setTrampa(e.target.value)
    }

    return { esSospechoso, campoTrampa, valorTrampa: trampa }
}
