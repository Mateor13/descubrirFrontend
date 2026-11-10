import { useId } from 'react'

// Campo de formulario accesible: etiqueta asociada, ayuda y error anunciados al lector de pantalla
export const Campo = ({ etiqueta, error, ayuda, como = 'input', children, className = '', opcional, ...props }) => {
    const id = useId()
    const idAyuda = ayuda ? `${id}-ayuda` : undefined
    const idError = error ? `${id}-error` : undefined
    const Control = como
    return (
        <div className={className}>
            <label htmlFor={id} className="etiqueta">
                {etiqueta}{opcional && <span className="font-normal text-slate-600"> (opcional)</span>}
            </label>
            <Control
                id={id}
                className={`control ${error ? 'control-error' : ''}`}
                aria-invalid={Boolean(error)}
                aria-describedby={[idAyuda, idError].filter(Boolean).join(' ') || undefined}
                {...props}
            >
                {children}
            </Control>
            {ayuda && !error && <p id={idAyuda} className="mt-1 text-xs text-slate-600">{ayuda}</p>}
            {error && <p id={idError} className="mt-1 text-xs font-medium text-red-700">{error}</p>}
        </div>
    )
}

// Campo trampa contra bots: invisible y fuera del orden de tabulación
export const CampoTrampa = (props) => (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="sitioWeb">No llenar este campo</label>
        <input id="sitioWeb" name="sitioWeb" type="text" tabIndex={-1} autoComplete="off" {...props} />
    </div>
)
