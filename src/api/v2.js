// Endpoints de la API v2 (ver docs/v2/API.md del backend). Un solo lugar con las rutas.
import { get, post, patch, put, del } from './cliente'

const conPeriodo = (periodo, extra = {}) => ({ ...extra, ...(periodo && { periodo }) })

export const auth = {
    login: (datos) => post('/auth/login', datos),
    activar: (datos) => post('/auth/activar', datos),
    recuperar: (datos) => post('/auth/recuperar', datos),
    restablecer: (datos) => post('/auth/restablecer', datos),
    perfil: () => get('/auth/perfil'),
    actualizarPerfil: (datos) => patch('/auth/perfil', datos),
    cambiarPassword: (datos) => patch('/auth/password', datos)
}

export const usuarios = {
    listar: ({ rol, activo = true } = {}) => get('/usuarios', { ...(rol && { rol }), activo }),
    obtener: (id) => get(`/usuarios/${id}`),
    crear: (datos) => post('/usuarios', datos),
    actualizar: (id, datos) => patch(`/usuarios/${id}`, datos),
    desactivar: (id) => del(`/usuarios/${id}`),
    reenviarActivacion: (id) => post(`/usuarios/${id}/reenviar-activacion`)
}

export const periodos = {
    listar: () => get('/periodos'),
    activo: () => get('/periodos/activo'),
    crear: (datos) => post('/periodos', datos),
    configurar: (id, datos) => patch(`/periodos/${id}`, datos),
    activar: (id) => post(`/periodos/${id}/activar`),
    cerrar: (id) => post(`/periodos/${id}/cerrar`),
    vistaPrevia: (id, curso) => get(`/periodos/${id}/promocion/vista-previa`, { curso }),
    estadoPromocion: (id) => get(`/periodos/${id}/promocion`),
    iniciarPromocion: (id, datos) => post(`/periodos/${id}/promocion`, datos),
    procesarPromocion: (id) => post(`/periodos/${id}/promocion/procesar`)
}

export const academico = {
    cursos: () => get('/cursos'),
    crearCurso: (datos) => post('/cursos', datos),
    asignaturas: () => get('/asignaturas'),
    crearAsignatura: (datos) => post('/asignaturas', datos),
    actualizarAsignatura: (id, datos) => patch(`/asignaturas/${id}`, datos),
    clases: ({ curso, profesor, periodo } = {}) => get('/clases', conPeriodo(periodo, { ...(curso && { curso }), ...(profesor && { profesor }) })),
    crearClase: (datos) => post('/clases', datos),
    cambiarProfesor: (id, profesor) => patch(`/clases/${id}`, { profesor }),
    desactivarClase: (id) => del(`/clases/${id}`)
}

export const estudiantes = {
    crear: (datos) => post('/estudiantes', datos),
    mios: (periodo) => get('/estudiantes/mios', conPeriodo(periodo)),
    obtener: (id, periodo) => get(`/estudiantes/${id}`, conPeriodo(periodo)),
    actualizar: (id, datos) => patch(`/estudiantes/${id}`, datos),
    desactivar: (id) => del(`/estudiantes/${id}`),
    vincular: (id, representante) => post(`/estudiantes/${id}/representantes`, { representante }),
    desvincular: (id, representanteId) => del(`/estudiantes/${id}/representantes/${representanteId}`),
    delCurso: (cursoId, periodo) => get(`/cursos/${cursoId}/estudiantes`, conPeriodo(periodo)),
    matricular: (datos) => post('/matriculas', datos),
    cambiarCurso: (matriculaId, curso) => patch(`/matriculas/${matriculaId}`, { curso }),
    retirar: (matriculaId) => post(`/matriculas/${matriculaId}/retiro`),
    boletin: (id, periodo) => get(`/estudiantes/${id}/boletin`, conPeriodo(periodo)),
    asistencias: (id, periodo) => get(`/estudiantes/${id}/asistencias`, conPeriodo(periodo)),
    observaciones: (id, periodo) => get(`/estudiantes/${id}/observaciones`, conPeriodo(periodo)),
    observar: (id, texto) => post(`/estudiantes/${id}/observaciones`, { texto })
}

export const evaluaciones = {
    listar: (claseId, tipo) => get(`/clases/${claseId}/evaluaciones`, tipo ? { tipo } : undefined),
    // multipart: admite la imagen de evidencia
    crear: (claseId, formData) => post(`/clases/${claseId}/evaluaciones`, formData),
    actualizar: (id, formData) => patch(`/evaluaciones/${id}`, formData),
    eliminar: (id) => del(`/evaluaciones/${id}`),
    planilla: (id) => get(`/evaluaciones/${id}/calificaciones`),
    calificar: (id, calificaciones) => put(`/evaluaciones/${id}/calificaciones`, { calificaciones })
}

export const asistencias = {
    delDia: (cursoId, fecha) => get(`/cursos/${cursoId}/asistencias`, fecha ? { fecha } : undefined),
    registrar: (cursoId, datos) => put(`/cursos/${cursoId}/asistencias`, datos),
    justificar: (id, justificacion) => patch(`/asistencias/${id}/justificacion`, { justificacion })
}
