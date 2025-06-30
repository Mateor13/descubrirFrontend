import axios from 'axios'
import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import AuthContext from '../context/AuthProvider'
import Mensaje from '../componets/Alertas/Mensajes'

const Login = () => {
    const [mensaje, setMensaje] = useState({})
    const navigate = useNavigate()
    const { setAuth } = useContext(AuthContext)
    const [showPassword, setShowPassword] = useState(false)

    const [form, setform] = useState({
        email: "",
        password: "",
        anioLectivo: ""
    })

    const [aniosLectivos, setAniosLectivos] = useState([]) 

    const handleChange = (e) => {
        setform({
            ...form,
            [e.target.name]: e.target.value
        })
    }


    useEffect(() => {
        const obtenerAniosLectivos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/listar-anios`
                const respuesta = await axios.get(url)
                setAniosLectivos(respuesta.data) 
            } catch (error) {
                toast.error("No se pudieron cargar los años lectivos.")
            }
        }
        obtenerAniosLectivos()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

   
        if (!form.email || !form.password || !form.anioLectivo) {
            toast.error("Todos los campos son obligatorios.")
            return
        }

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/login`
            const respuesta = await axios.post(url, form)
            localStorage.setItem('token', respuesta.data.token)
            // Removemos el almacenamiento del rol en localStorage por seguridad

            const perfilUrl = `${import.meta.env.VITE_BACKEND_URL}/perfil`
            const perfilRespuesta = await axios.get(perfilUrl, {
                headers: {
                    'Authorization': `Bearer ${respuesta.data.token}`
                }
            })

            setAuth(perfilRespuesta.data)

            // Usamos el rol del perfil en lugar del localStorage
            const userRole = perfilRespuesta.data.rol;

            if (userRole.includes('profesor')) {
                navigate('/profesor-dashboard')
            } else if (userRole.includes('representante')) {
                localStorage.removeItem('token')
                navigate('/login')
                toast.error('El rol de representante no está permitido para iniciar sesión, en este componente.')
            } else {
                navigate('/dashboard')
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error al iniciar sesión.")
            setform({ email: "", password: "", anioLectivo: "" })
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="w-1/2 h-screen bg-[url('/images/descubrir.jpg')] 
            bg-no-repeat bg-cover bg-center sm:block hidden">
            </div>
            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
            <div className="w-1/2 h-screen bg-white flex justify-center items-center">
                <div className="md:w-4/5 sm:w-full">
                    <div className="flex justify-center mb-6">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR58EY_JijUgAGct2dUABbc0FRLLsEa9FaQDQ&s" alt="Logo" className="h-60 w-60 rounded-full object-cover" />
                    </div>

                    <div className="flex justify-center mb-4">
                        <a
                            href="https://www.mediafire.com/file/zikjkrqj6tmsnpy/application-f7ffe4da-5a1d-43e7-8b4c-1e3b39b79d41.apk/file"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                            title="Descargar APK"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                            </svg>
                            Descargar App Móvil
                        </a>
                    </div>
                    
                    <small className="text-gray-400 block my-4 text-sm">¡Bienvenido! Ingresa tus datos para iniciar</small>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Correo</label>
                            <input
                                type="email"
                                placeholder="Ingresa tu correo"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-2 text-gray-500"
                            />
                        </div>

                        <div className="mb-3 relative">
                            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********************"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-2 text-gray-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
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

                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Año Lectivo</label>
                            <select
                                name="anioLectivo"
                                value={form.anioLectivo}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-2 text-gray-500"
                            >
                                <option value="">Selecciona un año lectivo</option>
                                {aniosLectivos.map((anio) => (
                                    <option key={anio._id} value={anio._id}>{anio.periodo}</option>
                                ))}
                            </select>
                        </div>

                        <div className="my-4">
                            <button className="py-2 w-full block text-center bg-gray-500 text-slate-300 border rounded-xl hover:scale-100 duration-300 hover:bg-gray-900 hover:text-white">Iniciar Sesion</button>
                        </div>
                    </form>

                    <div className="mt-5 text-xs border-b-2 py-4">
                        <Link to="/forgot/id" className="underline text-sm text-gray-400 hover:text-gray-900">¿Olvidaste tu contraseña?</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login