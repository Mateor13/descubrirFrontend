import { Link } from 'react-router-dom'
import Mensaje from '../componets/Alertas/Mensajes'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export const Confirmar = () => {
    const { token } = useParams();
    const [mensaje, setMensaje] = useState({})
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [mensajePassword, setMensajePassword] = useState({});
    const [passwordCambiada, setPasswordCambiada] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const verifyToken = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/confirmar-cuenta/${token}`
            const respuesta = await axios.get(url)
            setMensaje({ respuesta: respuesta.data.mensaje, tipo: true })
        } catch (error) {
            setMensaje({ respuesta: error.response.data.error, tipo: false })
        }
    }

    useEffect(() => {
        verifyToken()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setMensajePassword({ respuesta: "La contraseña debe tener al menos 6 caracteres.", tipo: false });
            return;
        }
        if (password !== password2) {
            setMensajePassword({ respuesta: "Las contraseñas no coinciden.", tipo: false });
            return;
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/nuevo-password/${token}`;
            const body = {
                password,
                confirmPassword: password2
            };
            await axios.patch(url, body);
            setMensajePassword({ respuesta: "Contraseña cambiada correctamente.", tipo: true });
            setPassword('');
            setPassword2('');
            setPasswordCambiada(true);
        } catch (error) {
            setMensajePassword({ respuesta: error.response?.data?.error || "Error al cambiar la contraseña.", tipo: false });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">

            <div className="flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-12">Muchas Gracias</p>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mt-4">Por favor cambia tu contraseña antes de iniciar</p>
                {!passwordCambiada && (
                    <form onSubmit={handleSubmit} className="w-full max-w-md mt-8 space-y-4">

                        {Object.keys(mensajePassword).length > 0 && (
                            <Mensaje tipo={mensajePassword.tipo}>{mensajePassword.respuesta}</Mensaje>
                        )}

                        <div className="relative">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                                Nueva Contraseña
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="border rounded w-full p-2 pr-10"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-[38px] text-gray-500"
                                tabIndex={-1}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.956 9.956 0 011.84-5.772m1.433-1.433A9.956 9.956 0 0112 2c5.523 0 10 4.477 10 10a9.956 9.956 0 01-1.84 5.772M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="relative">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="password2">
                                Repetir Contraseña
                            </label>
                            <input
                                type={showPassword2 ? "text" : "password"}
                                id="password2"
                                className="border rounded w-full p-2 pr-10"
                                value={password2}
                                onChange={e => setPassword2(e.target.value)}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword2(!showPassword2)}
                                className="absolute right-2 top-[38px] text-gray-500"
                                tabIndex={-1}
                                aria-label={showPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword2 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.956 9.956 0 011.84-5.772m1.433-1.433A9.956 9.956 0 0112 2c5.523 0 10 4.477 10 10a9.956 9.956 0 01-1.84 5.772M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
                        >
                            Cambiar Contraseña
                        </button>
                    </form>
                )}
                {passwordCambiada && (
                    <>
                        <p className="md:text-lg lg:text-xl text-green-600 mt-8">Ya puedes iniciar sesión</p>
                        <Link to="/login" className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">Login</Link>
                    </>
                )}
            </div>
        </div>
    )
}
