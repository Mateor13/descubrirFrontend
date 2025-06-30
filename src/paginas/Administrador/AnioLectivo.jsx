import React, { useState } from 'react'
import { AsignarPonderaciones } from '../../componets/AsignarPonderaciones'
import { FechaAnio } from '../../componets/FechaAnio'
import axios from 'axios'
import Mensaje from '../../componets/Alertas/Mensajes'

const AnioLectivo = () => {
    const [mensaje, setMensaje] = useState({});
    const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
    const [mostrarPonderaciones, setMostrarPonderaciones] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargandoInicio, setCargandoInicio] = useState(false);
    const [cargandoFinalizacion, setCargandoFinalizacion] = useState(false);

    const handleIniciarPeriodo = async () => {
        setCargandoInicio(true);
        setMensaje({});
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/iniciar-periodo`;
            const token = localStorage.getItem('token');
            const { data } = await axios.post(url, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 60000 // 60 segundos de timeout
            });
            setMensaje({ respuesta: data.msg || "Año lectivo iniciado correctamente.", tipo: true });
            setMostrarFechaFin(true);
        } catch (error) {
            console.error('Error al iniciar período:', error);
            let mensajeError = "Error al iniciar el año lectivo.";
            
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                mensajeError = "El servidor está tardando más de lo esperado. Por favor, espere unos momentos e intente nuevamente.";
            } else if (error.response?.status === 504) {
                mensajeError = "El servidor está procesando su solicitud. Por favor, espere unos momentos e intente nuevamente.";
            } else if (error.response?.status === 503) {
                mensajeError = "El servidor está temporalmente no disponible. Intente nuevamente en unos minutos.";
            } else if (error.response?.data?.error) {
                mensajeError = error.response.data.error;
            }
            
            setMensaje({ respuesta: mensajeError, tipo: false });
        } finally {
            setCargandoInicio(false);
        }
    };

    const handleFechaFinRegistrada = () => {
        setMostrarFechaFin(false);
        setMostrarPonderaciones(true);
    };

    const handlePonderacionesAsignadas = () => {
        setMostrarPonderaciones(false);
        setMensaje({ respuesta: "¡Año lectivo configurado exitosamente! El sistema está listo para ser usado.", tipo: true });
    };

    const handleTerminarPeriodo = async () => {
        setCargandoFinalizacion(true);
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/terminar-periodo`;
            const token = localStorage.getItem('token');
            const { data } = await axios.patch(url, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 60000 // 60 segundos de timeout
            });
            setMensaje({ respuesta: data.msg || "Año lectivo finalizado correctamente.", tipo: true });
            setMostrarModal(false);
        } catch (error) {
            console.error('Error al finalizar período:', error);
            let mensajeError = "Error al finalizar el año lectivo.";
            
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                mensajeError = "El servidor está tardando más de lo esperado. Por favor, espere unos momentos e intente nuevamente.";
            } else if (error.response?.status === 504) {
                mensajeError = "El servidor está procesando su solicitud. Por favor, espere unos momentos e intente nuevamente.";
            } else if (error.response?.status === 503) {
                mensajeError = "El servidor está temporalmente no disponible. Intente nuevamente en unos minutos.";
            } else if (error.response?.data?.error) {
                mensajeError = error.response.data.error;
            }
            
            setMensaje({ respuesta: mensajeError, tipo: false });
            setMostrarModal(false);
        } finally {
            setCargandoFinalizacion(false);
        }
    };

    return (
        <div>
            <h1 className='font-black text-4xl text-gray-500'>Año Lectivo</h1>
            <hr className='my-4' />
            <p className='mb-8'>Este módulo permite gestionar los años lectivos</p>
            {Object.keys(mensaje).length > 0 && (
                <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>
            )}

            {!mostrarFechaFin && !mostrarPonderaciones && (
                <div className="flex justify-center mb-8">
                    <div className="bg-white shadow-lg rounded-lg p-6 flex gap-4 items-center">
                        <button
                            className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                                cargandoInicio 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-800'
                            }`}
                            onClick={handleIniciarPeriodo}
                            disabled={cargandoInicio || cargandoFinalizacion}
                        >
                            {cargandoInicio ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Iniciando...
                                </div>
                            ) : (
                                'Iniciar Año Lectivo'
                            )}
                        </button>
                        <button
                            className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                                cargandoFinalizacion || cargandoInicio
                                    ? 'bg-red-400 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-800'
                            }`}
                            onClick={() => setMostrarModal(true)}
                            disabled={cargandoInicio || cargandoFinalizacion}
                        >
                            Finalizar Año Lectivo
                        </button>
                    </div>
                </div>
            )}

            {cargandoInicio && (
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
                        <p className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-700 border-t-transparent"></div>
                            Iniciando año lectivo... Esto puede tomar unos momentos.
                        </p>
                    </div>
                </div>
            )}

            {mostrarModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                        <h2 className="text-lg font-bold mb-4 text-center">¿Está seguro que desea finalizar el año lectivo?</h2>
                        {cargandoFinalizacion && (
                            <div className="mb-4 flex justify-center">
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-center">
                                    <p className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-700 border-t-transparent"></div>
                                        Finalizando...
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <button
                                className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                                    cargandoFinalizacion 
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-gray-400 hover:bg-gray-600'
                                }`}
                                onClick={() => setMostrarModal(false)}
                                disabled={cargandoFinalizacion}
                            >
                                Cancelar
                            </button>
                            <button
                                className={`px-4 py-2 rounded text-white transition-all duration-200 ${
                                    cargandoFinalizacion 
                                        ? 'bg-red-400 cursor-not-allowed' 
                                        : 'bg-red-600 hover:bg-red-800'
                                }`}
                                onClick={handleTerminarPeriodo}
                                disabled={cargandoFinalizacion}
                            >
                                {cargandoFinalizacion ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Finalizando...
                                    </div>
                                ) : (
                                    'Confirmar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarFechaFin && (
                <FechaAnio
                    onFechaFinRegistrada={handleFechaFinRegistrada}
                    formato="YYYY-MM-DD"
                />
            )}

            {mostrarPonderaciones && (
                <AsignarPonderaciones
                    onPonderacionesAsignadas={handlePonderacionesAsignadas}
                />
            )}
        </div>
    )
}

export default AnioLectivo