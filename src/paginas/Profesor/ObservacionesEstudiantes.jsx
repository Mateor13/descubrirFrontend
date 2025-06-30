import React, { useEffect, useState } from 'react'
import { ObservacionEstudiante } from '../../componets/ObservacionEstudiante'
import axios from 'axios'
import Mensaje from '../../componets/Alertas/Mensajes'

const ObservacionesEstudiantes = () => {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [estudiantes, setEstudiantes] = useState([]);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [mensaje, setMensaje] = useState({});

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/profesor/cursos`;
                const token = localStorage.getItem('token');
                const respuesta = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCursos(respuesta.data.cursosAsociados || []);
                setMensaje({});
            } catch (error) {
                setCursos([]);
                setMensaje({
                    tipo: false,
                    respuesta: error.response?.data?.error || "Error al cargar los cursos."
                });
            }
        };
        fetchCursos();
    }, []);

    useEffect(() => {
        if (!cursoSeleccionado) {
            setEstudiantes([]);
            return;
        }
        const fetchEstudiantes = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/estudiantes/${cursoSeleccionado}`;
                const token = localStorage.getItem('token');
                const respuesta = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setEstudiantes(respuesta.data.estudiantes || []);
                setMensaje({});
            } catch (error) {
                setEstudiantes([]);
                setMensaje({
                    tipo: false,
                    respuesta: error.response?.data?.error || "Error al cargar los estudiantes."
                    
                });
            }
        };
        fetchEstudiantes();
    }, [cursoSeleccionado]);

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500'>Observaciones</h1>
            <hr className='my-4' />
            <p className='mb-8'>Este modulo te permite registrar observaciones de los estudiantes</p>
            {Object.keys(mensaje).length > 0 && (
                <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>
            )}
            <div className="flex justify-center mb-8">
                <select
                    className="border-2 p-2 rounded-md"
                    value={cursoSeleccionado}
                    onChange={e => setCursoSeleccionado(e.target.value)}
                >
                    <option value="">Seleccione un curso</option>
                    {cursos.map(curso => (
                        <option key={curso.id} value={curso.id}>
                            {curso.nombre}
                        </option>
                    ))}
                </select>
            </div>
            
            {cursoSeleccionado && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-center">Cédula</th>
                                <th className="py-2 px-4 border-b text-center">Nombre</th>
                                <th className="py-2 px-4 border-b text-center">Apellido</th>
                                <th className="py-2 px-4 border-b text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map(est => (
                                <tr key={est._id || est.id}>
                                    <td className="py-1 px-4 border-b text-center">{est.cedula}</td>
                                    <td className="py-1 px-4 border-b text-center">{est.nombre}</td>
                                    <td className="py-1 px-4 border-b text-center">{est.apellido}</td>
                                    <td className="py-1 px-4 border-b text-center">
                                        <button
                                            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-800"
                                            onClick={() => setEstudianteSeleccionado(est)}
                                        >
                                            Registrar Observación
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {estudiantes.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">No hay estudiantes registrados para este curso.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!cursoSeleccionado && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Seleccione un curso para ver los estudiantes</p>
                </div>
            )}
            
            {estudianteSeleccionado && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                        <ObservacionEstudiante
                            estudiante={estudianteSeleccionado}
                            onClose={() => setEstudianteSeleccionado(null)}
                        />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={() => setEstudianteSeleccionado(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ObservacionesEstudiantes