
import { useState } from "react"
import Mensaje from "../Alertas/Mensaje"
import { useContext} from "react"
import AuthContext from "../../context/AuthProvider"



const Password = () => {
    const {actualizarPassword} = useContext(AuthContext)
    const [mensaje, setMensaje] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [form, setForm] = useState({
        password:"",
        newPassword:"",
        confirmPassword:""
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (Object.values(form).includes(""))
        {
            setMensaje({ respuesta: "Todos los campos deben ser ingresados", tipo: false })
                setTimeout(() => {
                    setMensaje({})
                }, 5000);
            return
        }

        if (form.newPassword.length < 8)
        {
            setMensaje({ respuesta: "El password debe tener mínimo 8 carácteres", tipo: false })
                setTimeout(() => {
                    setMensaje({})
                }, 5000);
            return
        }

        const resultado = await actualizarPassword(form)
        setMensaje(resultado)
        setTimeout(() => {
            setMensaje({})
        }, 5000);
        
}

    return (
        <>
        <div className='mt-5'>
                <h1 className='font-black text-4xl text-gray-500'>Password</h1>
                <hr className='my-4' />
                <p className='mb-2'>Este módulo te permite actualizar el password del usuario</p>
        </div>

        <form onSubmit={handleSubmit}>

        {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

            <div className="relative">
                <label htmlFor='password' className='text-gray-700 uppercase font-bold text-sm'>Password actual: </label>
                <input
                    id='password'
                    type={showPassword ? "text" : "password"}
                    className='border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5 pr-10'
                    placeholder='**************'
                    name='password'
                    value={form.password}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[52px] text-gray-500"
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

            <div className="relative">
                <label htmlFor='newPassword' className='text-gray-700 uppercase font-bold text-sm'>Nuevo password: </label>
                <input
                    id='newPassword'
                    type={showNewPassword ? "text" : "password"}
                    className='border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5 pr-10'
                    placeholder='**************'
                    name='newPassword'
                    value={form.newPassword}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[52px] text-gray-500"
                    tabIndex={-1}
                >
                    {showNewPassword ? (
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
                <label htmlFor='confirmPassword' className='text-gray-700 uppercase font-bold text-sm'>Confirmar password: </label>
                <input
                    id='confirmPassword'
                    type={showConfirmPassword ? "text" : "password"}
                    className='border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5 pr-10'
                    placeholder='**************'
                    name='confirmPassword'
                    value={form.confirmPassword}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[52px] text-gray-500"
                    tabIndex={-1}
                >
                    {showConfirmPassword ? (
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

            <input
                type="submit"
                className='bg-gray-800 w-full p-3 
                text-slate-300 uppercase font-bold rounded-lg 
                hover:bg-gray-600 cursor-pointer transition-all'
                        value='Actualizar' />
                </form>
        </>
    )
}

export default Password