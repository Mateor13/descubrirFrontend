import { createPortal } from 'react-dom'
import { ToastContainer } from 'react-toastify'

// Los modales usan <dialog> nativo, que el navegador pinta en la "capa superior" (top layer), por encima de
// cualquier z-index: los avisos (errores, confirmaciones) quedaban detrás del fondo desenfocado.
// Solución: los avisos viven en un nodo propio que, mientras hay un modal abierto, se mueve DENTRO de ese
// <dialog> (así se pintan con él) y vuelve al <body> al cerrarlo. Como el nodo se mueve pero no se
// desmonta, los avisos visibles no se pierden al abrir o cerrar un modal.
const capa = typeof document !== 'undefined' ? document.createElement('div') : null
if (capa) {
    capa.id = 'avisos'
    // Sin tamaño propio: el contenedor de avisos ya es position: fixed, así la capa no tapa ni bloquea nada
    document.body.appendChild(capa)
}

const abiertos = [] // pila de modales abiertos (el último es el visible)
const ubicar = () => { if (capa) (abiertos.at(-1) ?? document.body).appendChild(capa) }

// Lo llama el Modal al abrirse; devuelve la función para soltar la capa al cerrarse
export const llevarAvisosAlModal = (dialogo) => {
    abiertos.push(dialogo)
    ubicar()
    return () => {
        const i = abiertos.lastIndexOf(dialogo)
        if (i !== -1) abiertos.splice(i, 1)
        ubicar()
    }
}

export const Avisos = () => capa && createPortal(
    <ToastContainer position="top-right" autoClose={4000} newestOnTop theme="colored" />,
    capa
)
