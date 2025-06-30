import { useEffect, useState } from 'react'
import axios from 'axios';
import Mensaje from './Alertas/Mensajes'
import { useForm } from '../hooks/useForm'

export const JustifyInasistencia = () => {

    const initialForm = {
        curso: "",
        estudiante: "",
        justificacion: "",
        fecha: ""
    };

    const { form, handleChange, resetForm, setFormValue } = useForm(initialForm);

    const [cursos, setCursos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [mensaje, setMensaje] = useState({})

    // Obtener cursos al cargar el componente
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
        obtenerCursos();
    }, []);

    // Obtener estudiantes cuando se selecciona un curso
    useEffect(() => {
        if (form.curso) {
            const obtenerEstudiantes = async () => {
                try {
                    const url = `${import.meta.env.VITE_BACKEND_URL}/cursos/${form.curso}/estudiantes`
                    const token = localStorage.getItem('token');
                    const { data } = await axios.get(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    // Ordenar estudiantes por apellido y luego por nombre
                    const estudiantesOrdenados = data.sort((a, b) => {
                        const apellidoComparison = a.apellido.localeCompare(b.apellido);
                        if (apellidoComparison !== 0) {
                            return apellidoComparison;
                        }
                        return a.nombre.localeCompare(b.nombre);
                    });
                    setEstudiantes(estudiantesOrdenados);
                } catch (error) {
                    setEstudiantes([]);
                }
            };
            obtenerEstudiantes();
        } else {
            setEstudiantes([]);
            setFormValue("estudiante", "");
        }
    }, [form.curso]);

    const formatFecha = (fecha) => {
        const [year, month, day] = fecha.split('-');
        return `${year}/${month}/${day}`;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Obtener la cédula del estudiante seleccionado
        const estudianteSeleccionado = estudiantes.find(est => est._id === form.estudiante);
        
        const formattedForm = {
            cedula: estudianteSeleccionado?.cedula,
            justificacion: form.justificacion,
            fecha: formatFecha(form.fecha)
        };
        
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/justificar-inasistencia`;
            const token = localStorage.getItem('token');

            const respuesta = await axios.patch(url, formattedForm, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMensaje({ respuesta: respuesta.data.msg, tipo: true });
            resetForm();
            
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.error || error.response?.data?.msg || "Error al justificar inasistencia", tipo: false });
        }
        
    };

    // Obtener la fecha actual en formato YYYY-MM-DD (horario de Ecuador)
    const today = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" })
    ).toISOString().split('T')[0];

    return (
        <div>
            <div>
                {Object.keys(mensaje).length > 0 && (
                    <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>
                )}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="curso">
                            Curso:
                        </label>
                        <select
                            id="curso"
                            name="curso"
                            value={form.curso || ""}
                            onChange={handleChange}
                            className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                            required
                        >
                            <option value="">Seleccione un curso</option>
                            {cursos.map((curso) => (
                                <option key={curso._id} value={curso._id}>
                                    {curso.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="estudiante">
                            Estudiante:
                        </label>
                        <select
                            id="estudiante"
                            name="estudiante"
                            value={form.estudiante || ""}
                            onChange={handleChange}
                            className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                            required
                            disabled={!form.curso}
                        >
                            <option value="">
                                {!form.curso ? "Primero seleccione un curso" : "Seleccione un estudiante"}
                            </option>
                            {estudiantes.map((estudiante) => (
                                <option key={estudiante._id} value={estudiante._id}>
                                    {`${estudiante.apellido}, ${estudiante.nombre} - ${estudiante.cedula}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="fecha">
                            Fecha de Inasistencia:
                        </label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={form.fecha || ""}
                            onChange={handleChange}
                            max={today} // Limitar a la fecha actual
                            className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="justificacion"
                            className="text-gray-700 uppercase font-bold text-sm"
                        >
                            Justificación:
                        </label>
                        <textarea
                            id="justificacion"
                            name="justificacion"
                            value={form.justificacion}
                            onChange={handleChange}
                            placeholder="Ingrese la justificación"
                            className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5 min-h-[90px] resize-none"
                            required
                        />
                    </div>

                    <div>
                        <button
                            className="bg-gray-600 w-full p-3 text-slate-300 uppercase font-bold rounded-lg hover:bg-gray-900 cursor-pointer transition-all mt-4"
                        >
                            Registrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}