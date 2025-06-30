import { useState, useEffect } from 'react'
import axios from 'axios';
import Mensaje from '../componets/Alertas/Mensajes'
import { useForm } from '../hooks/useForm'

export const ObservacionEstudiante = ({ estudiante, onClose }) => {
    
    const initialForm = {
        cedula: estudiante?.cedula || '',
        observacion: ''
    };

    const { form, handleChange, resetForm, setForm } = useForm(initialForm);

    useEffect(() => {
        setForm({
            cedula: estudiante?.cedula || '',
            observacion: ''
        });
    }, [estudiante, setForm]);

    // paso 3
    const [mensaje, setMensaje] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/observacion-estudiante`;
            const token = localStorage.getItem('token');
            const respuesta = await axios.post(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMensaje({ respuesta: respuesta.data.msg, tipo: true });
            setForm({ cedula: estudiante?.cedula || '', observacion: '' });
        } catch (error) {
            setMensaje({ respuesta: error.response.data.msg, tipo: false });
        }
    };

    return (
        <div>
            <div>
                {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="cedula">Cedula:</label>
                        <input
                            type="text"
                            id="cedula"
                            name='cedula'
                            value={form.cedula || ""}
                            onChange={handleChange}
                            placeholder="Ingresa cedula del estudiante"
                            className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                            required
                            readOnly
                        />
                    </div>
                    <div>
                        <label htmlFor="observacion" className="text-gray-700 uppercase font-bold text-sm">Observacion: </label>
                        <textarea
                            id="observacion"
                            name="observacion"
                            value={form.observacion || ""}
                            onChange={handleChange}
                            placeholder="Ingrese la observacion"
                            className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                            required
                        />
                    </div>
                    <div>
                        <button className="bg-gray-600 w-full p-3 text-slate-300 uppercase font-bold rounded-lg hover:bg-gray-900 cursor-pointer transition-al mt-4">
                            Registrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}