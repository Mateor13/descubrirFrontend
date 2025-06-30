import { useState, useEffect } from 'react'
import axios from 'axios';
import Mensaje from '../componets/Alertas/Mensajes'

export const RegisterMaterias = () => {
    // paso 1 
    const [form, setform] = useState({
        curso: '',
        nombre: '',
        cedulaProfesor: ''
    })

    const [cursos, setCursos] = useState([]) 
    const [profesores, setProfesores] = useState([])
    const [mensaje, setMensaje] = useState({}) 

    
    useEffect(() => {
        const obtenerCursos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/cursos`
                const token = localStorage.getItem('token'); 
                const respuesta = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                });
                setCursos(respuesta.data) 
            } catch (error) {
                setMensaje({ respuesta: error.response?.data?.error || "Error al obtener los cursos", tipo: false });
            }
        }
        obtenerCursos()
    }, [])

    
    useEffect(() => {
        const obtenerProfesores = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/profesores`
                const token = localStorage.getItem('token'); 
                const respuesta = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                });
                setProfesores(respuesta.data) 
            } catch (error) {
            }
        }
        obtenerProfesores()
    }, [])

    const handleChange = (e) => {
        setform({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleProfesorChange = (e) => {
        setform({
            ...form,
            cedulaProfesor: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/registro-materia`;
            const token = localStorage.getItem('token');
            const respuesta = await axios.post(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMensaje({ respuesta: respuesta.data.msg, tipo: true });
            setform({ curso: '', nombre: '', cedulaProfesor: '' }); 
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.error || "Error al registrar la materia", tipo: false });
        }

    };

    
    const [profPage, setProfPage] = useState(0);
    const profsPerPage = 5;
    const totalPages = Math.ceil(profesores.length / profsPerPage);

    const profesoresToShow = profesores.slice(profPage * profsPerPage, (profPage + 1) * profsPerPage);

    const handlePrev = () => {
        if (profPage > 0) setProfPage(profPage - 1);
    };

    const handleNext = () => {
        if (profPage < totalPages - 1) setProfPage(profPage + 1);
    };

    return (
        <>
            <div>
                <div>
                    {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

                    <form onSubmit={handleSubmit}>
                        
                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="curso">Curso:</label>
                            <select
                                id="curso"
                                name="curso"
                                value={form.curso}
                                onChange={handleChange}
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            >
                                <option value="">Selecciona un curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso._id} value={curso._id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="nombre">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={form.nombre || ""}
                                onChange={handleChange}
                                placeholder="Ingresa el nombre de la materia"
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm">Profesor:</label>
                            <div className="border-2 w-full p-2 mt-2 rounded-md mb-5 max-h-40 overflow-y-auto">
                                {profesores.length === 0 && (
                                    <div className="text-gray-500">No hay profesores registrados.</div>
                                )}
                                {profesoresToShow.map((prof) => (
                                    <div key={prof.cedula} className="flex items-center mb-1">
                                        <input
                                            type="radio"
                                            id={`profesor-${prof.cedula}`}
                                            name="cedulaProfesor"
                                            value={prof.cedula}
                                            checked={form.cedulaProfesor === prof.cedula}
                                            onChange={handleProfesorChange}
                                            className="mr-2"
                                            required
                                        />
                                        <label htmlFor={`profesor-${prof.cedula}`}>
                                            {prof.nombre} {prof.apellido} - {prof.cedula}
                                        </label>
                                    </div>
                                ))}
                                
                                {profesores.length > profsPerPage && (
                                    <div className="flex justify-between mt-2">
                                        <button
                                            type="button"
                                            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                                            onClick={handlePrev}
                                            disabled={profPage === 0}
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            Página {profPage + 1} de {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                                            onClick={handleNext}
                                            disabled={profPage === totalPages - 1}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <button className="bg-gray-600 w-full p-3 text-slate-300 uppercase font-bold rounded-lg hover:bg-gray-900 cursor-pointer transition-all mt-4">
                                Registrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}