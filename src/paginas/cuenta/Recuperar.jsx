import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { useAntiSpam } from '../../hooks/useAntiSpam'
import { auth } from '../../api/v2'
import { mensajeError } from '../../api/cliente'
import { Campo, CampoTrampa } from '../../componentes/ui/Campo'
import { Boton } from '../../componentes/ui/Boton'
import { AlertaFormulario } from './Login'

const Recuperar = () => {
    useSeo({ titulo: 'Recuperar contraseña' })
    const { esSospechoso, campoTrampa, valorTrampa } = useAntiSpam()
    const [email, setEmail] = useState('')
    const [estado, setEstado] = useState({ enviando: false, mensaje: '', error: '' })

    const enviar = async (e) => {
        e.preventDefault()
        if (esSospechoso()) { setEstado({ error: 'No se pudo enviar el formulario. Espere un momento e inténtelo de nuevo.' }); return }
        setEstado({ enviando: true })
        try {
            const { mensaje } = await auth.recuperar({ email, sitioWeb: valorTrampa })
            setEstado({ mensaje })
        } catch (err) {
            setEstado({ error: mensajeError(err) })
        }
    }

    return (
        <>
            <h1 className="text-3xl font-extrabold tracking-tight">Recuperar contraseña</h1>
            <p className="mt-2 text-slate-600">Escriba el correo de su cuenta y le enviaremos un enlace para crear una contraseña nueva (válido por 1 hora).</p>
            {estado.mensaje ? (
                <div className="mt-8"><AlertaFormulario tono="ok">{estado.mensaje}</AlertaFormulario></div>
            ) : (
                <form onSubmit={enviar} className="relative mt-8 space-y-4">
                    {estado.error && <AlertaFormulario>{estado.error}</AlertaFormulario>}
                    <CampoTrampa {...campoTrampa} />
                    <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Boton type="submit" cargando={estado.enviando} className="w-full">Enviar enlace</Boton>
                </form>
            )}
            <p className="mt-8 text-sm"><Link to="/login" className="enlace">Volver a ingresar</Link></p>
        </>
    )
}

export default Recuperar
