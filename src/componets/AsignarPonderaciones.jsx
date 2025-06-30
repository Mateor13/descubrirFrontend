import { useState } from 'react'
import axios from 'axios'
import Mensaje from '../componets/Alertas/Mensajes'

export const AsignarPonderaciones = () => {
    const [form, setForm] = useState({
        deberes: '',
        talleres: '',
        examenes: '',
        pruebas: ''
    });
    const [mensaje, setMensaje] = useState({});

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/asignar-ponderaciones`;
            const token = localStorage.getItem('token');
            const respuesta = await axios.post(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMensaje({ respuesta: respuesta.data.msg || "Ponderaciones asignadas correctamente.", tipo: true });
            setForm({
                deberes: '',
                talleres: '',
                examenes: '',
                pruebas: ''
            });
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.error || "Error al asignar ponderaciones.", tipo: false });
        }
    };

    return (
        <div>
            <h2 className="font-black text-2xl text-gray-600 text-center mb-4">Asignar Ponderaciones</h2>
            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div>
                    <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="deberes">Deberes (%):</label>
                    <input
                        type="number"
                        id="deberes"
                        name="deberes"
                        value={form.deberes}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                        required
                    />
                </div>
                <div>
                    <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="talleres">Talleres (%):</label>
                    <input
                        type="number"
                        id="talleres"
                        name="talleres"
                        value={form.talleres}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                        required
                    />
                </div>
                <div>
                    <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="examenes">Exámenes (%):</label>
                    <input
                        type="number"
                        id="examenes"
                        name="examenes"
                        value={form.examenes}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                        required
                    />
                </div>
                <div>
                    <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="pruebas">Pruebas (%):</label>
                    <input
                        type="number"
                        id="pruebas"
                        name="pruebas"
                        value={form.pruebas}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                        required
                    />
                </div>
                <div>
                    <button className="bg-blue-600 w-full p-3 text-white uppercase font-bold rounded-lg hover:bg-blue-800 cursor-pointer transition-all mt-4">
                        Asignar
                    </button>
                </div>
            </form>
        </div>
    )
}