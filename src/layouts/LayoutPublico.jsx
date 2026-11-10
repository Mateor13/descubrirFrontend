import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Logo } from '../componentes/publico/Logo'
import { PiePublico } from '../componentes/publico/PiePublico'
import { BotonWhatsapp } from '../componentes/publico/Contacto'
import { useSesion } from '../context/Sesion'

export const SaltarAlContenido = () => (
    <a href="#contenido" className="sr-only-focusable fixed left-3 top-3 z-[60] rounded-lg bg-morado-600 px-4 py-2 font-semibold text-white">Saltar al contenido</a>
)

const ENLACES = [
    { a: '/#escuela', texto: 'La escuela' },
    { a: '/#familias', texto: 'Familias' },
    { a: '/#visitanos', texto: 'Visítanos' }
]

export const CabeceraPublica = () => {
    const [abierto, setAbierto] = useState(false)
    const { autenticado } = useSesion()
    return (
        <header className="sticky top-0 z-30 border-b border-verde-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Logo />
                <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
                    {ENLACES.map(e => <a key={e.a} href={e.a} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-verde-50 hover:text-verde-800">{e.texto}</a>)}
                    <Link to={autenticado ? '/app' : '/login'} className="btn-secundario btn-sm ml-2">{autenticado ? 'Ir a la plataforma' : 'Ingresar'}</Link>
                </nav>
                <button type="button" className="btn-fantasma -mr-2 md:hidden" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} aria-controls="menu-movil" aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}>
                    {abierto ? <XMarkIcon className="h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="h-6 w-6" aria-hidden="true" />}
                </button>
            </div>
            {abierto && (
                <nav id="menu-movil" aria-label="Principal" className="border-t border-verde-100 bg-white px-4 pb-4 md:hidden">
                    <ul className="space-y-1 pt-2">
                        {ENLACES.map(e => <li key={e.a}><a href={e.a} onClick={() => setAbierto(false)} className="block rounded-lg px-3 py-3 font-medium text-slate-800 hover:bg-verde-50">{e.texto}</a></li>)}
                        <li><NavLink to={autenticado ? '/app' : '/login'} onClick={() => setAbierto(false)} className="btn-secundario mt-2 w-full">{autenticado ? 'Ir a la plataforma' : 'Ingresar a la plataforma'}</NavLink></li>
                    </ul>
                </nav>
            )}
        </header>
    )
}

const LayoutPublico = () => (
    <div className="flex min-h-dvh flex-col bg-white">
        <SaltarAlContenido />
        <CabeceraPublica />
        <main id="contenido" className="flex-1" tabIndex={-1}>
            <Outlet />
        </main>
        <PiePublico />
        <BotonWhatsapp />
    </div>
)

export default LayoutPublico
