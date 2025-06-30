import { useState } from 'react'
import axios from 'axios'
import Mensaje from './Alertas/Mensajes'

export const FechaAnio = ({ formato = "YYYY-MM-DD", onFechaFinRegistrada }) => {
    const [fechaFin, setFechaFin] = useState('');
    const [mensaje, setMensaje] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fechaFin) {
            setMensaje({ respuesta: "Debe seleccionar una fecha de finalización.", tipo: false });
            return;
        }
        const fechaFormateada = fechaFin;

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/fecha-fin-periodo`;
            const token = localStorage.getItem('token');
            const body = { fechaFin: fechaFormateada };
            await axios.patch(url, body, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMensaje({ respuesta: "Fecha de finalización registrada correctamente.", tipo: true });
            setFechaFin('');
            if (onFechaFinRegistrada) onFechaFinRegistrada();
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.error || "Error al registrar la fecha.", tipo: false });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[40vh] bg-gradient-to-br from-gray-100 to-gray-300 py-6">
            <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md border border-slate-200">
                <h2 className="text-2xl font-bold text-gray-700 mb-5 text-center">Finalizar Año Lectivo</h2>
                {Object.keys(mensaje).length > 0 && (
                    <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-gray-700 uppercase font-bold text-sm mb-1 block" htmlFor="fechaFin">
                            Fecha de Finalización:
                        </label>
                        <input
                            type="date"
                            id="fechaFin"
                            name="fechaFin"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            className="border-2 w-full p-2 mt-1 placeholder-gray-400 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            required
                        />
                    </div>
                    <div>
                        <button
                            className="bg-blue-600 w-full p-2 text-white uppercase font-bold rounded-lg hover:bg-blue-800 transition-all mt-1 shadow text-base"
                        >
                            Finalizar Año
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FechaAnio