# 🎓 Sistema de Gestión Escolar - Frontend

Sistema web integral para la gestión educativa desarrollado con React, diseñado para facilitar la administración de instituciones educativas.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Funcionalidades](#-funcionalidades)
- [Roles de Usuario](#-roles-de-usuario)
- [Componentes Principales](#-componentes-principales)
- [Hooks Personalizados](#-hooks-personalizados)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)

## ✨ Características Principales

- **Dashboard Responsivo**: Interfaz adaptable para diferentes dispositivos
- **Gestión de Usuarios**: Administradores, profesores, estudiantes y representantes
- **Control de Año Lectivo**: Manejo de períodos académicos con estados activo/inactivo
- **Sistema de Autenticación**: JWT con renovación automática de tokens
- **Gestión Académica**: Cursos, materias, notas y observaciones
- **Control de Asistencia**: Justificación de inasistencias
- **Responsive Design**: Optimizado para móviles, tablets y escritorio

## 🚀 Tecnologías Utilizadas

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Deployment**: Vercel
- **Package Manager**: npm

## 📁 Estructura del Proyecto

```
Frontend/
├── public/
│   └── images/
├── src/
│   ├── assets/              # Imágenes y recursos estáticos
│   ├── componets/           # Componentes reutilizables
│   │   ├── Alertas/         # Componentes de mensajes
│   │   └── Perfil/          # Componentes de perfil de usuario
│   ├── context/             # Context API de React
│   ├── hooks/               # Hooks personalizados
│   ├── layout/              # Layouts principales (Dashboard, Auth)
│   ├── paginas/             # Páginas principales
│   │   ├── Administrador/   # Páginas del rol administrador
│   │   └── Profesor/        # Páginas del rol profesor
│   ├── routes/              # Configuración de rutas
│   └── utils/               # Utilidades y configuraciones
├── package.json
├── tailwind.config.cjs
├── vite.config.js
└── vercel.json
```

## 🛠 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd Frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env.local
   VITE_BACKEND_URL=https://tu-backend-url.com
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 🎯 Funcionalidades

### 👨‍💼 Administrador

- **Gestión de Año Lectivo**
  - Iniciar/finalizar períodos académicos
  - Configurar fechas y ponderaciones
  - Control de estados activo/inactivo

- **Gestión de Personal**
  - Registro de administradores
  - Registro de profesores
  - Actualización de datos

- **Gestión Académica**
  - Crear y gestionar cursos
  - Administrar materias por curso
  - Registro de estudiantes
  - Gestión de representantes

- **Control de Asistencia**
  - Justificación de inasistencias por curso
  - Historial de asistencia

### 👨‍🏫 Profesor

- **Gestión de Notas**
  - Registro de calificaciones por materia
  - Actualización de notas existentes
  - Control por períodos académicos

- **Observaciones**
  - Registro de observaciones estudiantiles
  - Seguimiento académico y comportamental

## 👥 Roles de Usuario

### 🔐 Sistema de Autenticación

- **JWT Tokens**: Autenticación segura con tokens de acceso
- **Renovación Automática**: Interceptores de axios para renovar tokens
- **Protección de Rutas**: Rutas privadas basadas en roles
- **Estados de Sesión**: Manejo centralizado del estado de autenticación

### 📊 Control de Acceso

- **Año Lectivo Activo**: Funcionalidades habilitadas solo durante períodos activos
- **Rutas Condicionales**: Acceso restringido según el estado del año lectivo
- **Permisos por Rol**: Funcionalidades específicas según el tipo de usuario

## 🧩 Componentes Principales

### Layouts
- `Dashboard.jsx`: Layout principal con sidebar responsivo
- `ProfesoresDashboard.jsx`: Dashboard específico para profesores
- `Auth.jsx`: Layout para páginas de autenticación

### Componentes Funcionales
- `RegisterEstudiantes.jsx`: Registro y gestión de estudiantes
- `RegisterRepresentante.jsx`: Gestión de representantes
- `AsignarRepresentante.jsx`: Asignación de estudiantes a representantes
- `JustifyInasistencia.jsx`: Justificación de inasistencias
- `ObservacionEstudiante.jsx`: Registro de observaciones

### Componentes de UI
- `Mensaje.jsx`: Sistema de alertas y notificaciones
- `CardPerfil.jsx`: Tarjeta de perfil de usuario
- `FormularioPerfil.jsx`: Formulario de edición de perfil

## 🎣 Hooks Personalizados

### `useForm.js`
Hook para manejo centralizado de formularios con validación y estado.

```javascript
const { form, handleChange, resetForm } = useForm(initialState);
```

### `useAnioLectivo.js`
Hook para determinar el estado del año lectivo activo.

```javascript
const { anioLectivoActivo, loading, error, refrescarEstado } = useAnioLectivo();
```

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla
- **Hamburger Menu**: Menú de navegación colapsable en móviles
- **Touch Friendly**: Botones y elementos táctiles optimizados

## 🔄 Gestión de Estado

### Context API
- `AuthProvider.jsx`: Contexto de autenticación y usuario
- Estado global para información de sesión
- Manejo centralizado de tokens y permisos

### Estado Local
- Hooks personalizados para estado de componentes
- Manejo optimizado de formularios
- Estados de carga y error

## 🌐 Despliegue

### Vercel (Recomendado)

1. **Conectar repositorio**
   ```bash
   # Push a GitHub
   git push origin main
   ```

2. **Configurar en Vercel**
   - Importar proyecto desde GitHub
   - Configurar variables de entorno
   - Deploy automático

### Variables de Entorno de Producción
```
VITE_BACKEND_URL=https://tu-backend-production.com
```

## 🛠 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Vista previa de producción
npm run preview

# Linting
npm run lint
```

## 📊 Características Técnicas

### Performance
- **Code Splitting**: Carga dinámica de componentes
- **Lazy Loading**: Carga diferida de páginas
- **Optimización de Bundle**: Vite para builds optimizados

### Seguridad
- **Sanitización de Inputs**: Validación en frontend y backend
- **HTTPS Only**: Comunicación segura con el backend
- **Token Expiration**: Manejo automático de expiración de sesiones

### Accesibilidad
- **Semantic HTML**: Estructura semántica correcta
- **ARIA Labels**: Etiquetas de accesibilidad
- **Keyboard Navigation**: Navegación por teclado

## 🐛 Manejo de Errores

### Errores de Red
- Timeout handling para servidores lentos (Vercel)
- Mensajes específicos para errores 504, 503
- Retry automático en interceptores de axios

### Errores de Usuario
- Validación en tiempo real de formularios
- Mensajes de error descriptivos
- Estados de carga para operaciones lentas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **Componentes**: PascalCase (ej: `RegisterEstudiantes.jsx`)
- **Hooks**: camelCase con prefijo 'use' (ej: `useAnioLectivo.js`)
- **Variables**: camelCase (ej: `anioLectivoActivo`)
- **Funciones**: camelCase con verbos descriptivos (ej: `handleSubmit`)

## 🔮 Roadmap Futuro

- [ ] **PWA**: Convertir en Progressive Web App
- [ ] **Dark Mode**: Tema oscuro/claro
- [ ] **Notificaciones Push**: Alertas en tiempo real
- [ ] **Reportes PDF**: Generación de reportes
- [ ] **Chat en Vivo**: Comunicación profesor-representante
- [ ] **Calendar Integration**: Calendario académico
- [ ] **Mobile App**: Aplicación móvil nativa

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollado por

Proyecto de Titulación Curricular - EPN

---

⭐ **¡Dale una estrella si este proyecto te fue útil!**
