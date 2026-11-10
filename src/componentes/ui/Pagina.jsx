import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { useSeo } from '../../hooks/useSeo'

// Encabezado estándar de las páginas internas: título, descripción, acciones y enlace de regreso
export const Encabezado = ({ titulo, descripcion, acciones, volver }) => {
    useSeo({ titulo })
    return (
        <header className="mb-6">
            {volver && (
                <Link to={volver.a} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-verde-700 hover:text-verde-900">
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />{volver.texto}
                </Link>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{titulo}</h1>
                    {descripcion && <p className="mt-1 max-w-2xl text-slate-600">{descripcion}</p>}
                </div>
                {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
            </div>
        </header>
    )
}

const TONOS = {
    verde: 'bg-verde-100 text-verde-800 ring-verde-700/20',
    gris: 'bg-slate-100 text-slate-700 ring-slate-600/20',
    rojo: 'bg-red-50 text-red-800 ring-red-700/20',
    ambar: 'bg-amber-50 text-amber-900 ring-amber-700/20',
    morado: 'bg-morado-50 text-morado-700 ring-morado-700/20',
    azul: 'bg-sky-50 text-sky-800 ring-sky-700/20'
}
export const Insignia = ({ tono = 'gris', children }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONOS[tono]}`}>{children}</span>
)

export const Aviso = ({ tono = 'ambar', titulo, children, accion }) => (
    <div className={`mb-6 flex flex-col gap-3 rounded-2xl p-4 ring-1 ring-inset sm:flex-row sm:items-center sm:justify-between ${TONOS[tono]}`} role="status">
        <div className="text-sm">
            {titulo && <p className="font-semibold">{titulo}</p>}
            {children && <div className={titulo ? 'mt-0.5' : ''}>{children}</div>}
        </div>
        {accion}
    </div>
)

// Tabla en pantallas medianas; tarjetas apiladas en el móvil (sin desplazamiento horizontal)
export const Tabla = ({ columnas, filas, clave = 'id', etiqueta, alClic }) => (
    <>
        <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
                {etiqueta && <caption className="sr-only">{etiqueta}</caption>}
                <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-600">
                        {columnas.map(c => <th key={c.titulo} scope="col" className={`px-4 py-3 font-semibold ${c.clase ?? ''}`}>{c.titulo}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filas.map(f => (
                        <tr key={f[clave]} className={alClic ? 'cursor-pointer hover:bg-verde-50' : ''} onClick={alClic ? () => alClic(f) : undefined}>
                            {columnas.map(c => <td key={c.titulo} className={`px-4 py-3 align-middle ${c.clase ?? ''}`}>{c.render(f)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <ul className="divide-y divide-slate-100 md:hidden" aria-label={etiqueta}>
            {filas.map(f => (
                <li key={f[clave]} className="space-y-1.5 px-4 py-3">
                    {columnas.map((c, i) => (
                        <div key={c.titulo} className={i === 0 ? 'font-semibold text-slate-900' : 'flex items-center justify-between gap-3 text-sm'}>
                            {i > 0 && c.titulo && <span className="text-slate-600">{c.titulo}</span>}
                            <div className={i > 0 ? 'text-right' : ''}>{c.render(f)}</div>
                        </div>
                    ))}
                </li>
            ))}
        </ul>
    </>
)

export const Pestanas = ({ pestanas, activa, alCambiar }) => (
    <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" className="inline-flex min-w-full gap-1 rounded-2xl bg-white p-1 shadow-suave ring-1 ring-slate-200 sm:min-w-0">
            {pestanas.map(p => (
                <button
                    key={p.id} type="button" role="tab" aria-selected={activa === p.id}
                    onClick={() => alCambiar(p.id)}
                    className={`min-h-[40px] whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors ${activa === p.id ? 'bg-verde-700 text-white' : 'text-slate-700 hover:bg-verde-50'}`}
                >{p.titulo}</button>
            ))}
        </div>
    </div>
)
