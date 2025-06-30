import { useState } from 'react'
import axios from 'axios';
import Mensaje from '../componets/Alertas/Mensajes'

export const RegisterCursos = () => {
    // paso 1 
    const [form, setform] = useState({
        nivel: '',
        paralelo: ''
    })
    
    // paso 2
    const handleChange = (e) => {
        setform({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    // paso 3
    const [mensaje, setMensaje] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url =  `${import.meta.env.VITE_BACKEND_URL}/registro-curso`;
            const token = localStorage.getItem('token'); 
            const respuesta = await axios.post(url, form, {
              headers: {
                'Authorization': `Bearer ${token}` 
              }
            });
            setMensaje({ respuesta: respuesta.data.msg, tipo: true });
            setform({ nivel: '', paralelo: '' }); // Limpia el formulario
        } catch (error) {
            setMensaje({ respuesta: error.response?.data?.msg || "Error al registrar el curso", tipo: false });
        }
    };

    return (
        <>
            <div>
                <div>
                    {Object.keys(mensaje).length > 0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
              
                    <form onSubmit={handleSubmit}>
                       
                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="nivel">Nivel:</label>
                            <select
                                id="nivel"
                                name="nivel"
                                value={form.nivel}
                                onChange={handleChange}
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            >
                                <option value="">Selecciona un nivel</option>
                                {[
                                    { numero: 1, texto: "Primero" },
                                    { numero: 2, texto: "Segundo" },
                                    { numero: 3, texto: "Tercero" },
                                    { numero: 4, texto: "Cuarto" },
                                    { numero: 5, texto: "Quinto" },
                                    { numero: 6, texto: "Sexto" },
                                    { numero: 7, texto: "Séptimo" }
                                ].map((nivel) => (
                                    <option key={nivel.numero} value={nivel.numero}>{nivel.texto}</option>
                                ))}
                            </select>
                        </div>

                       
                        <div>
                            <label className="text-gray-700 uppercase font-bold text-sm" htmlFor="paralelo">Paralelo:</label>
                            <select
                                id="paralelo"
                                name="paralelo"
                                value={form.paralelo}
                                onChange={handleChange}
                                className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md mb-5"
                                required
                            >
                                <option value="">Selecciona un paralelo</option>
                                {['A', 'B', 'C', 'D', 'E'].map((paralelo) => (
                                    <option key={paralelo} value={paralelo}>{paralelo}</option>
                                ))}
                            </select>
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