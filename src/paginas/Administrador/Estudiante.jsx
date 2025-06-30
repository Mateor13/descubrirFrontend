import React, { useState, useEffect } from 'react'
import { RegisterEstudiantes } from '../../componets/RegisterEstudiantes'
import { ActualizarEstudiantes } from '../../componets/ActualizarEstudiantes'
import { AsingRepresentante } from '../../componets/AsignarRepresentante'
import { ReasignarCurso } from '../../componets/ReasignarCurso'
import Mensaje from '../../componets/Alertas/Mensajes'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { useAnioLectivo } from '../../hooks/useAnioLectivo'

const RegistrarEstudiante = () => {
    const location = useLocation();
    const cedulaRepresentanteInicial = location.state?.cedulaRepresentante || null;
    const abrirAsignarRepresentante = location.state?.abrirAsignarRepresentante || false;
    const estudianteParaAsignar = location.state?.estudianteParaAsignar || null;
    const cedulaRepresentanteParaAsignar = location.state?.cedulaRepresentante || null;
    const [mostrarRegistro, setMostrarRegistro] = useState(false)
    const [mostrarEditar, setMostrarEditar] = useState(false)
    const [estudianteEditar, setEstudianteEditar] = useState(null)
    const [estudiantes, setEstudiantes] = useState([])
    const [cursos, setCursos] = useState([])
    const [cursoSeleccionado, setCursoSeleccionado] = useState('')
    const [mensaje, setMensaje] = useState({})
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
    const [estudianteEliminar, setEstudianteEliminar] = useState(null)
    const [mostrarAsignarRepresentante, setMostrarAsignarRepresentante] = useState(false)
    const [estudianteAsignarRep, setEstudianteAsignarRep] = useState(null)
    const [mostrarReasignarCurso, setMostrarReasignarCurso] = useState(false)
    const [estudianteReasignar, setEstudianteReasignar] = useState(null)

    // Hook para verificar si el año lectivo está activo
    const { anioLectivoActivo, loading: loadingAnio } = useAnioLectivo();

    useEffect(() => {
        const obtenerCursos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/cursos`
                const token = localStorage.getItem('token')
                const { data } = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                setCursos(data)
            } catch (error) {
                setCursos([])
            }
        }
        obtenerCursos()
    }, [])

    const fetchEstudiantes = async () => {
        if (!cursoSeleccionado) {
            setEstudiantes([])
            return
        }
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/cursos/${cursoSeleccionado}/estudiantes`
            const token = localStorage.getItem('token')
            const { data } = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setEstudiantes(data)
        } catch (error) {
            setEstudiantes([])
        }
    }

    useEffect(() => {
        fetchEstudiantes()
    }, [cursoSeleccionado])

    const handleEditar = (estudiante) => {
        setEstudianteEditar(estudiante)
        setMostrarEditar(true)
    }

    const handleEliminar = (estudiante) => {
        setEstudianteEliminar(estudiante)
        setMostrarConfirmar(true)
    }

    const handleAsignarRepresentante = (estudiante) => {
        setEstudianteAsignarRep(estudiante)
        setMostrarAsignarRepresentante(true)
    }

    const handleReasignarCurso = (estudiante) => {
        setEstudianteReasignar(estudiante)
        setMostrarReasignarCurso(true)
    }

    const confirmarEliminar = async () => {
        if (!estudianteEliminar || (!estudianteEliminar._id && !estudianteEliminar.id)) {
            setMostrarConfirmar(false)
            setEstudianteEliminar(null)
            return
        }
        try {
            const estudianteId = estudianteEliminar._id ? estudianteEliminar._id : estudianteEliminar.id
            const url = `${import.meta.env.VITE_BACKEND_URL}/eliminar-estudiante/${estudianteId}`
            const token = localStorage.getItem('token')
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            await fetchEstudiantes()
            setMensaje({ respuesta: "Estudiante eliminado correctamente.", tipo: true })
        } catch (error) {
            setMensaje({
                respuesta: error.response?.data?.error || error.response?.data?.msg || "Error al eliminar el estudiante.",
                tipo: false
            })
        }
        setMostrarConfirmar(false)
        setEstudianteEliminar(null)
    }

    const closeModal = () => {
        setMostrarRegistro(false)
        setMostrarEditar(false)
        setEstudianteEditar(null)
    }

    const closeConfirmar = () => {
        setMostrarConfirmar(false)
        setEstudianteEliminar(null)
    }

    const closeAsignarRepresentante = () => {
        setMostrarAsignarRepresentante(false)
        setEstudianteAsignarRep(null)
    }

    const closeReasignarCurso = () => {
        setMostrarReasignarCurso(false)
        setEstudianteReasignar(null)
    }

    const handleRegistroExitoso = async () => {
        setMostrarRegistro(false)
        setMensaje({ tipo: true, respuesta: "Estudiante registrado correctamente." })
        await fetchEstudiantes()
    }

    // Abrir modal automáticamente si viene desde RegisterRepresentante
    useEffect(() => {
        if (cedulaRepresentanteInicial) {
            setMostrarRegistro(true);
        }
        if (abrirAsignarRepresentante && estudianteParaAsignar) {
            setEstudianteAsignarRep(estudianteParaAsignar);
            setMostrarAsignarRepresentante(true);
        }
    }, [cedulaRepresentanteInicial, abrirAsignarRepresentante, estudianteParaAsignar]);

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Registrar Estudiante</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar un estudiante</p>

            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

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
                    Registrar Estudiante
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
                        <RegisterEstudiantes 
                            onRegistroExitoso={handleRegistroExitoso} 
                            cedulaRepresentanteInicial={cedulaRepresentanteInicial}
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

            {mostrarEditar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <ActualizarEstudiantes estudiante={estudianteEditar} onClose={closeModal} />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarAsignarRepresentante && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <AsingRepresentante 
                            estudiante={estudianteAsignarRep} 
                            cedulaRepresentanteInicial={cedulaRepresentanteParaAsignar}
                        />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeAsignarRepresentante}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarReasignarCurso && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <ReasignarCurso estudiante={estudianteReasignar} onClose={closeReasignarCurso} />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={closeReasignarCurso}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {mostrarConfirmar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm text-center">
                        <h2 className="text-xl font-bold mb-4">¿Estás seguro de eliminar este estudiante?</h2>
                        <p className="mb-4">{estudianteEliminar?.nombre} {estudianteEliminar?.apellido}</p>
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
                                <th className="py-2 px-4 border-b text-center">Cédula</th>
                                { anioLectivoActivo && (<th className="py-2 px-4 border-b text-center">Acciones</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map(est => (
                                <tr key={est._id || est.id}>
                                    <td className="py-2 px-4 border-b text-center">{est.nombre}</td>
                                    <td className="py-2 px-4 border-b text-center">{est.apellido}</td>
                                    <td className="py-2 px-4 border-b text-center">{est.cedula}</td>
                                    { anioLectivoActivo && (
                                    <td className="py-2 px-4 border-b text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                                onClick={() => handleEditar(est)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-800"
                                                onClick={() => handleAsignarRepresentante(est)}
                                                title="Asignar Representante"
                                            >
                                                Asignar Rep.
                                            </button>
                                            <button
                                                className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-800"
                                                onClick={() => handleReasignarCurso(est)}
                                                title="Reasignar Curso"
                                            >
                                                Reasignar Curso
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800"
                                                onClick={() => handleEliminar(est)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                    )}
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
                    <p className="text-gray-500 text-lg">Seleccione un curso para ver los estudiantes registrados</p>
                </div>
            )}
        </div>
    )
}

export default RegistrarEstudiante