import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { RegisterProfesores } from '../../componets/RegisterProfesores'
import { ActualizarProfesores } from '../../componets/ActualizarProfesores'
import Mensaje from '../../componets/Alertas/Mensajes'
import { useAnioLectivo } from '../../hooks/useAnioLectivo'

const Profesores = () => {
    const [mostrarRegistro, setMostrarRegistro] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [profesorEditar, setProfesorEditar] = useState(null);
    const [profesores, setProfesores] = useState([]);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [profesorEliminar, setProfesorEliminar] = useState(null);
    const [mensaje, setMensaje] = useState({});

    // Hook para verificar si el año lectivo está activo
    const { anioLectivoActivo, loading: loadingAnio } = useAnioLectivo();

    const fetchProfesores = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/profesores`;
            const token = localStorage.getItem('token');
            const { data } = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setProfesores(data);
        } catch (error) {
            setProfesores([]);
            setMensaje({
                tipo: false,
                respuesta: error.response?.data?.msg || "Error al cargar los profesores."
            });
        }
    };

    useEffect(() => {
        fetchProfesores();
    }, []);

    const handleEditar = (profesor) => {
        setProfesorEditar({ ...profesor, id: profesor._id || profesor.id });
        setMostrarEditar(true);
    };

    const handleEliminar = (profesor) => {
        setProfesorEliminar(profesor);
        setMostrarConfirmar(true);
    };

    const confirmarEliminar = async () => {
        if (!profesorEliminar || (!profesorEliminar._id && !profesorEliminar.id)) {
            setMostrarConfirmar(false);
            setProfesorEliminar(null);
            return;
        }
        try {
            const profesorId = profesorEliminar._id ? profesorEliminar._id : profesorEliminar.id;
            const url = `${import.meta.env.VITE_BACKEND_URL}/eliminar-profesor/${profesorId}`;
            const token = localStorage.getItem('token');
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchProfesores();
            setMensaje({ tipo: true, respuesta: "Profesor eliminado correctamente." });
        } catch (error) {
            setMensaje({
                tipo: false,
                respuesta: error.response?.data?.msg || error.response?.data?.error || "No se pudo eliminar el profesor."
            });
        }
        setMostrarConfirmar(false);
        setProfesorEliminar(null);
    };

    const handleRegistroExitoso = async () => {
        setMostrarRegistro(false);
        setMensaje({ tipo: true, respuesta: "Profesor registrado correctamente." });
        await fetchProfesores();
    };

    const closeModal = async () => {
        setMostrarRegistro(false);
        setMostrarEditar(false);
        setProfesorEditar(null);
        await fetchProfesores();
    };

    const closeConfirmar = () => {
        setMostrarConfirmar(false);
        setProfesorEliminar(null);
    };

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Registrar Profesores</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar un profesor</p>
            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
            
            {anioLectivoActivo &&(
            <div className="flex justify-center mb-8">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={() => setMostrarRegistro(true)}
                >
                    Registrar Profesor
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
                        <RegisterProfesores onRegistroExitoso={handleRegistroExitoso} />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarEditar && profesorEditar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <ActualizarProfesores 
                            profesor={profesorEditar} 
                            id={profesorEditar._id || profesorEditar.id}
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
                        <h2 className="text-xl font-bold mb-4">¿Estás seguro de eliminar este profesor?</h2>
                        <p className="mb-4">{profesorEliminar?.nombre} {profesorEliminar?.apellido}</p>
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
                            <th className="py-2 px-4 border-b text-center">Nombre</th>
                            <th className="py-2 px-4 border-b text-center">Apellido</th>
                            <th className="py-2 px-4 border-b text-center">Email</th>
                            {anioLectivoActivo && (<th className="py-2 px-4 border-b text-center">Acciones</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {profesores.map(prof => (
                            <tr key={prof._id || prof.id}>
                                <td className="py-2 px-4 border-b text-center">{prof.nombre}</td>
                                <td className="py-2 px-4 border-b text-center">{prof.apellido}</td>
                                <td className="py-2 px-4 border-b text-center">{prof.email}</td>
                                {anioLectivoActivo && (
                                <td className="py-2 px-4 border-b text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                            onClick={() => handleEditar(prof)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                                            onClick={() => handleEliminar(prof)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                                )}
                            </tr>
                        ))}
                        {profesores.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No hay profesores registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Profesores