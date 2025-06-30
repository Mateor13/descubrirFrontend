import React, { useState, useEffect } from 'react'
import { RegisterMaterias } from '../../componets/RegisterMaterias'
import { ActualizarMaterias } from '../../componets/ActualizarMaterias'
import Mensaje from '../../componets/Alertas/Mensajes'
import axios from 'axios'
import { useAnioLectivo } from '../../hooks/useAnioLectivo'

const RegistrarMateria = () => {
    const [mostrarRegistro, setMostrarRegistro] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [materiaEditar, setMateriaEditar] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [mensaje, setMensaje] = useState({});
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [materiaEliminar, setMateriaEliminar] = useState(null);

    // Hook para verificar si el año lectivo está activo
    const { anioLectivoActivo, loading: loadingAnio } = useAnioLectivo();

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

    const fetchMaterias = async () => {
        if (!cursoSeleccionado) {
            setMaterias([]);
            return;
        }
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/materias/${cursoSeleccionado}`;
            const token = localStorage.getItem('token');
            const { data } = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMaterias(data);
        } catch (error) {
            setMaterias([]);
        }
    };

    useEffect(() => {
        fetchMaterias();
    }, [cursoSeleccionado]);

    const handleEditar = (materia) => {
        setMateriaEditar(materia);
        setMostrarEditar(true);
    };

    const handleEliminar = (materia) => {
        setMateriaEliminar(materia);
        setMostrarConfirmar(true);
    };

    const confirmarEliminar = async () => {
        if (!materiaEliminar || (!materiaEliminar._id && !materiaEliminar.id)) {
            setMostrarConfirmar(false);
            setMateriaEliminar(null);
            return;
        }
        try {
            const materiaId = materiaEliminar._id ? materiaEliminar._id : materiaEliminar.id;
            const url = `${import.meta.env.VITE_BACKEND_URL}/eliminar-materia/${materiaId}`;
            const token = localStorage.getItem('token');
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            await fetchMaterias();
            setMensaje({ respuesta: "Materia eliminada correctamente.", tipo: true });
        } catch (error) {
            setMensaje({
                respuesta: error.response?.data?.error || error.response?.data?.msg || "Error al eliminar la materia.",
                tipo: false
            });
        }
        setMostrarConfirmar(false);
        setMateriaEliminar(null);
    };

    const handleRegistroExitoso = async () => {
        setMostrarRegistro(false);
        setMensaje({ tipo: true, respuesta: "Materia registrada correctamente." });
        await fetchMaterias();
    };

    const closeModal = async () => {
        setMostrarRegistro(false);
        setMostrarEditar(false);
        setMateriaEditar(null);
        await fetchMaterias();
    };

    const closeConfirmar = () => {
        setMostrarConfirmar(false);
        setMateriaEliminar(null);
    };

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Registrar Materias</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar una materia</p>

            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

            <div className="flex justify-center mb-8">
                <select
                    className="border-2 p-2 rounded-md"
                    value={cursoSeleccionado}
                    onChange={e => setCursoSeleccionado(e.target.value)}
                >
                    <option value="">Seleccione un curso</option>
                    {cursos.map(curso => (
                        <option key={curso._id || curso.id} value={curso._id || curso.id}>
                            {curso.nombre}
                        </option>
                    ))}
                </select>
                {anioLectivoActivo && (
                <button
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMostrarRegistro(true)}
                >
                    Registrar Materia
                </button>
                )}
            </div>

            {!anioLectivoActivo && !loadingAnio && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8 text-center">
                    <p>⚠️ Las funciones de registro, edición y eliminación están deshabilitadas porque el año lectivo no está activo.</p>
                </div>
            )}

            {mostrarRegistro && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <RegisterMaterias onRegistroExitoso={handleRegistroExitoso} />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarEditar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <ActualizarMaterias materia={materiaEditar} onClose={closeModal} />
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
                        <h2 className="text-xl font-bold mb-4">¿Estás seguro de eliminar esta materia?</h2>
                        <p className="mb-4">{materiaEliminar?.nombre}</p>
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

            {cursoSeleccionado && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Nombre Materia</th>
                                <th className="py-2 px-4 border-b">Profesor</th>
                                 {anioLectivoActivo && <th className="py-2 px-4 border-b">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {materias.map(mat => (
                                <tr key={mat._id || mat.id}>
                                    <td className="py-2 px-4 border-b text-center">{mat.nombre}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        {mat.profesor ? `${mat.profesor.nombre} ${mat.profesor.apellido}` : '-'}
                                    </td>
                                    {anioLectivoActivo && (
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            className="bg-yellow-400 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                                            onClick={() => handleEditar(mat)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                                            onClick={() => handleEliminar(mat)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                    )}
                                </tr>
                            ))}
                            {materias.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-4">No hay materias registradas para este curso.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!cursoSeleccionado && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Seleccione un curso para ver las materias registradas</p>
                </div>
            )}
        </div>
    )
}

export default RegistrarMateria