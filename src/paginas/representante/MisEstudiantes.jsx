import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { estudiantes } from '../../api/v2'
import { useCarga } from '../../hooks/useCarga'
import { usePeriodo } from '../../context/Periodo'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { Encabezado } from '../../componentes/ui/Pagina'
import { iniciales } from '../../lib/formato'

export const TarjetasEstudiantes = ({ lista }) => (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map(e => (
            <li key={e.id}>
                <Link to={`/app/estudiantes/${e.id}`} className="tarjeta flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-verde-300">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-morado-100 font-bold text-morado-700" aria-hidden="true">{iniciales(e)}</span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-900">{e.nombre} {e.apellido}</span>
                        <span className="block text-sm text-slate-600">{e.curso?.nombre ?? 'Sin matrícula en este periodo'}</span>
                    </span>
                    <ChevronRightIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </Link>
            </li>
        ))}
    </ul>
)

const MisEstudiantes = () => {
    const { periodoConsulta } = usePeriodo()
    const carga = useCarga(() => estudiantes.mios(periodoConsulta), [periodoConsulta])
    return (
        <>
            <Encabezado titulo="Mis estudiantes" descripcion="Consulte calificaciones, asistencia y observaciones de sus representados." />
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="No tiene estudiantes vinculados">Si es representante de un estudiante, pida a la administración que lo vincule a su cuenta.</Vacio></div>}>
                {(lista) => <TarjetasEstudiantes lista={lista} />}
            </Contenido>
        </>
    )
}

export default MisEstudiantes
