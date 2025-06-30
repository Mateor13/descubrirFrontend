import { useState, useEffect } from 'react'
import axios from 'axios';
import Mensaje from '../componets/Alertas/Mensajes'

export const ActualizarEstudiantes = ({ estudiante, id, onClose }) => {
    const [estudianteId, setEstudianteId] = useState(null);
    const [form, setform] = useState({
        nombre: "",
        apellido: "",
        cedula: ""
    });

    useEffect(() => {
        if (estudiante) {
            setEstudianteId(estudiante.id || estudiante._id);
            setform({
                nombre: estudiante.nombre || "",
                apellido: estudiante.apellido || "",
                cedula: estudiante.cedula || ""
            });
        }
    }, [estudiante]);

    const handleChange = (e) => {
        setform({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const [mensaje, setMensaje] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/modificar-estudiante/${estudianteId}`;
            const token = localStorage.getItem('token');
            const respuesta = await axios.patch(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMensaje({ respuesta: respuesta.data.msg, tipo: true });
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.error || "Error al actualizar", tipo: false });
        }
    };

    return (
        <>
            <div>
                <div>
                    {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="nombre">Nombre:</label>
                            <input type="text" id="nombre" name='nombre'
                                value={form.nombre || ""} onChange={handleChange}
                                placeholder="Ingresa tu nombre" className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5" required />
                        </div>

                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="apellido">Apellido:</label>
                            <input type="text" id="apellido" name='apellido'
                                value={form.apellido || ""} onChange={handleChange}
                                placeholder="Ingresa tu apellido" className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5" required />
                        </div>

                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="cedula">Cedula Estudiante:</label>
                            <input type="text" id="cedula" name='cedula'
                                value={form.cedula || ""} onChange={handleChange}
                                placeholder="Ingrese la cedula del estudiante" className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5" required />
                        </div>

                        <div>
                            <button className=" bg-gray-600 w-full p-3 text-slate-300 uppercase font-bold rounded-lg hover:bg-gray-900 cursor-pointer transition-al mt-4">
                                Actualizar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}