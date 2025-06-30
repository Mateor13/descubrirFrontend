import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Register } from '../../componets/Register'
import { ActualizarAdministrador } from '../../componets/ActualizarAdministrador'
import Mensaje from '../../componets/Alertas/Mensajes'
import { useAnioLectivo } from '../../hooks/useAnioLectivo'

const Registrar = () => {
    const [mostrarRegistro, setMostrarRegistro] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [adminEditar, setAdminEditar] = useState(null);
    const [administradores, setAdministradores] = useState([]);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false); 
    const [adminEliminar, setAdminEliminar] = useState(null);
    const [mensaje, setMensaje] = useState({});
    
    // Hook para verificar si el año lectivo está activo
    const { anioLectivoActivo, loading: loadingAnio } = useAnioLectivo();

    const fetchAdministradores = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/administradores`;
            const token = localStorage.getItem('token');
            const { data } = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAdministradores(data);
        } catch (error) {
            setAdministradores([]);
        }
    };

    useEffect(() => {
        fetchAdministradores();
    }, []);

    const handleEditar = (admin) => {
        setAdminEditar({ ...admin, id: admin._id || admin.id }); 
        setMostrarEditar(true);
    };

    const handleEliminar = (admin) => {
        setAdminEliminar(admin);
        setMostrarConfirmar(true);
    };

    const confirmarEliminar = async () => {
        if (!adminEliminar || (!adminEliminar._id && !adminEliminar.id)) {
            setMostrarConfirmar(false);
            setAdminEliminar(null);
            return;
        }
        try {
            const adminId = adminEliminar._id ? adminEliminar._id : adminEliminar.id;
            const url = `${import.meta.env.VITE_BACKEND_URL}/eliminar-administrador/${adminId}`;
            const token = localStorage.getItem('token');
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchAdministradores();
            setMensaje({ tipo: true, respuesta: "Administrador eliminado correctamente." });
        } catch (error) {
            setMensaje({ tipo: false, respuesta: "Error al eliminar el administrador." });
        }
        setMostrarConfirmar(false);
        setAdminEliminar(null);
    };

    const handleRegistroExitoso = async () => {
        setMostrarRegistro(false);
        setMensaje({ tipo: true, respuesta: "Administrador registrado correctamente." });
        await fetchAdministradores();
    };

    const closeModal = async () => {
        setMostrarRegistro(false);
        setMostrarEditar(false);
        setAdminEditar(null);
        await fetchAdministradores();
    };

    const closeConfirmar = () => {
        setMostrarConfirmar(false);
        setAdminEliminar(null);
    };

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Agregar nuevo Administrador</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar un nuevo administrador</p>
            
            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

            {anioLectivoActivo && (
                <div className="flex justify-center mb-8">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={() => setMostrarRegistro(true)}
                    >
                        Registrar Administrador
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
                        <Register onRegistroExitoso={handleRegistroExitoso} />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarEditar && adminEditar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <ActualizarAdministrador admin={adminEditar} onClose={closeModal} />
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
                        <h2 className="text-xl font-bold mb-4">¿Estás seguro de eliminar este administrador?</h2>
                        <p className="mb-4">{adminEliminar?.nombre} {adminEliminar?.apellido}</p>
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
                            {anioLectivoActivo && <th className="py-2 px-4 border-b text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {administradores.map(admin => (
                            <tr key={admin._id || admin.id}>
                                <td className="py-2 px-4 border-b text-center">{admin.nombre}</td>
                                <td className="py-2 px-4 border-b text-center">{admin.apellido}</td>
                                <td className="py-2 px-4 border-b text-center">{admin.email}</td>
                                {anioLectivoActivo && (
                                    <td className="py-2 px-4 border-b text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                                onClick={() => handleEditar(admin)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                                                onClick={() => handleEliminar(admin)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {administradores.length === 0 && (
                            <tr>
                                <td colSpan={anioLectivoActivo ? "4" : "3"} className="text-center py-4">No hay administradores registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Registrar