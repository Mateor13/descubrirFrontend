import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './layout/Auth'
import Login from './paginas/Login'
import { Register } from './paginas/Register'
import { Forgot } from './paginas/Forgot'
import Dashboard from './layout/Dashboard'
import Perfil from './paginas/Perfil'
import { Confirmar } from './paginas/Confirmar'
import Restablecer from './paginas/Restablecer'
import { AuthProvider } from './context/AuthProvider'
import { PrivateRoute } from './routes/PrivateRoute'
import Registrar from './paginas/Administrador/Registrar'
import Profesores from './paginas/Administrador/Profesores'
import Representante from './paginas/Administrador/Representante'
import Materias from './paginas/Administrador/Materias'
import Estudiante from './paginas/Administrador/Estudiante'
import JustificarInasistencia from './paginas/Administrador/JustificarInasistencia'
import RegistrarCurso from './paginas/Administrador/RegistrarCurso'
import ProfesoresDashboard from './layout/ProfesoresDashboard'
import RegisterNotas from './paginas/Profesor/RegisterNotas'
import ActualizarNotas from './paginas/Profesor/ActualizarNotas'
import ObservacionesEstudiantes from './paginas/Profesor/ObservacionesEstudiantes'
import AnioLectivo from './paginas/Administrador/AnioLectivo'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Auth />}>
            <Route index element={<Login />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path='forgot/:id' element={<Forgot />} />
            <Route path='confirmar/:token' element={<Confirmar />} />
            <Route path='recuperar-password/:token' element={<Restablecer />} />
          </Route>

          <Route path='dashboard/*' element={
            <PrivateRoute allowedRoles={['administrador']}>
              <Routes>
                <Route element={<Dashboard />}>
                  <Route index element={<Perfil />} />
                  <Route path='registrar' element={<Registrar />} />
                  <Route path='registrar-profesor' element={<Profesores />} />
                  <Route path='registrar-representante' element={<Representante />} />
                  <Route path='registrar-materia' element={<Materias />} />
                  <Route path='registrar-estudiante' element={<Estudiante />} />
                  <Route path='anio-lectivo' element={<AnioLectivo />} />
                  <Route path='justificar-inasistencia' element={<JustificarInasistencia />} />
                  <Route path='registrar-curso' element={<RegistrarCurso />} />
                </Route>
              </Routes>
            </PrivateRoute>
          } />

          <Route path='profesor-dashboard/*' element={
            <PrivateRoute allowedRoles={['profesor']}>
              <Routes>
                <Route element={<ProfesoresDashboard />}>
                  <Route index element={<Perfil />} />
                  <Route path='registrar-nota' element={<RegisterNotas />} />
                  <Route path='actualizar-nota' element={<ActualizarNotas />} />
                  <Route path='observacion-estudiante' element={<ObservacionesEstudiantes />} />
                </Route>
              </Routes>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
