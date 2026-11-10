import { useState } from 'react'
import { toast } from 'react-toastify'
import { useSesion } from '../../context/Sesion'
import { auth } from '../../api/v2'
import { erroresPorCampo, mensajeError } from '../../api/cliente'
import { Encabezado, Insignia } from '../../componentes/ui/Pagina'
import { Campo } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { CampoPassword } from '../cuenta/Login'
import { ROLES } from '../../lib/formato'

const DatosPersonales = () => {
    const { usuario, setUsuario } = useSesion()
    const [form, setForm] = useState({
        nombre: usuario.nombre ?? '', apellido: usuario.apellido ?? '', email: usuario.email ?? '',
        telefono: usuario.telefono ?? '', direccion: usuario.direccion ?? ''
    })
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)
    const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const guardar = async (e) => {
        e.preventDefault()
        // Solo se envían los campos que cambiaron
        const cambios = Object.fromEntries(Object.entries(form).filter(([k, v]) => v.trim() !== (usuario[k] ?? '')).map(([k, v]) => [k, v.trim()]))
        if (!Object.keys(cambios).length) { toast.info('No hay cambios para guardar'); return }
        setGuardando(true)
        setErrores({})
        try {
            setUsuario(await auth.actualizarPerfil(cambios))
            toast.success('Datos actualizados')
        } catch (err) {
            setErrores(erroresPorCampo(err))
            toast.error(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={guardar} className="tarjeta p-5 sm:p-6">
            <h2 className="text-lg font-bold">Datos personales</h2>
            <div className="mt-2 flex flex-wrap gap-2">{usuario.roles.map(r => <Insignia key={r} tono="verde">{ROLES[r]}</Insignia>)}</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nombre" name="nombre" autoComplete="given-name" value={form.nombre} onChange={cambiar} error={errores.nombre} />
                <Campo etiqueta="Apellido" name="apellido" autoComplete="family-name" value={form.apellido} onChange={cambiar} error={errores.apellido} />
                <Campo etiqueta="Correo electrónico" type="email" name="email" autoComplete="email" value={form.email} onChange={cambiar} error={errores.email}
                    ayuda="Si lo cambia, avisaremos al correo anterior." className="sm:col-span-2" />
                <Campo etiqueta="Teléfono" type="tel" name="telefono" inputMode="numeric" autoComplete="tel" value={form.telefono} onChange={cambiar} error={errores.telefono} ayuda="10 dígitos" />
                <Campo etiqueta="Cédula" value={usuario.cedula ?? ''} disabled ayuda="Para cambiarla, contacte a la administración." />
                <Campo etiqueta="Dirección" name="direccion" autoComplete="street-address" value={form.direccion} onChange={cambiar} error={errores.direccion} className="sm:col-span-2" />
            </div>
            <div className="mt-6 flex justify-end"><Boton type="submit" cargando={guardando}>Guardar cambios</Boton></div>
        </form>
    )
}

const CambiarPassword = () => {
    const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const guardar = async (e) => {
        e.preventDefault()
        setError('')
        if (form.nueva.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.')
        if (form.nueva !== form.confirmar) return setError('Las contraseñas nuevas no coinciden.')
        setGuardando(true)
        try {
            await auth.cambiarPassword({ actual: form.actual, nueva: form.nueva })
            setForm({ actual: '', nueva: '', confirmar: '' })
            toast.success('Contraseña actualizada')
        } catch (err) {
            setError(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={guardar} className="tarjeta p-5 sm:p-6">
            <h2 className="text-lg font-bold">Cambiar contraseña</h2>
            {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
            <div className="mt-5 space-y-4">
                <CampoPassword etiqueta="Contraseña actual" autoComplete="current-password" required value={form.actual} onChange={(e) => setForm({ ...form, actual: e.target.value })} />
                <CampoPassword etiqueta="Nueva contraseña" autoComplete="new-password" required minLength={8} ayuda="Mínimo 8 caracteres." value={form.nueva} onChange={(e) => setForm({ ...form, nueva: e.target.value })} />
                <CampoPassword etiqueta="Repita la nueva contraseña" autoComplete="new-password" required value={form.confirmar} onChange={(e) => setForm({ ...form, confirmar: e.target.value })} />
            </div>
            <div className="mt-6 flex justify-end"><Boton type="submit" cargando={guardando}>Actualizar contraseña</Boton></div>
        </form>
    )
}

const Perfil = () => (
    <>
        <Encabezado titulo="Mi perfil" descripcion="Mantenga sus datos de contacto al día." />
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <DatosPersonales />
            <CambiarPassword />
        </div>
    </>
)

export default Perfil
