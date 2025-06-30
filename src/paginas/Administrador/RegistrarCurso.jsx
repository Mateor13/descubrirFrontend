import React, { useState, useEffect } from 'react'
import { RegisterCursos } from '../../componets/RegisterCursos'
import Mensaje from '../../componets/Alertas/Mensajes'
import axios from 'axios'
import { useAnioLectivo } from '../../hooks/useAnioLectivo'

const RegistrarCurso = () => {
    const [mostrarRegistro, setMostrarRegistro] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [cursoEditar, setCursoEditar] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [mensaje, setMensaje] = useState({});
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [cursoEliminar, setCursoEliminar] = useState(null);

    const { anioLectivoActivo, loading: loadingAnio } = useAnioLectivo();

    // Refresca la lista de cursos desde el backend
    const fetchCursos = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/cursos`;
            const token = localStorage.getItem('token');
            const { data } = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Ordenar cursos por nivel de forma ascendente
            const cursosOrdenados = data.sort((a, b) => {
                // Ordenar por nivel primero
                if (a.nivel !== b.nivel) {
                    return a.nivel - b.nivel;
                }
                
                // Si los niveles son iguales, ordenar por paralelo
                return a.paralelo.localeCompare(b.paralelo);
            });
            setCursos(cursosOrdenados);
        } catch (error) {
            setCursos([]);
        }
    };

    useEffect(() => {
        fetchCursos();
    }, []);

    const handleEditar = (curso) => {
        setCursoEditar(curso);
        setMostrarEditar(true);
    };

    const handleEliminar = (curso) => {
        setCursoEliminar(curso);
        setMostrarConfirmar(true);
    };

    const confirmarEliminar = async () => {
        if (!cursoEliminar || (!cursoEliminar._id && !cursoEliminar.id)) {
            setMostrarConfirmar(false);
            setCursoEliminar(null);
            return;
        }
        try {
            const cursoId = cursoEliminar._id ? cursoEliminar._id : cursoEliminar.id;
            const url = `${import.meta.env.VITE_BACKEND_URL}/eliminar-curso/${cursoId}`;
            const token = localStorage.getItem('token');
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Refresca la lista después de eliminar
            await fetchCursos();
            setMensaje({ respuesta: "Curso eliminado correctamente.", tipo: true });
        } catch (error) {
            setMensaje({
                respuesta: error.response?.data?.error || error.response?.data?.msg || "Error al eliminar el curso.",
                tipo: false
            });
        }
        setMostrarConfirmar(false);
        setCursoEliminar(null);
    };

    // Refresca la tabla después de registrar
    const handleRegistroExitoso = async () => {
        setMostrarRegistro(false);
        setMensaje({ tipo: true, respuesta: "Curso registrado correctamente." });
        await fetchCursos();
    };

    const closeModal = async () => {
        setMostrarRegistro(false);
        setMostrarEditar(false);
        setCursoEditar(null);
        // Si editas cursos, aquí puedes refrescar también
        await fetchCursos();
    };

    const closeConfirmar = () => {
        setMostrarConfirmar(false);
        setCursoEliminar(null);
    };

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Registrar Curso</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar un curso</p>

            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
            {anioLectivoActivo && (
            <div className="flex justify-center mb-8">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMostrarRegistro(true)}
                >
                    Registrar Curso
                </button>
            </div>
            )}

            {!anioLectivoActivo && !loadingAnio && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8 text-center">
                    <p>⚠️ Las funciones de registro, edición y eliminación están deshabilitadas porque el año lectivo no está activo.</p>
                </div>
            )}

            {mostrarRegistro && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <RegisterCursos onRegistroExitoso={handleRegistroExitoso} />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarConfirmar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-center">
                        <h2 className="text-xl font-bold mb-4">¿Estás seguro de eliminar este curso?</h2>
                        <p className="mb-4">{cursoEliminar?.nombre}</p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
                                onClick={confirmarEliminar}
                            >
                                Eliminar
                            </button>
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={closeConfirmar}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 text-center">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-center">Cursos</th>
                            {anioLectivoActivo && <th className="py-2 px-4 border-b text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {cursos.map(curso => (
                            <tr key={curso._id || curso.id}>
                                <td className="py-2 px-4 border-b text-center">{curso.nombre}</td>
                                {anioLectivoActivo && (
                                <td className="py-2 px-4 border-b text-center">
                                    <button
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                                        onClick={() => handleEliminar(curso)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                                )}
                            </tr>                              
                        ))}
                        {cursos.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-4">No hay cursos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RegistrarCurso