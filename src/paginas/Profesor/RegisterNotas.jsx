import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Mensaje from '../../componets/Alertas/Mensajes';
import AuthContext from '../../context/AuthProvider';

export const RegisterNotas = () => {
    const { auth } = useContext(AuthContext);
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
    const [tipo, setTipo] = useState('');
    const [estudiantes, setEstudiantes] = useState([]);
    const [mensaje, setMensaje] = useState({});
    const [notas, setNotas] = useState({});
    const [enviando, setEnviando] = useState(false);

    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mensajeEvidencia, setMensajeEvidencia] = useState({});
    const [enviandoEvidencia, setEnviandoEvidencia] = useState(false);
    const [mostrarModalEvidencia, setMostrarModalEvidencia] = useState(false);
    const [evidenciaSubida, setEvidenciaSubida] = useState(false);

    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

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
        const fetchEstudiantes = async () => {
            if (!materiaSeleccionada || !cursoSeleccionado) {
                setEstudiantes([]);
                return;
            }
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/estudiantes/${cursoSeleccionado}`;
                const token = localStorage.getItem('token');
                const respuesta = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setEstudiantes(respuesta.data.estudiantes || []);
            } catch (error) {
                setEstudiantes([]);
            }
        };
        fetchEstudiantes();
    }, [materiaSeleccionada, cursoSeleccionado]);

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

    const handleImagenChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagen(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        } else {
            setImagen(null);
            setPreview(null);
        }
    };

    const quitarImagen = () => {
        setImagen(null);
        setPreview(null);
    };

    const handleConfirmarSubida = (e) => {
        e.preventDefault();
        if (!materiaSeleccionada || !cursoSeleccionado || !imagen) {
            setMensajeEvidencia({ tipo: false, respuesta: 'Debe seleccionar curso, materia y cargar una imagen.' });
            return;
        }
        setMostrarConfirmar(true);
    };

    const handleSubirEvidencia = async (e) => {
        e.preventDefault();
        setEnviandoEvidencia(true);

   
        setMostrarConfirmar(false);

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/subir-evidencia/${materiaSeleccionada}/${cursoSeleccionado}`;
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('imagen', imagen);
            formData.append('tipo', tipo); 

            await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMensajeEvidencia({ tipo: true, respuesta: 'Evidencia subida correctamente.' });
            setImagen(null);
            setPreview(null);
            setEvidenciaSubida(true);
            setTimeout(() => {
                setMostrarModalEvidencia(false);
                setMensajeEvidencia({});
                registrarNotasDespuesDeEvidencia();
            }, 1000);
        } catch (error) {
            setMensajeEvidencia({ tipo: false, respuesta: error.response?.data?.error || 'Error al subir la evidencia.' });
        }
        setEnviandoEvidencia(false);
    };

    const registrarNotasDespuesDeEvidencia = async () => {
        setEnviando(true);
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/registro-nota/${materiaSeleccionada}`;
            const token = localStorage.getItem('token');
            const notasNumericas = {};
            Object.keys(notas).forEach(id => {
                notasNumericas[id] = Number(notas[id]);
            });
            const body = {
                tipo,
                notas: notasNumericas
            };
            await axios.post(url, body, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMensaje({ tipo: true, respuesta: 'Notas registradas correctamente.' });
            setNotas({});
            setEvidenciaSubida(false);
        } catch (error) {
            setMensaje({ tipo: false, respuesta: error.response?.data?.error || 'Error al registrar las notas.' });
        }
        setEnviando(false);
    };

    const handleRegistrarNotas = async () => {
        if (!tipo) {
            setMensaje({ tipo: false, respuesta: 'Debe seleccionar el tipo de nota.' });
            return;
        }
        const notasValidas = estudiantes.every(est => {
            const nota = notas[est._id];
            return nota !== undefined && nota !== '' && typeof nota === 'number' && nota >= 1 && nota <= 10;
        });
        if (!notasValidas) {
            setMensaje({ tipo: false, respuesta: 'Debe ingresar todas las notas entre 1 y 10.' });
            return;
        }

        if (!evidenciaSubida) {
            setMostrarModalEvidencia(true);
            setMensaje({ tipo: false, respuesta: 'Debe subir una imagen de evidencia antes de registrar las notas.' });
            return;
        }

        await registrarNotasDespuesDeEvidencia();
    };

    useEffect(() => {
        setEvidenciaSubida(false);
    }, [cursoSeleccionado, materiaSeleccionada]);

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500 text-center'>Registrar Notas</h1>
            <hr className='my-4' />
            <p className='mb-8 text-center'>Este módulo te permite registrar las notas de los estudiantes</p>

            {mostrarModalEvidencia && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        <h2 className="text-xl font-bold mb-4 text-center">Debe subir una imagen de evidencia antes de registrar las notas</h2>
                        <form onSubmit={handleConfirmarSubida}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">Imagen de evidencia:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    className="border rounded w-full p-2"
                                />
                                {preview && (
                                    <div className="flex flex-col items-center mt-2">
                                        <img src={preview} alt="Vista previa" className="h-24 object-contain mb-2 border" />
                                        <button
                                            type="button"
                                            className="text-red-600 underline text-sm"
                                            onClick={quitarImagen}
                                        >
                                            Quitar imagen
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className={`bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition-all w-full ${enviandoEvidencia || !imagen ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={enviandoEvidencia || !imagen}
                            >
                                {enviandoEvidencia ? 'Subiendo...' : 'Subir Evidencia'}
                            </button>
                        </form>
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={() => setMostrarModalEvidencia(false)}
                        >
                            Cerrar
                        </button>
                        {Object.keys(mensajeEvidencia).length > 0 && (
                            <Mensaje tipo={mensajeEvidencia.tipo}>{mensajeEvidencia.respuesta}</Mensaje>
                        )}
                    </div>
                </div>
            )}

            {mostrarConfirmar && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                        <h2 className="text-lg font-bold mb-4 text-center">¿Está seguro que desea subir esta imagen como evidencia?</h2>
                        {preview && (
                            <div className="flex justify-center mb-4">
                                <img src={preview} alt="Vista previa" className="h-32 object-contain border" />
                            </div>
                        )}
                        <div className="flex justify-between gap-4">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded font-bold hover:bg-gray-400 transition-all w-full"
                                onClick={() => setMostrarConfirmar(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-800 transition-all w-full"
                                onClick={handleSubirEvidencia}
                                disabled={enviandoEvidencia}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                <tr key={est._id}>
                                    <td className="py-1 px-4 border-b text-center">{est.cedula}</td>
                                    <td className="py-1 px-4 border-b text-center">{est.nombre}</td>
                                    <td className="py-1 px-4 border-b text-center">{est.apellido}</td>
                                    <td className="py-1 px-4 border-b text-center">
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            step="0.1"
                                            className="border rounded px-2 py-1 w-20 text-center"
                                            value={notas[est._id] || ''}
                                            onChange={e => handleNotaChange(est._id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={4} className="py-4 text-center">
                                    <button
                                        className={`bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition-all ${enviando || !tipo ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        onClick={handleRegistrarNotas}
                                        disabled={enviando || !tipo}
                                    >
                                        {enviando ? 'Registrando...' : 'Registrar Notas'}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RegisterNotas;
