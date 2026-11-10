// ============================================================================
// Datos públicos de la escuela: ÚNICO lugar donde se editan.
// Se usan en la página de inicio, el pie de página, las páginas legales, el botón de WhatsApp,
// los datos estructurados (Google), el sitemap y el robots.txt.
// Los valores que cambian según el despliegue se leen de variables de entorno (ver .env.example).
// Un campo vacío ('') simplemente no se muestra.
// ============================================================================
export const crearSitio = (env = {}) => ({
    nombre: 'Escuela de Educación Básica Particular "Descubrir"',
    nombreCorto: 'Escuela Descubrir',
    eslogan: 'Aprender descubriendo, crecer en comunidad',
    descripcion: 'Escuela de Educación Básica Particular "Descubrir": educación de primero a séptimo de básica con '
        + 'acompañamiento cercano a cada familia. Consulta notas, asistencia y observaciones en línea.',

    // Dominio público del frontend, sin barra final (necesario para sitemap, canonical y Open Graph)
    url: (env.VITE_SITE_URL || '').replace(/\/$/, ''),

    contacto: {
        // Número en formato internacional, solo dígitos (Ecuador: 593 + número sin el 0 inicial)
        whatsapp: env.VITE_WHATSAPP || '',
        mensajeWhatsapp: 'Hola, quisiera información sobre la Escuela Descubrir.',
        telefono: env.VITE_TELEFONO || '',
        email: env.VITE_EMAIL_CONTACTO || ''
    },

    // COMPLETAR con los datos de la ficha de Google (Perfil de Empresa)
    direccion: {
        calle: env.VITE_DIRECCION || '',
        ciudad: env.VITE_CIUDAD || '',
        provincia: env.VITE_PROVINCIA || '',
        pais: 'EC'
    },
    // Enlace "Cómo llegar" de la ficha de Google (Google Maps → Compartir → Copiar enlace)
    fichaGoogle: env.VITE_FICHA_GOOGLE || '',
    horario: 'Lunes a viernes, 07:00 a 13:30',
    redes: [
        env.VITE_FACEBOOK && { nombre: 'Facebook', url: env.VITE_FACEBOOK },
        env.VITE_INSTAGRAM && { nombre: 'Instagram', url: env.VITE_INSTAGRAM }
    ].filter(Boolean),

    // Datos del responsable del sitio (aviso legal y política de privacidad). COMPLETAR.
    legal: {
        razonSocial: env.VITE_RAZON_SOCIAL || '',
        ruc: env.VITE_RUC || '',
        emailPrivacidad: env.VITE_EMAIL_PRIVACIDAD || env.VITE_EMAIL_CONTACTO || '',
        actualizado: '2026-11-10'
    },

    // Analítica (Google Analytics 4). Solo se carga si el visitante acepta las cookies de analítica.
    analitica: { ga4: env.VITE_GA_ID || '' },

    appMovil: env.VITE_APP_MOVIL_URL || '',

    // Páginas públicas indexables (sitemap.xml). Las privadas (/app) y las de cuenta no se indexan.
    paginasPublicas: [
        { ruta: '/', prioridad: '1.0', frecuencia: 'monthly' },
        { ruta: '/login', prioridad: '0.6', frecuencia: 'yearly' },
        { ruta: '/aviso-legal', prioridad: '0.2', frecuencia: 'yearly' },
        { ruta: '/privacidad', prioridad: '0.2', frecuencia: 'yearly' },
        { ruta: '/cookies', prioridad: '0.2', frecuencia: 'yearly' }
    ]
})
