import { Link } from 'react-router-dom'
import { BookOpenIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { academico } from '../../api/v2'
import { useCarga } from '../../hooks/useCarga'
import { usePeriodo } from '../../context/Periodo'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { Encabezado } from '../../componentes/ui/Pagina'

// Agrupa las clases por curso (ordenadas por nivel y paralelo)
export const agruparPorCurso = (clases) => {
    const grupos = new Map()
    for (const c of clases) {
        const clave = c.curso.id
        if (!grupos.has(clave)) grupos.set(clave, { curso: c.curso, clases: [] })
        grupos.get(clave).clases.push(c)
    }
    return [...grupos.values()].sort((a, b) => a.curso.nivel - b.curso.nivel || a.curso.paralelo.localeCompare(b.curso.paralelo))
}

export const TarjetasClases = ({ clases }) => (
    <div className="space-y-6">
        {agruparPorCurso(clases).map(({ curso, clases: delCurso }) => (
            <section key={curso.id} aria-labelledby={`curso-${curso.id}`}>
                <h2 id={`curso-${curso.id}`} className="mb-3 text-sm font-bold uppercase tracking-wider text-verde-800">{curso.nombre}</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {delCurso.map(c => (
                        <li key={c.id}>
                            <Link to={`/app/clases/${c.id}`} className="tarjeta flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-verde-300">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-verde-100 text-verde-800"><BookOpenIcon className="h-6 w-6" aria-hidden="true" /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-semibold text-slate-900">{c.asignatura.nombre}</span>
                                    <span className="block truncate text-sm text-slate-600">{curso.nombre}{c.profesor?.nombre ? ` · ${c.profesor.nombre} ${c.profesor.apellido}` : ''}</span>
                                </span>
                                <ChevronRightIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        ))}
    </div>
)

const MisClases = () => {
    const { periodoConsulta } = usePeriodo()
    const carga = useCarga(() => academico.clases({ periodo: periodoConsulta }), [periodoConsulta])
    return (
        <>
            <Encabezado titulo="Mis clases" descripcion="Elija una clase para registrar evaluaciones y calificaciones." />
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="No tiene clases asignadas en este periodo">La administración asigna las clases a cada docente.</Vacio></div>}>
                {(clases) => <TarjetasClases clases={clases} />}
            </Contenido>
        </>
    )
}

export default MisClases
