import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useSesion } from '../../context/Sesion'
import { useSeo } from '../../hooks/useSeo'
import { useAntiSpam } from '../../hooks/useAntiSpam'
import { mensajeError } from '../../api/cliente'
import { Campo, CampoTrampa } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { sitio } from '../../config/sitio'
import { registrarEvento } from '../../lib/analitica'

export const AlertaFormulario = ({ tono = 'error', children }) => (
    <div role="alert" className={`mb-4 rounded-xl px-4 py-3 text-sm ${tono === 'error' ? 'bg-red-50 text-red-800 ring-1 ring-red-200' : 'bg-verde-100 text-verde-900 ring-1 ring-verde-300'}`}>{children}</div>
)

export const CampoPassword = ({ etiqueta = 'Contraseña', ...props }) => {
    const [visible, setVisible] = useState(false)
    return (
        <div className="relative">
            <Campo etiqueta={etiqueta} type={visible ? 'text' : 'password'} {...props} />
            <button
                type="button" onClick={() => setVisible(!visible)}
                className="absolute right-1 top-[26px] flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:text-slate-900"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={visible}
            >
                {visible ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
            </button>
        </div>
    )
}

const Login = () => {
    useSeo({ titulo: 'Ingresar a la plataforma', descripcion: `Acceso a la plataforma académica de ${sitio.nombreCorto} para docentes, representantes y administración.`, indexar: true, ruta: '/login' })
    const { iniciarSesion } = useSesion()
    const navigate = useNavigate()
    const location = useLocation()
    const { esSospechoso, campoTrampa, valorTrampa } = useAntiSpam()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

    const enviar = async (e) => {
        e.preventDefault()
        setError('')
        if (esSospechoso()) { setError('No se pudo enviar el formulario. Espere un momento e inténtelo de nuevo.'); return }
        setEnviando(true)
        try {
            await iniciarSesion({ ...form, sitioWeb: valorTrampa })
            registrarEvento('login')
            navigate(location.state?.desde?.startsWith('/app') ? location.state.desde : '/app', { replace: true })
        } catch (err) {
            setError(mensajeError(err, 'No se pudo iniciar sesión'))
            setForm(f => ({ ...f, password: '' }))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <>
            <h1 className="text-3xl font-extrabold tracking-tight">Ingresar</h1>
            <p className="mt-2 text-slate-600">Plataforma académica para docentes, representantes y administración.</p>
            <form onSubmit={enviar} className="relative mt-8 space-y-4" noValidate={false}>
                {error && <AlertaFormulario>{error}</AlertaFormulario>}
                <CampoTrampa {...campoTrampa} />
                <Campo etiqueta="Correo electrónico" type="email" name="email" autoComplete="email" inputMode="email" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <CampoPassword name="password" autoComplete="current-password" required
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <div className="flex justify-end">
                    <Link to="/recuperar" className="enlace text-sm">¿Olvidó su contraseña?</Link>
                </div>
                <Boton type="submit" cargando={enviando} className="w-full">Ingresar</Boton>
            </form>
            <p className="mt-8 rounded-xl bg-verde-50 p-4 text-sm text-slate-700 ring-1 ring-verde-100">
                ¿Es nuevo? La escuela crea su cuenta y le envía un correo para activarla y crear su contraseña.
            </p>
            {sitio.appMovil && (
                <p className="mt-4 text-sm"><a href={sitio.appMovil} target="_blank" rel="noopener noreferrer" className="enlace">Descargar la app móvil<span className="sr-only"> (se abre en una pestaña nueva)</span></a></p>
            )}
        </>
    )
}

export default Login
