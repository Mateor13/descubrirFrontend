import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Mensaje from '../componets/Alertas/Mensajes';
import AuthContext from '../context/AuthProvider';

export const ActualizarNotasEstudiantes = () => {
    const { auth } = useContext(AuthContext); 
    const [form, setform] = useState({
        cedula: '',
        nota: '',
        motivo: '',
        materia: ''
    });
    const [cursos, setCursos] = useState([]); 
    const [materias, setMaterias] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [mensaje, setMensaje] = useState({});

    useEffect(() => {
        
        const fetchCursos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/profesor/cursos`;
                const token = localStorage.getItem('token'); 
                const respuesta = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                });
                setCursos(respuesta.data.cursosAsociados || []); 
            } catch (error) {
                setMensaje({ respuesta: error.response?.data?.error || "Error al obtener los cursos", tipo: false });
            }
        };
        fetchCursos();
    }, [auth.id]);

    const handleCursoChange = async (e) => {
        const cursoId = e.target.value;
        setCursoSeleccionado(cursoId);
        setform({ ...form, materia: '' }); 
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/profesor/${cursoId}/materias`;
            const token = localStorage.getItem('token'); 
            const respuesta = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const materiasDetalle = respuesta.data.materiasAsignadas.flatMap(asignacion => asignacion.materiasDetalle) || [];
            setMaterias(materiasDetalle); 
        } catch (error) {
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setform({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/actualizar-nota`;
            const token = localStorage.getItem('token'); 
            const respuesta = await axios.patch(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            setMensaje({ respuesta: respuesta.data.msg, tipo: true });
            setform({ cedula: '', nota: '', motivo: '', materia: '' });
            setCursoSeleccionado('');
            setMaterias([]);
        } catch (error) {
            setMensaje({ respuesta: error.response.data.error, tipo: false });
        }
    };

    return (
        <>
            <div>
                <div>
                    {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="cedula">Cedula:</label>
                            <input
                                type="text"
                                id="cedula"
                                name="cedula"
                                value={form.cedula || ""}
                                onChange={handleChange}
                                placeholder="Ingresa la cedula del estudiante"
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="curso">Seleccionar Curso:</label>
                            <select
                                id="curso"
                                name="curso"
                                value={cursoSeleccionado}
                                onChange={handleCursoChange}
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            >
                                <option value="">Seleccione un curso</option>
                                {Array.isArray(cursos) && cursos.map(curso => (
                                    <option key={curso._id} value={curso._id}>{curso.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {cursoSeleccionado && (
                            <div>
                                <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="materia">Seleccionar Materia:</label>
                                <select
                                    id="materia"
                                    name="materia"
                                    value={form.materia}
                                    onChange={handleChange}
                                    className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                    required
                                >
                                    <option value="">Seleccione una materia</option>
                                    {Array.isArray(materias) && materias.map(materia => (
                                        <option key={materia._id} value={materia._id}>{materia.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="motivo" className="text-gray-700 uppercase font-bold text-sm">Motivo: </label>
                            <textarea
                                id="motivo"
                                name="motivo"
                                value={form.motivo || ""}
                                onChange={handleChange}
                                placeholder="Ingrese el motivo de la nota"
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="nota">Nota:</label>
                            <input
                                type="number"
                                id="nota"
                                name="nota"
                                value={form.nota || ""}
                                onChange={handleChange}
                                placeholder="Ingresa la nota"
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            />
                        </div>

                        <div>
                            <button className="bg-gray-600 w-full p-3 text-slate-300 uppercase font-bold rounded-lg hover:bg-gray-900 cursor-pointer transition-al mt-4">Registrar</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ActualizarNotasEstudiantes;