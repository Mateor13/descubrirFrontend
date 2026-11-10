import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    HomeIcon, UserCircleIcon, CalendarDaysIcon, UsersIcon, AcademicCapIcon, BuildingLibraryIcon,
    BookOpenIcon, RectangleGroupIcon, ClipboardDocumentCheckIcon, Bars3Icon, XMarkIcon,
    ArrowRightStartOnRectangleIcon, HeartIcon
} from '@heroicons/react/24/outline'
import { useSesion } from '../context/Sesion'
import { PeriodoProvider, usePeriodo } from '../context/Periodo'
import { IconoLogo } from '../componentes/publico/Logo'
import { SaltarAlContenido } from './LayoutPublico'
import { ESTADOS_PERIODO, ROLES, iniciales } from '../lib/formato'

const secciones = (tieneRol) => [
    { titulo: null, enlaces: [{ a: '/app', texto: 'Inicio', icono: HomeIcon, fin: true }] },
    tieneRol('admin') && {
        titulo: 'Administración',
        enlaces: [
            { a: '/app/periodos', texto: 'Periodos lectivos', icono: CalendarDaysIcon },
            { a: '/app/usuarios', texto: 'Usuarios', icono: UsersIcon },
            { a: '/app/estudiantes', texto: 'Estudiantes', icono: AcademicCapIcon },
            { a: '/app/cursos', texto: 'Cursos', icono: BuildingLibraryIcon },
            { a: '/app/asignaturas', texto: 'Asignaturas', icono: BookOpenIcon },
            { a: '/app/clases', texto: 'Clases y docentes', icono: RectangleGroupIcon }
        ]
    },
    // La asistencia la toman docentes y administración: va en "Docencia" si la persona es profesor
    tieneRol('admin', 'profesor') && {
        titulo: tieneRol('profesor') ? 'Docencia' : 'Seguimiento',
        enlaces: [
            ...(tieneRol('profesor') ? [{ a: '/app/mis-clases', texto: 'Mis clases', icono: BookOpenIcon }] : []),
            { a: '/app/asistencia', texto: 'Asistencia', icono: ClipboardDocumentCheckIcon }
        ]
    },
    tieneRol('representante') && {
        titulo: 'Familia',
        enlaces: [{ a: '/app/mis-estudiantes', texto: 'Mis estudiantes', icono: HeartIcon }]
    },
    { titulo: 'Cuenta', enlaces: [{ a: '/app/perfil', texto: 'Mi perfil', icono: UserCircleIcon }] }
].filter(Boolean)

const Navegacion = ({ alNavegar }) => {
    const { tieneRol } = useSesion()
    return (
        <nav aria-label="Menú de la plataforma" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {secciones(tieneRol).map((s, i) => (
                <div key={s.titulo ?? i}>
                    {s.titulo && <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-verde-200">{s.titulo}</p>}
                    <ul className="space-y-1">
                        {s.enlaces.map(({ a, texto, icono: Icono, fin }) => (
                            <li key={a}>
                                <NavLink
                                    to={a} end={fin} onClick={alNavegar}
                                    className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? 'bg-verde-300 font-semibold text-verde-950' : 'text-white hover:bg-white/10'}`}
                                >
                                    <Icono className="h-5 w-5 shrink-0" aria-hidden="true" />{texto}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    )
}

const SelectorPeriodo = () => {
    const { periodos, seleccionado, seleccionar, activo } = usePeriodo()
    if (!periodos.length) return null
    return (
        <label className="flex items-center gap-2 text-sm">
            <span className="hidden font-medium text-slate-600 sm:inline">Periodo</span>
            <select
                className="control min-h-[40px] w-auto py-1.5 pr-8 sm:text-sm"
                value={seleccionado?.id ?? ''}
                onChange={(e) => seleccionar(e.target.value)}
                aria-label="Periodo lectivo que se está consultando"
            >
                {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}{p.id === activo?.id ? ' (activo)' : ` · ${ESTADOS_PERIODO[p.estado]}`}</option>
                ))}
            </select>
        </label>
    )
}

const AvisosPeriodo = () => {
    const { activo, esHistorico, seleccionado, seleccionar, cargando } = usePeriodo()
    const { tieneRol } = useSesion()
    if (cargando) return null
    if (!activo) {
        return (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 sm:px-6" role="status">
                No hay un periodo lectivo activo. {tieneRol('admin') ? 'Active uno en “Periodos lectivos” para registrar notas y asistencia.' : 'Consulte con la administración.'}
            </div>
        )
    }
    if (esHistorico) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-morado-100 bg-morado-50 px-4 py-2 text-sm text-morado-800 sm:px-6" role="status">
                <span>Está consultando el periodo <strong>{seleccionado.nombre}</strong> (solo lectura).</span>
                <button type="button" className="font-semibold underline" onClick={() => seleccionar(activo.id)}>Volver al periodo activo</button>
            </div>
        )
    }
    return null
}

const Estructura = () => {
    const [menuAbierto, setMenuAbierto] = useState(false)
    const { usuario, cerrarSesion } = useSesion()
    const navigate = useNavigate()
    const { pathname } = useLocation()

    useEffect(() => setMenuAbierto(false), [pathname])
    useEffect(() => {
        if (!menuAbierto) return undefined
        const alTeclear = (e) => e.key === 'Escape' && setMenuAbierto(false)
        document.addEventListener('keydown', alTeclear)
        return () => document.removeEventListener('keydown', alTeclear)
    }, [menuAbierto])

    const salir = () => { cerrarSesion(); navigate('/login', { replace: true }) }

    return (
        <div className="min-h-dvh bg-verde-50 lg:flex">
            <SaltarAlContenido />
            {menuAbierto && <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setMenuAbierto(false)} aria-hidden="true" />}

            <aside
                className={`print:hidden fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-verde-700 transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Barra lateral"
            >
                <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
                    <NavLink to="/app" className="flex items-center gap-2.5 text-white">
                        <IconoLogo className="h-9 w-9 rounded-full ring-2 ring-white/30" />
                        <span className="leading-tight">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-verde-200">Escuela</span>
                            <span className="block font-extrabold">Descubrir</span>
                        </span>
                    </NavLink>
                    <button type="button" className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <Navegacion alNavegar={() => setMenuAbierto(false)} />
                <div className="border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-300 font-bold text-verde-950" aria-hidden="true">{iniciales(usuario)}</span>
                        <div className="min-w-0 text-sm">
                            <p className="truncate font-semibold text-white">{usuario?.nombre} {usuario?.apellido}</p>
                            <p className="truncate text-xs text-verde-200">{usuario?.roles?.map(r => ROLES[r]).join(' · ')}</p>
                        </div>
                    </div>
                    <button type="button" onClick={salir} className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-morado-600 text-sm font-semibold text-white hover:bg-morado-700">
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" aria-hidden="true" />Cerrar sesión
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="print:hidden sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
                    <button type="button" className="btn-fantasma -ml-2 lg:hidden" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú" aria-expanded={menuAbierto}>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <p className="hidden text-sm text-slate-600 lg:block">Hola, <strong className="text-slate-900">{usuario?.nombre}</strong></p>
                    <SelectorPeriodo />
                </header>
                <AvisosPeriodo />
                <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

const LayoutApp = () => (
    <PeriodoProvider>
        <Estructura />
    </PeriodoProvider>
)

export default LayoutApp
