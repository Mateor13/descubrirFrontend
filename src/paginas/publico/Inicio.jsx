import { Link } from 'react-router-dom'
import { AcademicCapIcon, ChatBubbleLeftRightIcon, ChartBarIcon, ClipboardDocumentCheckIcon, HeartIcon, MapPinIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useSeo } from '../../hooks/useSeo'
import { sitio } from '../../config/sitio'
import { Foto } from '../../componentes/ui/Imagen'
import { BotonContacto } from '../../componentes/publico/Contacto'
import { direccionTexto } from '../../componentes/publico/PiePublico'

const PILARES = [
    { icono: AcademicCapIcon, titulo: 'De primero a séptimo', texto: 'Educación General Básica con grupos reducidos y docentes que conocen a cada estudiante por su nombre.' },
    { icono: SparklesIcon, titulo: 'Aprender descubriendo', texto: 'Proyectos, arte, música y celebraciones que convierten la curiosidad en aprendizaje.' },
    { icono: HeartIcon, titulo: 'Comunidad y valores', texto: 'Familias y escuela trabajando juntas en la formación integral de niñas y niños.' }
]

const PLATAFORMA = [
    { icono: ChartBarIcon, texto: 'Calificaciones y promedios por materia' },
    { icono: ClipboardDocumentCheckIcon, texto: 'Asistencia diaria y justificaciones' },
    { icono: ChatBubbleLeftRightIcon, texto: 'Observaciones de los docentes' }
]

const Inicio = () => {
    useSeo({ indexar: true, ruta: '/' })
    const direccion = direccionTexto()
    return (
        <>
            {/* Portada: una sola llamada a la acción */}
            <section className="relative isolate overflow-hidden bg-verde-950">
                <Foto
                    nombre="descubrir3" prioridad sizes="100vw"
                    alt="Niñas y niños de la Escuela Descubrir con trajes típicos bailando en el patio durante un festival escolar"
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-verde-950/90 via-verde-950/60 to-verde-950/10" />
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-verde-300">Escuela de Educación Básica Particular</p>
                    <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {sitio.eslogan}
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-verde-50">
                        En la Escuela Descubrir acompañamos a cada niña y niño de primero a séptimo de básica para que aprenda con alegría, curiosidad y valores.
                    </p>
                    <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <BotonContacto origen="portada" />
                        <span className="text-sm text-verde-100">Te respondemos en horario escolar.</span>
                    </div>
                </div>
            </section>

            <section id="escuela" className="scroll-mt-20 py-16 sm:py-24">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Una escuela para crecer en comunidad</h2>
                        <p className="mt-4 text-lg text-slate-700">Combinamos una formación académica sólida con experiencias que dejan huella dentro y fuera del aula.</p>
                    </div>
                    <ul className="mt-12 grid gap-6 md:grid-cols-3">
                        {PILARES.map(({ icono: Icono, titulo, texto }) => (
                            <li key={titulo} className="rounded-2xl bg-verde-50 p-6 ring-1 ring-verde-100">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-verde-700 text-white"><Icono className="h-6 w-6" aria-hidden="true" /></span>
                                <h3 className="mt-4 text-lg font-bold">{titulo}</h3>
                                <p className="mt-2 text-slate-700">{texto}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2">
                        <figure className="overflow-hidden rounded-2xl">
                            <Foto nombre="descubrir2" sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[3/2] h-full w-full object-cover"
                                alt="Estudiantes vestidos de duendes navideños con pompones verdes bailando en la cancha del programa de Navidad" />
                            <figcaption className="sr-only">Programa navideño de la escuela</figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-2xl">
                            <Foto nombre="descubrir" sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[3/2] h-full w-full object-cover"
                                alt="Niñas y niños disfrazados de abuelitos, con bastones y chales, participando en una actividad en el patio frente a sus familias" />
                            <figcaption className="sr-only">Actividad escolar con las familias</figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            <section id="familias" className="scroll-mt-20 bg-verde-700 py-16 text-white sm:py-24">
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Las familias, siempre informadas</h2>
                        <p className="mt-4 text-lg text-verde-50">
                            Con la plataforma académica de la escuela, representantes y docentes consultan en línea, desde el celular o la computadora:
                        </p>
                        <p className="mt-6 text-sm text-verde-100">
                            ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-white underline underline-offset-4 hover:text-verde-200">Ingresa a la plataforma</Link>.
                        </p>
                    </div>
                    <ul className="grid gap-3">
                        {PLATAFORMA.map(({ icono: Icono, texto }) => (
                            <li key={texto} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-verde-300 text-verde-950"><Icono className="h-6 w-6" aria-hidden="true" /></span>
                                <span className="font-medium">{texto}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section id="visitanos" className="scroll-mt-20 py-16 sm:py-24">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Conoce la escuela</h2>
                    <p className="mt-4 text-lg text-slate-700">
                        Resolvemos tus dudas sobre matrículas, horarios y propuesta educativa, y coordinamos una visita a nuestras instalaciones.
                    </p>
                    <BotonContacto origen="cierre" className="mt-8" />
                    {(direccion || sitio.fichaGoogle) && (
                        <p className="mt-6 flex items-center justify-center gap-2 text-slate-700">
                            <MapPinIcon className="h-5 w-5 text-verde-700" aria-hidden="true" />
                            {sitio.fichaGoogle
                                ? <a href={sitio.fichaGoogle} target="_blank" rel="noopener noreferrer" className="enlace">{direccion || 'Ver ubicación en Google Maps'}<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
                                : direccion}
                        </p>
                    )}
                    <p className="mt-2 text-sm text-slate-600">{sitio.horario}</p>
                </div>
            </section>
        </>
    )
}

export default Inicio
