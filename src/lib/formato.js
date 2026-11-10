// Las fechas "de calendario" de la API llegan a medianoche UTC: se formatean en UTC para no correr un día
const formatoDia = new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const formatoLargo = new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const formatoFechaHora = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guayaquil' })

export const fecha = (valor) => (valor ? formatoDia.format(new Date(valor)) : '—')
export const fechaLarga = (valor) => (valor ? formatoLargo.format(new Date(valor)) : '—')
export const fechaHora = (valor) => (valor ? formatoFechaHora.format(new Date(valor)) : '—')
export const aISO = (valor) => (valor ? new Date(valor).toISOString().slice(0, 10) : '')

// Hoy en la zona horaria de la escuela, como 'AAAA-MM-DD'
export const hoyISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(new Date())

export const nombreCompleto = (p) => (p ? `${p.apellido ?? ''} ${p.nombre ?? ''}`.trim() : '')
export const nota = (n) => (typeof n === 'number' ? n.toFixed(2) : '—')
export const iniciales = (p) => `${p?.nombre?.[0] ?? ''}${p?.apellido?.[0] ?? ''}`.toUpperCase()

export const ROLES = { admin: 'Administrador', profesor: 'Profesor', representante: 'Representante' }
export const TIPOS_EVALUACION = { deber: 'Deberes', taller: 'Talleres', prueba: 'Pruebas', examen: 'Exámenes' }
export const TIPO_SINGULAR = { deber: 'Deber', taller: 'Taller', prueba: 'Prueba', examen: 'Examen' }
export const ESTADOS_ASISTENCIA = { presente: 'Presente', ausente: 'Ausente', atraso: 'Atraso', justificado: 'Justificado' }
export const ESTADOS_PERIODO = { planificado: 'Planificado', activo: 'Activo', cerrado: 'Cerrado' }
export const NIVELES = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo']
export const PARALELOS = ['A', 'B', 'C', 'D', 'E']
