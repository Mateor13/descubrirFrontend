import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useAntiSpam } from '../../hooks/useAntiSpam'
import { auth } from '../../api/v2'
import { mensajeError } from '../../api/cliente'
import { CampoTrampa } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { AlertaFormulario, CampoPassword } from './Login'

// Sirve para activar una cuenta nueva (/v2/activar/:token) y para restablecer la contraseña
// (/v2/restablecer/:token): ambos piden crear una contraseña con el token del correo.
const TEXTOS = {
    activar: { titulo: 'Activar mi cuenta', intro: 'Bienvenido/a. Cree la contraseña con la que ingresará a la plataforma.', boton: 'Activar cuenta', enviar: auth.activar },
    restablecer: { titulo: 'Crear nueva contraseña', intro: 'Escriba su nueva contraseña.', boton: 'Guardar contraseña', enviar: auth.restablecer }
}

const CrearPassword = ({ modo }) => {
    const t = TEXTOS[modo]
    useSeo({ titulo: t.titulo })
    const { token } = useParams()
    const { esSospechoso, campoTrampa, valorTrampa } = useAntiSpam()
    const [form, setForm] = useState({ password: '', confirmar: '' })
    const [estado, setEstado] = useState({})
    const tokenValido = /^[0-9a-f]{64}$/i.test(token ?? '')

    const enviar = async (e) => {
        e.preventDefault()
        if (form.password.length < 8) return setEstado({ error: 'La contraseña debe tener al menos 8 caracteres.' })
        if (form.password !== form.confirmar) return setEstado({ error: 'Las contraseñas no coinciden.' })
        if (esSospechoso()) return setEstado({ error: 'No se pudo enviar el formulario. Espere un momento e inténtelo de nuevo.' })
        setEstado({ enviando: true })
        try {
            const { mensaje } = await t.enviar({ token, password: form.password, sitioWeb: valorTrampa })
            setEstado({ listo: mensaje })
        } catch (err) {
            setEstado({ error: mensajeError(err) })
        }
    }

    return (
        <>
            <h1 className="text-3xl font-extrabold tracking-tight">{t.titulo}</h1>
            {!tokenValido ? (
                <div className="mt-8">
                    <AlertaFormulario>El enlace no es válido. Revise que lo haya copiado completo desde el correo.</AlertaFormulario>
                    <Link to="/recuperar" className="btn-secundario w-full">Solicitar un enlace nuevo</Link>
                </div>
            ) : estado.listo ? (
                <div className="mt-8">
                    <AlertaFormulario tono="ok">{estado.listo}</AlertaFormulario>
                    <Link to="/login" className="btn-primario w-full">Ingresar</Link>
                </div>
            ) : (
                <>
                    <p className="mt-2 text-slate-600">{t.intro}</p>
                    <form onSubmit={enviar} className="relative mt-8 space-y-4">
                        {estado.error && <AlertaFormulario>{estado.error}</AlertaFormulario>}
                        <CampoTrampa {...campoTrampa} />
                        <CampoPassword etiqueta="Nueva contraseña" autoComplete="new-password" required minLength={8} ayuda="Mínimo 8 caracteres."
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <CampoPassword etiqueta="Repita la contraseña" autoComplete="new-password" required minLength={8}
                            value={form.confirmar} onChange={(e) => setForm({ ...form, confirmar: e.target.value })} />
                        <Boton type="submit" cargando={estado.enviando} className="w-full">{t.boton}</Boton>
                    </form>
                    {estado.error && /expirado|no es válido/i.test(estado.error) && (
                        <p className="mt-4 text-sm"><Link to="/recuperar" className="enlace">Solicitar un enlace nuevo</Link></p>
                    )}
                </>
            )}
        </>
    )
}

export default CrearPassword
