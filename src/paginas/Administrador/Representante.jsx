import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { RegisterRepresentante } from '../../componets/RegisterRepresentante'
import { ActualizarRepresentantes } from '../../componets/ActualizarRepresentantes'
import Mensaje from '../../componets/Alertas/Mensajes'
import { useAnioLectivo } from '../../hooks/useAnioLectivo'

const Representante = () => {
    const [mostrarRegistro, setMostrarRegistro] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [representanteEditar, setRepresentanteEditar] = useState(null);
    const [representantes, setRepresentantes] = useState([]);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [representanteEliminar, setRepresentanteEliminar] = useState(null);
    const [mensaje, setMensaje] = useState({}); 
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');

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

    useEffect(() => {
        const obtenerRepresentantes = async () => {
            if (!cursoSeleccionado) {
                setRepresentantes([]);
                return;
            }
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/representantes/${cursoSeleccionado}`;
                const token = localStorage.getItem('token');
                const { data } = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setRepresentantes(data);
            } catch (error) {
                setRepresentantes([]);
            }
        };
        obtenerRepresentantes();
    }, [cursoSeleccionado]);

    const handleEditar = (representante) => {
        setRepresentanteEditar({ ...representante, id: representante._id || representante.id });
        setMostrarEditar(true);
    };

    const handleEliminar = (representante) => {
        setRepresentanteEliminar(representante);
        setMostrarConfirmar(true);
    };

    const confirmarEliminar = async () => {
        if (!representanteEliminar || (!representanteEliminar._id && !representanteEliminar.id)) {
            setMostrarConfirmar(false);
            setRepresentanteEliminar(null);
            return;
        }
        try {
            const representanteId = representanteEliminar._id ? representanteEliminar._id : representanteEliminar.id;
            const url = `${import.meta.env.VITE_BACKEND_URL}/eliminar-representante/${representanteId}`;
            const token = localStorage.getItem('token');
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRepresentantes(prev =>
                prev.filter(rep =>
                    String(rep._id || rep.id) !== String(representanteId)
                )
            );
            setMensaje({ respuesta: "Representante eliminado correctamente.", tipo: true });
        } catch (error) {
            setMensaje({ 
                respuesta: error.response?.data?.error || error.response?.data?.msg || "Error al eliminar el representante.", 
                tipo: false 
            });
        }
        setMostrarConfirmar(false);
        setRepresentanteEliminar(null);
    };

    const closeModal = () => {
        setMostrarRegistro(false);
        setMostrarEditar(false);
        setRepresentanteEditar(null);
    };

    const closeConfirmar = () => {
        setMostrarConfirmar(false);
        setRepresentanteEliminar(null);
    };

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Registrar Representantes</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar un representante</p>
            
            {Object.keys(mensaje).length > 0 && (
                <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>
            )}

            <div className="flex justify-center mb-8 gap-4">
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
                { anioLectivoActivo && (
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMostrarRegistro(true)}
                >
                    Registrar Representante
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
                        <RegisterRepresentante />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarEditar && representanteEditar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <ActualizarRepresentantes 
                            representante={representanteEditar} 
                            id={representanteEditar._id || representanteEditar.id}
                            onClose={closeModal} 
                        />
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
                        <h2 className="text-xl font-bold mb-4">¿Estás seguro de eliminar este representante?</h2>
                        <p className="mb-4">{representanteEliminar?.nombre} {representanteEliminar?.apellido}</p>
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
                    <table className="min-w-full bg-white border border-gray-300 text-center">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-center">Nombre</th>
                                <th className="py-2 px-4 border-b text-center">Apellido</th>
                                <th className="py-2 px-4 border-b text-center">Email</th>
                                {anioLectivoActivo && <th className="py-2 px-4 border-b text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {representantes.map(rep => (
                                <tr key={rep._id || rep.id}>
                                    <td className="py-2 px-4 border-b text-center">{rep.nombre}</td>
                                    <td className="py-2 px-4 border-b text-center">{rep.apellido}</td>
                                    <td className="py-2 px-4 border-b text-center">{rep.email}</td>
                                    {anioLectivoActivo && (
                                    <td className="py-2 px-4 border-b text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                                onClick={() => handleEditar(rep)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                                                onClick={() => handleEliminar(rep)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                    )}
                                </tr>
                            ))}
                            {representantes.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">No hay representantes registrados para este curso.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!cursoSeleccionado && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Seleccione un curso para ver los representantes registrados</p>
                </div>
            )}
        </div>
    )
}

export default Representante