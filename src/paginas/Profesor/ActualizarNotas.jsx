import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Mensaje from '../../componets/Alertas/Mensajes';
import AuthContext from '../../context/AuthProvider';
import { useAnioLectivo } from '../../hooks/useAnioLectivo';

export const ActualizarNotas = () => {
    const { auth } = useContext(AuthContext);
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [tipo, setTipo] = useState('');
    const [tiposDisponibles, setTiposDisponibles] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState('');
    const [estudiantes, setEstudiantes] = useState([]);
    const [mensaje, setMensaje] = useState({});
    const [notas, setNotas] = useState({});
    const [enviando, setEnviando] = useState(false);

    // Hook para verificar si el año lectivo está activo
    const { anioLectivoActivo, loading: loadingAnio } = useAnioLectivo();

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/profesor/cursos`;
                const token = localStorage.getItem('token');
                const respuesta = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCursos(respuesta.data.cursosAsociados || []);
            } catch (error) {
                setCursos([]);
            }
        };
        fetchCursos();
    }, [auth.id]);

    useEffect(() => {
        const fetchMaterias = async () => {
            if (!cursoSeleccionado) {
                setMaterias([]);
                return;
            }
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/profesor/${cursoSeleccionado}/materias`;
                const token = localStorage.getItem('token');
                const respuesta = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const materiasDetalle = respuesta.data.materiasAsignadas
                    ? respuesta.data.materiasAsignadas.flatMap(asignacion => asignacion.materiasDetalle) || []
                    : respuesta.data.materias || [];
                setMaterias(materiasDetalle);
            } catch (error) {
                setMaterias([]);
            }
        };
        fetchMaterias();
    }, [cursoSeleccionado]);

    useEffect(() => {
        const fetchTipos = async () => {
            if (!materiaSeleccionada || !tipo) {
                setTiposDisponibles([]);
                setTipoSeleccionado('');
                return;
            }
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/tipos/${materiaSeleccionada}/${tipo}`;
                const token = localStorage.getItem('token');
                const respuesta = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setTiposDisponibles(
                    Array.isArray(respuesta.data.descripciones)
                        ? respuesta.data.descripciones.map((desc, idx) =>
                            typeof desc === 'object'
                                ? desc
                                : { id: idx, nombre: desc }
                        )
                        : []
                );
                setTipoSeleccionado('');
            } catch (error) {
                setTiposDisponibles([]);
                setTipoSeleccionado('');
            }
        };
        fetchTipos();
    }, [materiaSeleccionada, tipo]);

    useEffect(() => {
    const fetchNotasYEstudiantes = async () => {
        if (!materiaSeleccionada || !tipo || !tipoSeleccionado || !cursoSeleccionado) {
            setEstudiantes([]);
            setNotas({});
            return;
        }
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/descripcion/${cursoSeleccionado}/${materiaSeleccionada}/${tipo}`;
            const token = localStorage.getItem('token');
            const respuesta = await axios.post(
                url,
                { descripcion: tipoSeleccionado },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const estudiantesResp = Array.isArray(respuesta.data.estudiantes) ? respuesta.data.estudiantes : [];
            setEstudiantes(estudiantesResp);
            const notasMap = {};
            estudiantesResp.forEach(est => {
                notasMap[est.id] = est.nota;
            });
            setNotas(notasMap);
        } catch (error) {
            setEstudiantes([]);
            setNotas({});
        }
    };

    fetchNotasYEstudiantes();
}, [materiaSeleccionada, tipo, tipoSeleccionado, cursoSeleccionado]);

    const handleNotaChange = (id, value) => {
        if (value === '') {
            setNotas({ ...notas, [id]: '' });
            return;
        }
        let numVal = Number(value);
        if (numVal < 1) numVal = 1;
        if (numVal > 10) numVal = 10;
        setNotas({ ...notas, [id]: numVal });
    };

    const handleActualizarNotas = async () => {
    if (!tipo || !tipoSeleccionado) {
        setMensaje({ tipo: false, respuesta: 'Debe seleccionar el tipo y el sub-tipo.' });
        return;
    }
    const notasValidas = estudiantes.every(est => {
        const nota = notas[est.id];
        return nota !== undefined && nota !== '' && typeof nota === 'number' && nota >= 1 && nota <= 10;
    });
    if (!notasValidas) {
        setMensaje({ tipo: false, respuesta: 'Debe ingresar todas las notas entre 1 y 10.' });
        return;
    }
    setEnviando(true);
    try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/actualizar-nota/${materiaSeleccionada}`;
        const token = localStorage.getItem('token');

        const body = {
            tipo: tipo,
            descripcion: tipoSeleccionado,
            notas: notas 
        };
        await axios.patch(url, body, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setMensaje({ tipo: true, respuesta: 'Notas actualizadas correctamente.' });
        setNotas({});
    } catch (error) {
        setMensaje({ tipo: false, respuesta: error.response?.data?.error || 'Error al actualizar las notas.' });
    }
    setEnviando(false);
};

    return (
        <div>
            {anioLectivoActivo && <h1 className='font-black text-4xl text-gray-500 text-center'>Actualizar Notas</h1>}
            {!anioLectivoActivo && <h1 className='font-black text-4xl text-gray-500 text-center'>Visualizar Notas</h1>}
            <hr className='my-4' />
            {anioLectivoActivo && <p className='mb-8 text-center'>Este módulo te permite actualizar las notas de los estudiantes</p>}
            {!anioLectivoActivo && <p className='mb-8 text-center'>Este módulo te permite visualizar las notas de los estudiantes</p>}

            {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}

            <div className="flex justify-center mb-8">
                <select
                    className="border-2 p-2 rounded-md"
                    value={cursoSeleccionado}
                    onChange={e => setCursoSeleccionado(e.target.value)}
                >
                    <option value="">Seleccione un curso</option>
                    {cursos.map(curso => (
                        <option key={curso.id} value={curso.id}>
                            {curso.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {cursoSeleccionado && (
                <div className="flex justify-center mb-8 gap-4">
                    <select
                        className="border-2 p-2 rounded-md"
                        value={materiaSeleccionada}
                        onChange={e => setMateriaSeleccionada(e.target.value)}
                    >
                        <option value="">Seleccione una materia</option>
                        {materias.map(materia => (
                            <option key={materia.id || materia._id} value={materia.id || materia._id}>
                                {materia.nombre}
                            </option>
                        ))}
                    </select>
                    <select
                        className="border-2 p-2 rounded-md"
                        value={tipo}
                        onChange={e => setTipo(e.target.value)}
                    >
                        <option value="">Seleccione tipo</option>
                        <option value="deberes">Deberes</option>
                        <option value="examenes">Exámenes</option>
                        <option value="talleres">Talleres</option>
                        <option value="pruebas">Pruebas</option>
                    </select>
                    <select
                        className="border-2 p-2 rounded-md"
                        value={tipoSeleccionado}
                        onChange={e => setTipoSeleccionado(e.target.value)}
                        disabled={tiposDisponibles.length === 0}
                    >
                        <option value="">Seleccione sub-tipo</option>
                        {tiposDisponibles.map((t, idx) =>
                            typeof t === 'object' ? (
                                <option key={t.id ?? idx} value={t.nombre}>{t.nombre}</option>
                            ) : (
                                <option key={idx} value={t}>{t}</option>
                            )
                        )}
                    </select>
                </div>
            )}

            {estudiantes.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-center">Cédula</th>
                                <th className="py-2 px-4 border-b text-center">Nombre</th>
                                <th className="py-2 px-4 border-b text-center">Apellido</th>
                                <th className="py-2 px-4 border-b text-center">Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map(est => (
                                <tr key={est.id}>
                                    <td className="py-1 px-4 border-b text-center">{est.cedula}</td>
                                    <td className="py-1 px-4 border-b text-center">{est.nombre}</td>
                                    <td className="py-1 px-4 border-b text-center">{est.apellido}</td>
                                    { anioLectivoActivo && (
                                    <td className="py-1 px-4 border-b text-center">
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            step="0.1"
                                            className="border rounded px-2 py-1 w-20 text-center"
                                            value={notas[est.id] || ''}
                                            onChange={e => handleNotaChange(est.id, e.target.value)}
                                        />
                                    </td>
                                    )}
                                    {!anioLectivoActivo && (
                                        <td className="py-1 px-4 border-b text-center">
                                            {notas[est.id] !== undefined ? notas[est.id] : 'N/A'}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            { anioLectivoActivo &&  (
                            <tr>
                                <td colSpan={4} className="py-4 text-center">
                                    <button
                                        className={`bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition-all ${enviando ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        onClick={handleActualizarNotas}
                                        disabled={enviando || !tipo || !tipoSeleccionado}
                                    >
                                        {enviando ? 'Actualizando...' : 'Actualizar Notas'}
                                    </button>
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActualizarNotas;