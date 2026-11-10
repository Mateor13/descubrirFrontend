export const Spinner = ({ className = 'h-4 w-4' }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
)

export const Boton = ({ variante = 'primario', cargando, children, className = '', type = 'button', disabled, ...props }) => (
    <button type={type} className={`btn-${variante} ${className}`} disabled={disabled || cargando} aria-busy={cargando || undefined} {...props}>
        {cargando && <Spinner />}
        {children}
    </button>
)
