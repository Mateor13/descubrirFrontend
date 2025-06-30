import { useContext, useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AuthContext from '../context/AuthProvider'
import { useAnioLectivo } from '../hooks/useAnioLectivo'

const Dashboard = () => {
    const location = useLocation()
    const urlActual = location.pathname
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false);
    
    // Usar el hook personalizado para manejar el estado del año lectivo
    const { anioLectivoActivo, loading, error } = useAnioLectivo();

    const { auth, cerrarSesion } = useContext(AuthContext)
    const autenticado = localStorage.getItem('token')

    const colores = {
        sidebar: '#3b8842',      
        sidebarText: '#fff',       
        sidebarActive: '#a6ce7d', 
        sidebarActiveText: '#3b8842', 
        border: '#a6ce7d',         
        badge: '#a6ce7d',         
        mainBg: '#f6fff8',        
        topbar: '#3b8842',         
        topbarText: '#fff',        
        salir: '#5a318e',          
        footer: '#a6ce7d',         
        footerText: '#3b8842'      
    };

    const handlePerfilClick = () => {
        navigate('/dashboard');
    };

    const toggleMenu = () => {
        setMenuAbierto(!menuAbierto);
    };

    const cerrarMenu = () => {
        setMenuAbierto(false);
    };

    return (
        <div className='md:flex md:min-h-screen'>
            {/* Overlay para cerrar el menú en móvil */}
            {menuAbierto && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={cerrarMenu}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static top-0 left-0 h-full md:h-auto z-50 md:z-auto
                md:w-1/5 w-64 px-5 py-4 transform transition-transform duration-300 ease-in-out
                ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `} style={{ backgroundColor: colores.sidebar }}>
                <h2 className='text-4xl font-black text-center' style={{ color: colores.sidebarText }}>ADMIN</h2>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                    alt="img-client"
                    className="m-auto mt-8 p-1 border-2 rounded-full cursor-pointer"
                    width={120}
                    height={120}
                    style={{ borderColor: colores.border }}
                    onClick={handlePerfilClick}
                    title="Ir al perfil"
                />
                <p className='text-center my-4 text-sm' style={{ color: colores.sidebarText }}>
                    <span className='w-3 h-3 inline-block rounded-full mr-1' style={{ backgroundColor: colores.badge }}></span>
                    Bienvenido - {auth?.nombre}
                </p>
                <hr className="mt-5" style={{ borderColor: colores.border }} />

                <ul className="mt-5">
                    <li className="text-center">
                        <Link to='/dashboard/registrar'
                            className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                            style={{
                                backgroundColor: urlActual === '/dashboard/registrar' ? colores.sidebarActive : 'transparent',
                                color: urlActual === '/dashboard/registrar' ? colores.sidebarActiveText : colores.sidebarText,
                                fontWeight: urlActual === '/dashboard/registrar' ? 'bold' : 'normal'
                            }}
                            onClick={cerrarMenu}
                        >Administradores</Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/registrar-profesor'
                            className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                            style={{
                                backgroundColor: urlActual === '/dashboard/registrar-profesor' ? colores.sidebarActive : 'transparent',
                                color: urlActual === '/dashboard/registrar-profesor' ? colores.sidebarActiveText : colores.sidebarText,
                                fontWeight: urlActual === '/dashboard/registrar-profesor' ? 'bold' : 'normal'
                            }}
                            onClick={cerrarMenu}
                        >Profesores</Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/registrar-representante'
                            className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                            style={{
                                backgroundColor: urlActual === '/dashboard/registrar-representante' ? colores.sidebarActive : 'transparent',
                                color: urlActual === '/dashboard/registrar-representante' ? colores.sidebarActiveText : colores.sidebarText,
                                fontWeight: urlActual === '/dashboard/registrar-representante' ? 'bold' : 'normal'
                            }}
                            onClick={cerrarMenu}
                        >Representantes</Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/registrar-estudiante'
                            className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                            style={{
                                backgroundColor: urlActual === '/dashboard/registrar-estudiante' ? colores.sidebarActive : 'transparent',
                                color: urlActual === '/dashboard/registrar-estudiante' ? colores.sidebarActiveText : colores.sidebarText,
                                fontWeight: urlActual === '/dashboard/registrar-estudiante' ? 'bold' : 'normal'
                            }}
                            onClick={cerrarMenu}
                        >Estudiantes</Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/registrar-curso'
                            className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                            style={{
                                backgroundColor: urlActual === '/dashboard/registrar-curso' ? colores.sidebarActive : 'transparent',
                                color: urlActual === '/dashboard/registrar-curso' ? colores.sidebarActiveText : colores.sidebarText,
                                fontWeight: urlActual === '/dashboard/registrar-curso' ? 'bold' : 'normal'
                            }}
                            onClick={cerrarMenu}
                        >Cursos</Link>
                    </li>
                    <li className="text-center">
                        <Link to='/dashboard/registrar-materia'
                            className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                            style={{
                                backgroundColor: urlActual === '/dashboard/registrar-materia' ? colores.sidebarActive : 'transparent',
                                color: urlActual === '/dashboard/registrar-materia' ? colores.sidebarActiveText : colores.sidebarText,
                                fontWeight: urlActual === '/dashboard/registrar-materia' ? 'bold' : 'normal'
                            }}
                            onClick={cerrarMenu}
                        >Materias</Link>
                    </li>
                    {anioLectivoActivo && (
                        <li className="text-center">
                            <Link to='/dashboard/anio-lectivo'
                                className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                                style={{
                                    backgroundColor: urlActual === '/dashboard/anio-lectivo' ? colores.sidebarActive : 'transparent',
                                    color: urlActual === '/dashboard/anio-lectivo' ? colores.sidebarActiveText : colores.sidebarText,
                                    fontWeight: urlActual === '/dashboard/anio-lectivo' ? 'bold' : 'normal'
                                }}
                                onClick={cerrarMenu}
                            >Año Lectivo</Link>
                        </li>
                    )}
                    {anioLectivoActivo && (
                        <li className="text-center">
                            <Link to='/dashboard/justificar-inasistencia'
                                className={`text-xl block mt-2 rounded-md text-center px-3 py-2 transition-colors`}
                                style={{
                                    backgroundColor: urlActual === '/dashboard/justificar-inasistencia' ? colores.sidebarActive : 'transparent',
                                    color: urlActual === '/dashboard/justificar-inasistencia' ? colores.sidebarActiveText : colores.sidebarText,
                                    fontWeight: urlActual === '/dashboard/justificar-inasistencia' ? 'bold' : 'normal'
                                }}
                                onClick={cerrarMenu}
                            >Inasistencias</Link>
                        </li>
                    )}
                    {/* Mostrar indicador de carga solo si está cargando y hay error */}
                    {loading && error && (
                        <li className="text-center">
                            <div className="text-sm text-center px-3 py-2" style={{ color: colores.sidebarText }}>
                                Verificando permisos...
                            </div>
                        </li>
                    )}
                </ul>
            </div>

            <div className='flex-1 flex flex-col justify-between h-screen' style={{ backgroundColor: colores.mainBg }}>
                <div className='py-2 flex md:justify-end items-center gap-5 justify-between px-4' style={{ backgroundColor: colores.topbar }}>
                    {/* Botón hamburguesa - solo visible en móvil */}
                    <button
                        className="md:hidden text-white p-2 rounded-md hover:bg-white hover:bg-opacity-20"
                        onClick={toggleMenu}
                        aria-label="Abrir menú"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className='flex items-center gap-5'>
                        <div className='text-md font-semibold' style={{ color: colores.topbarText }}>
                            Usuario - {auth?.nombre}
                        </div>
                        <div>
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                                alt="img-client"
                                className="border-2 rounded-full cursor-pointer"
                                width={50}
                                height={50}
                                style={{ borderColor: colores.badge }}
                                onClick={handlePerfilClick}
                                title="Ir al perfil"
                            />
                        </div>
                        <div>
                            <Link to='/' className="text-white mr-3 text-md block text-center px-4 py-1 rounded-lg transition-colors"
                                style={{ backgroundColor: colores.salir }}
                                onClick={() => { 
                                    cerrarSesion();
                                    navigate('/login');
                                }}>
                                Salir
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='overflow-y-scroll p-8'>
                    {autenticado ? (
                        // Proteger rutas específicas si el año lectivo está inactivo
                        !anioLectivoActivo && (urlActual === '/dashboard/anio-lectivo' || urlActual === '/dashboard/justificar-inasistencia') ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Outlet />
                        )
                    ) : (
                        <Navigate to="/login" />
                    )}
                </div>
                <div style={{ backgroundColor: colores.footer }} className='h-12'>
                    <p className='text-center leading-[2.9rem] underline' style={{ color: colores.footerText }}>
                        Todos los derechos reservados
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard