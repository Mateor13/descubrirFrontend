import { useState, useEffect } from 'react'
import axios from 'axios'
import Mensaje from './Alertas/Mensajes'

export const ReasignarCurso = ({ estudiante, onClose }) => {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [mensaje, setMensaje] = useState({});

    useEffect(() => {
        const obtenerCursos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/cursos`;
                const token = localStorage.getItem('token');
                const { data } = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCursos(data);
            } catch (error) {
                setCursos([]);
            }
        };
        obtenerCursos();
    }, []);

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cursoSeleccionado || !estudiante?._id) {
        setMensaje({ respuesta: "Seleccione un curso y estudiante válido.", tipo: false });
        return;
    }
    try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/reasignar-curso/${cursoSeleccionado}/${estudiante._id}`;
        const token = localStorage.getItem('token');
        const body = {
            idCurso: cursoSeleccionado,
            idEstudiante: estudiante._id
        };
  
        await axios.patch(url, body, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        setMensaje({ respuesta: "Curso reasignado correctamente.", tipo: true });
        if (onClose) setTimeout(onClose, 1200);
    } catch (error) {
        setMensaje({ respuesta: error.response?.data?.error || "Error al reasignar el curso.", tipo: false });
    }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-center">Reasignar Curso</h2>
            {Object.keys(mensaje).length > 0 && (
                <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="curso">
                        Seleccione el nuevo curso:
                    </label>
                    <select
                        id="curso"
                        className="border-2 w-full p-2 rounded-md"
                        value={cursoSeleccionado}
                        onChange={e => setCursoSeleccionado(e.target.value)}
                        required
                    >
                        <option value="">Seleccione un curso</option>
                        {cursos.map(curso => (
                            <option key={curso._id || curso.id} value={curso._id || curso.id}>
                                {curso.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 w-full p-2 text-white uppercase font-bold rounded-lg hover:bg-blue-800 transition-all"
                >
                    Reasignar
                </button>
            </form>
        </div>
    );
};