import { useState, useEffect } from 'react'
import axios from 'axios';
import Mensaje from '../componets/Alertas/Mensajes'

export const ActualizarMaterias = ({ materia, onClose }) => {
    const [profesores, setProfesores] = useState([]);
    const [mensaje, setMensaje] = useState({});
    const [form, setForm] = useState({
        idMateria: '',
        nombre: '',
        idProfesorNuevo: ''
    });

    const [profPage, setProfPage] = useState(0);
    const profsPerPage = 5;
    const totalPages = Math.ceil(profesores.length / profsPerPage);
    const profesoresToShow = profesores.slice(profPage * profsPerPage, (profPage + 1) * profsPerPage);

    useEffect(() => {
        const obtenerProfesores = async () => {
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
            }
        };
        obtenerProfesores();

        if (materia) {
            setForm({
                idMateria: materia._id,
                nombre: materia.nombre || "",
                idProfesorNuevo: materia.profesor?._id || ""
            });
        }
        setProfPage(0);
    }, [materia]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handlePrev = () => {
        if (profPage > 0) setProfPage(profPage - 1);
    };

    const handleNext = () => {
        if (profPage < totalPages - 1) setProfPage(profPage + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/reasignar-materia/${form.idMateria}/${form.idProfesorNuevo}`;
            const token = localStorage.getItem('token');
            await axios.patch(
                url,
                {
                    nombre: form.nombre,
                    idProfesorNuevo: form.idProfesorNuevo
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setMensaje({ respuesta: "Materia actualizada correctamente.", tipo: true });
            if (onClose) setTimeout(onClose, 1200);
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.error, tipo: false });
        }
        
    };

    return (
        <>
            <div>
                <div>
                    {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="nombre">Materia:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
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
                                    <div key={prof._id} className="flex items-center mb-1">
                                        <input
                                            type="radio"
                                            id={`profesor-${prof._id}`}
                                            name="idProfesorNuevo"
                                            value={prof._id}
                                            checked={form.idProfesorNuevo === prof._id}
                                            onChange={handleChange}
                                            className="mr-2"
                                            required
                                        />
                                        <label htmlFor={`profesor-${prof._id}`}>
                                            {prof.nombre} {prof.apellido} - {prof.cedula}
                                        </label>
                                    </div>
                                ))}
                                {/* Navegación de páginas */}
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
                                Actualizar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}