import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SesionProvider } from './context/Sesion'
import { RutaPrivada, SoloInvitados } from './rutas/Rutas'
import { Cargando } from './componentes/ui/Estados'
import { AvisoCookies } from './componentes/publico/AvisoCookies'
import { RastreadorPaginas } from './componentes/publico/RastreadorPaginas'
import LayoutPublico from './layouts/LayoutPublico'
import Inicio from './paginas/publico/Inicio'
import NoEncontrado from './paginas/publico/NoEncontrado'

// Carga diferida: cada sección se descarga solo cuando se visita (la portada pesa lo mínimo)
const LayoutCuenta = lazy(() => import('./layouts/LayoutCuenta'))
const LayoutApp = lazy(() => import('./layouts/LayoutApp'))
const Legal = (nombre) => lazy(() => import('./paginas/publico/Legal').then(m => ({ default: m[nombre] })))
const AvisoLegal = Legal('AvisoLegal')
const Privacidad = Legal('Privacidad')
const Cookies = Legal('Cookies')
const Login = lazy(() => import('./paginas/cuenta/Login'))
const Recuperar = lazy(() => import('./paginas/cuenta/Recuperar'))
const CrearPassword = lazy(() => import('./paginas/cuenta/CrearPassword'))
const InicioApp = lazy(() => import('./paginas/app/Inicio'))
const Perfil = lazy(() => import('./paginas/app/Perfil'))
const Estudiante = lazy(() => import('./paginas/app/Estudiante'))
const Periodos = lazy(() => import('./paginas/admin/Periodos'))
const Usuarios = lazy(() => import('./paginas/admin/Usuarios'))
const Estudiantes = lazy(() => import('./paginas/admin/Estudiantes'))
const Cursos = lazy(() => import('./paginas/admin/Cursos'))
const Asignaturas = lazy(() => import('./paginas/admin/Asignaturas'))
const Clases = lazy(() => import('./paginas/admin/Clases'))
const MisClases = lazy(() => import('./paginas/docente/MisClases'))
const Clase = lazy(() => import('./paginas/docente/Clase'))
const Planilla = lazy(() => import('./paginas/docente/Planilla'))
const Asistencia = lazy(() => import('./paginas/docente/Asistencia'))
const MisEstudiantes = lazy(() => import('./paginas/representante/MisEstudiantes'))

const conRol = (roles, elemento) => <RutaPrivada roles={roles}>{elemento}</RutaPrivada>

// Raíz: proveedores comunes a todas las páginas
const Raiz = () => (
    <SesionProvider>
        <RastreadorPaginas />
        <Suspense fallback={<Cargando className="min-h-dvh" />}>
            <Outlet />
        </Suspense>
        <AvisoCookies />
        <ToastContainer position="top-right" autoClose={4000} newestOnTop theme="colored" />
    </SesionProvider>
)

const router = createBrowserRouter(createRoutesFromElements(
    <Route element={<Raiz />}>
        <Route element={<LayoutPublico />}>
            <Route index element={<Inicio />} />
            <Route path="aviso-legal" element={<AvisoLegal />} />
            <Route path="privacidad" element={<Privacidad />} />
            <Route path="cookies" element={<Cookies />} />
            <Route path="*" element={<NoEncontrado />} />
        </Route>

        <Route element={<LayoutCuenta />}>
            <Route path="login" element={<SoloInvitados><Login /></SoloInvitados>} />
            <Route path="recuperar" element={<Recuperar />} />
            <Route path="v2/activar/:token" element={<CrearPassword modo="activar" />} />
            <Route path="v2/restablecer/:token" element={<CrearPassword modo="restablecer" />} />
        </Route>

        <Route path="app" element={<RutaPrivada><LayoutApp /></RutaPrivada>}>
            <Route index element={<InicioApp />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="estudiantes/:id" element={<Estudiante />} />
            <Route path="periodos" element={conRol(['admin'], <Periodos />)} />
            <Route path="usuarios" element={conRol(['admin'], <Usuarios />)} />
            <Route path="estudiantes" element={conRol(['admin'], <Estudiantes />)} />
            <Route path="cursos" element={conRol(['admin'], <Cursos />)} />
            <Route path="asignaturas" element={conRol(['admin'], <Asignaturas />)} />
            <Route path="clases" element={conRol(['admin'], <Clases />)} />
            <Route path="clases/:claseId" element={conRol(['admin', 'profesor'], <Clase />)} />
            <Route path="mis-clases" element={conRol(['profesor'], <MisClases />)} />
            <Route path="evaluaciones/:id" element={conRol(['admin', 'profesor'], <Planilla />)} />
            <Route path="asistencia" element={conRol(['admin', 'profesor'], <Asistencia />)} />
            <Route path="mis-estudiantes" element={conRol(['representante'], <MisEstudiantes />)} />
            <Route path="*" element={<NoEncontrado dentroDeApp />} />
        </Route>

        {/* Enlaces de la v1: se redirigen para no dejar enlaces rotos */}
        <Route path="dashboard/*" element={<Navigate to="/app" replace />} />
        <Route path="profesor-dashboard/*" element={<Navigate to="/app" replace />} />
        <Route path="forgot/:id" element={<Navigate to="/recuperar" replace />} />
        <Route path="recuperar-password/:token" element={<Navigate to="/recuperar" replace />} />
        <Route path="confirmar/:token" element={<Navigate to="/login" replace />} />
        <Route path="register" element={<Navigate to="/login" replace />} />
    </Route>
))

const App = () => <RouterProvider router={router} />

export default App
