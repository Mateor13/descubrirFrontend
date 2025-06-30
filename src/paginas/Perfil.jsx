import React, { useState } from 'react';
import { CardPerfil } from '../componets/Perfil/CardPerfil';
import AuthContext from '../context/AuthProvider';
import { useContext } from 'react';
import FormularioPerfil from '../componets/Perfil/FormularioPerfil';
import Password from '../componets/Perfil/Password';

const Perfil = () => {

   
    const [isFormularioPerfilOpen, setIsFormularioPerfilOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <>
            <div>
                <h1 className='font-black text-4xl text-gray-500'>Perfil</h1>
                <hr className='my-4' />
                <p className='mb-8'>Este módulo te permite visualizar el perfil del usuario</p>
            </div>

            <div className='flex flex-col gap-y-8'>
                <div className='w-full'>
                    <CardPerfil />
                </div>
                <div className='w-full flex justify-center gap-x-6'>
                    <button
                        onClick={() => setIsFormularioPerfilOpen(true)}
                        className="bg-gray-800 text-white px-5 py-2 text-base rounded-md focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
                    >
                        Actualizar Datos
                    </button>
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="bg-gray-800 text-white px-5 py-2 text-base rounded-md focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
                    >
                        Cambiar Contraseña
                    </button>
                </div>
            </div>

            {isFormularioPerfilOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                        <FormularioPerfil />
                         <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={() => setIsFormularioPerfilOpen(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                        <Password />
                        <button
                            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
                            onClick={() => setIsPasswordModalOpen(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Perfil;