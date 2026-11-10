import { Link } from 'react-router-dom'
import { CalendarDaysIcon, UsersIcon, AcademicCapIcon, RectangleGroupIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import { useSesion } from '../../context/Sesion'
import { usePeriodo } from '../../context/Periodo'
import { useCarga } from '../../hooks/useCarga'
import { academico, estudiantes } from '../../api/v2'
import { Encabezado, Insignia } from '../../componentes/ui/Pagina'
import { Contenido, Vacio } from '../../componentes/ui/Estados'
import { TarjetasClases } from '../docente/MisClases'
import { TarjetasEstudiantes } from '../representante/MisEstudiantes'
import { ESTADOS_PERIODO, TIPOS_EVALUACION, fecha } from '../../lib/formato'

const ResumenPeriodo = () => {
    const { seleccionado } = usePeriodo()
    if (!seleccionado) return null
    const p = seleccionado
    return (
        <section className="tarjeta mb-8 p-5" aria-labelledby="resumen-periodo">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="resumen-periodo" className="text-lg font-bold">Periodo {p.nombre}</h2>
                <Insignia tono={p.estado === 'activo' ? 'verde' : p.estado === 'cerrado' ? 'gris' : 'azul'}>{ESTADOS_PERIODO[p.estado]}</Insignia>
            </div>
            <p className="mt-1 text-sm text-slate-600">Del {fecha(p.inicio)} {p.fin ? `al ${fecha(p.fin)}` : '(sin fecha de fin)'} · Nota mínima para aprobar: <strong>{p.notaMinima}</strong></p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(TIPOS_EVALUACION).map(([tipo, nombre]) => (
                    <div key={tipo} className="rounded-xl bg-verde-50 p-3 ring-1 ring-verde-100">
                        <dt className="text-xs font-medium text-slate-600">{nombre}</dt>
                        <dd className="text-xl font-bold text-verde-800">{p.ponderaciones?.[tipo] ?? 0}%</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

const ACCESOS_ADMIN = [
    { a: '/app/periodos', texto: 'Periodos lectivos', ayuda: 'Crear, activar, cerrar y promover', icono: CalendarDaysIcon },
    { a: '/app/usuarios', texto: 'Usuarios', ayuda: 'Docentes, representantes y administración', icono: UsersIcon },
    { a: '/app/estudiantes', texto: 'Estudiantes', ayuda: 'Matrículas y representantes', icono: AcademicCapIcon },
    { a: '/app/clases', texto: 'Clases y docentes', ayuda: 'Asignar materias a cada curso', icono: RectangleGroupIcon },
    { a: '/app/asistencia', texto: 'Asistencia', ayuda: 'Lista del día y justificaciones', icono: ClipboardDocumentCheckIcon }
]

const ClasesDocente = () => {
    const { periodoConsulta } = usePeriodo()
    const carga = useCarga(() => academico.clases({ periodo: periodoConsulta }), [periodoConsulta])
    return (
        <section className="mb-8" aria-labelledby="mis-clases">
            <div className="mb-3 flex items-center justify-between">
                <h2 id="mis-clases" className="text-lg font-bold">Mis clases</h2>
                <Link to="/app/asistencia" className="btn-secundario btn-sm">Tomar asistencia</Link>
            </div>
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="Sin clases asignadas en este periodo" /></div>}>
                {(clases) => <TarjetasClases clases={clases} />}
            </Contenido>
        </section>
    )
}

const EstudiantesRepresentante = () => {
    const { periodoConsulta } = usePeriodo()
    const carga = useCarga(() => estudiantes.mios(periodoConsulta), [periodoConsulta])
    return (
        <section className="mb-8" aria-labelledby="mis-estudiantes">
            <h2 id="mis-estudiantes" className="mb-3 text-lg font-bold">Mis estudiantes</h2>
            <Contenido carga={carga} vacio={<div className="tarjeta"><Vacio titulo="No tiene estudiantes vinculados">Pida a la administración que los vincule a su cuenta.</Vacio></div>}>
                {(lista) => <TarjetasEstudiantes lista={lista} />}
            </Contenido>
        </section>
    )
}

const InicioApp = () => {
    const { usuario, tieneRol } = useSesion()
    return (
        <>
            <Encabezado titulo={`Hola, ${usuario.nombre}`} descripcion="Este es el resumen de su cuenta en la plataforma académica." />
            <ResumenPeriodo />
            {tieneRol('representante') && <EstudiantesRepresentante />}
            {tieneRol('profesor') && <ClasesDocente />}
            {tieneRol('admin') && (
                <section aria-labelledby="accesos">
                    <h2 id="accesos" className="mb-3 text-lg font-bold">Administración</h2>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {ACCESOS_ADMIN.map(({ a, texto, ayuda, icono: Icono }) => (
                            <li key={a}>
                                <Link to={a} className="tarjeta flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-verde-300">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-verde-700 text-white"><Icono className="h-6 w-6" aria-hidden="true" /></span>
                                    <span><span className="block font-semibold text-slate-900">{texto}</span><span className="block text-sm text-slate-600">{ayuda}</span></span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </>
    )
}

export default InicioApp
