import { useContext } from "react"
import AuthContext from "../../context/AuthProvider"

export const CardPerfil = () => {
    const { auth } = useContext(AuthContext)
    return (
        <div className="bg-white border border-slate-200 p-6 flex flex-col items-center shadow-2xl rounded-xl max-w-sm mx-auto">
            <div className="relative mb-4">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                    alt="img-client"
                    className="rounded-full border-4 border-blue-500 shadow-lg"
                    width={130}
                    height={130}
                />
                <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">{auth.nombre} {auth.apellido}</h2>
            <p className="text-gray-500 mb-4">{auth.email}</p>
            <div className="w-full">
                <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-600 w-28">Dirección:</span>
                    <span className="text-gray-700">{auth.direccion || <span className="italic text-gray-400">No registrada</span>}</span>
                </div>
                <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-600 w-28">Teléfono:</span>
                    <span className="text-gray-700">{auth.telefono || <span className="italic text-gray-400">No registrado</span>}</span>
                </div>
            </div>
        </div>
    )
}