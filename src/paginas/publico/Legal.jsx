import { Link } from 'react-router-dom'
import { useSeo } from '../../hooks/useSeo'
import { sitio } from '../../config/sitio'
import { abrirPreferenciasCookies, leerConsentimiento } from '../../lib/consentimiento'
import { direccionTexto } from '../../componentes/publico/PiePublico'
import { fechaLarga } from '../../lib/formato'

// Muestra el dato configurado en sitio.config.js o un marcador visible para completarlo
const Dato = ({ valor, falta }) => valor
    ? <strong>{valor}</strong>
    : <mark className="rounded bg-amber-100 px-1 text-amber-900">[Completar: {falta}]</mark>

const DocumentoLegal = ({ titulo, descripcion, ruta, children }) => {
    useSeo({ titulo, descripcion, indexar: true, ruta })
    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{titulo}</h1>
            <p className="mt-2 text-sm text-slate-600">Última actualización: {fechaLarga(sitio.legal.actualizado)}</p>
            <div className="contenido-legal mt-8">{children}</div>
        </article>
    )
}

const Responsable = () => (
    <ul>
        <li>Nombre: <strong>{sitio.nombre}</strong></li>
        <li>Razón social: <Dato valor={sitio.legal.razonSocial} falta="razón social" /></li>
        <li>RUC: <Dato valor={sitio.legal.ruc} falta="número de RUC" /></li>
        <li>Dirección: <Dato valor={direccionTexto()} falta="dirección" /></li>
        <li>Correo de contacto: <Dato valor={sitio.legal.emailPrivacidad} falta="email de contacto" /></li>
        {sitio.contacto.telefono && <li>Teléfono: <strong>{sitio.contacto.telefono}</strong></li>}
    </ul>
)

export const AvisoLegal = () => (
    <DocumentoLegal titulo="Aviso legal" ruta="/aviso-legal" descripcion={`Aviso legal y condiciones de uso del sitio web de ${sitio.nombreCorto}.`}>
        <h2>1. Titular del sitio</h2>
        <p>En cumplimiento de la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos del Ecuador, se informa que este sitio web y la plataforma académica pertenecen a:</p>
        <Responsable />

        <h2>2. Objeto</h2>
        <p>Este sitio ofrece información institucional de la escuela y da acceso a la plataforma académica, de uso exclusivo para el personal, los docentes y los representantes de estudiantes, con la cuenta que la institución les asigna.</p>

        <h2>3. Condiciones de uso</h2>
        <ul>
            <li>Las credenciales son personales e intransferibles. La persona usuaria es responsable de su custodia y debe avisar a la escuela si sospecha un uso indebido.</li>
            <li>La información académica de los estudiantes es confidencial: solo puede usarse para el seguimiento educativo y no debe difundirse a terceros.</li>
            <li>Está prohibido intentar acceder a información de otros usuarios, alterar el funcionamiento del sitio o usarlo con fines ilícitos.</li>
        </ul>

        <h2>4. Propiedad intelectual</h2>
        <p>Los textos, logotipos, fotografías y el diseño del sitio pertenecen a la escuela o se usan con autorización. Las fotografías de estudiantes se publican con el consentimiento de sus representantes y no pueden reproducirse sin autorización.</p>

        <h2>5. Responsabilidad</h2>
        <p>La escuela procura que la información publicada sea correcta y que la plataforma esté disponible, pero no garantiza la ausencia de interrupciones por mantenimiento o causas técnicas ajenas. Los enlaces a sitios de terceros (WhatsApp, Google Maps, redes sociales) se rigen por sus propias condiciones.</p>

        <h2>6. Legislación aplicable</h2>
        <p>Este aviso se rige por la legislación de la República del Ecuador. Para cualquier controversia, las partes se someten a los jueces competentes del domicilio de la institución.</p>
        <p>Consulte también la <Link to="/privacidad" className="enlace">política de privacidad</Link> y el <Link to="/cookies" className="enlace">aviso de cookies</Link>.</p>
    </DocumentoLegal>
)

export const Privacidad = () => (
    <DocumentoLegal titulo="Política de privacidad" ruta="/privacidad" descripcion={`Cómo ${sitio.nombreCorto} trata y protege los datos personales de estudiantes, familias y docentes.`}>
        <p>Esta política explica cómo tratamos los datos personales conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP) y su reglamento.</p>

        <h2>1. Responsable del tratamiento</h2>
        <Responsable />

        <h2>2. Datos que tratamos</h2>
        <ul>
            <li><strong>Personal, docentes y representantes:</strong> nombres, apellidos, cédula, correo electrónico, teléfono, dirección y rol en la plataforma.</li>
            <li><strong>Estudiantes (niñas, niños y adolescentes):</strong> nombres, apellidos, cédula, curso, calificaciones, evaluaciones y sus evidencias, asistencia, justificaciones y observaciones de los docentes.</li>
            <li><strong>Datos técnicos:</strong> registros de acceso necesarios para la seguridad de la cuenta y, solo si se acepta, datos de navegación anónimos (ver el <Link to="/cookies" className="enlace">aviso de cookies</Link>).</li>
        </ul>

        <h2>3. Finalidades y base legal</h2>
        <ul>
            <li>Gestionar la matrícula, las calificaciones, la asistencia y la promoción de año de los estudiantes: cumplimiento de la relación educativa y de las obligaciones de la Ley Orgánica de Educación Intercultural.</li>
            <li>Informar a los representantes sobre el desempeño de sus representados: interés superior del niño y relación educativa.</li>
            <li>Enviar correos de activación de cuenta, recuperación de contraseña y avisos de la plataforma: ejecución del servicio.</li>
            <li>Medir el uso del sitio público para mejorarlo: consentimiento, que puede retirarse en cualquier momento.</li>
        </ul>
        <p>Los datos de estudiantes menores de edad se tratan únicamente con fines educativos y con la autorización de su representante legal.</p>

        <h2>4. Quién accede a los datos</h2>
        <p>Cada persona ve solo lo que necesita: el docente, a los estudiantes de sus clases; el representante, a sus representados; la administración, la información institucional. No vendemos ni cedemos datos a terceros con fines comerciales.</p>
        <p>Para operar la plataforma usamos proveedores que actúan como encargados del tratamiento: alojamiento web (Vercel), base de datos (MongoDB Atlas), envío de correos (Google/Gmail), almacenamiento de imágenes de evidencias (Imgur) y, si se acepta, analítica (Google Analytics). Algunos de estos servicios pueden almacenar datos fuera del Ecuador, con las garantías previstas en la LOPDP.</p>

        <h2>5. Conservación</h2>
        <p>Los registros académicos se conservan mientras sean necesarios para la trayectoria escolar y durante los plazos exigidos por la normativa educativa. Las cuentas desactivadas dejan de tener acceso de inmediato.</p>

        <h2>6. Seguridad</h2>
        <p>La plataforma funciona exclusivamente con conexión cifrada (HTTPS), las contraseñas se guardan cifradas, las sesiones caducan automáticamente y los permisos se verifican en el servidor en cada consulta.</p>

        <h2>7. Derechos</h2>
        <p>Puede ejercer sus derechos de acceso, rectificación y actualización, eliminación, oposición, portabilidad y suspensión del tratamiento escribiendo a <Dato valor={sitio.legal.emailPrivacidad} falta="email de contacto" />, adjuntando una copia de su cédula. Responderemos en el plazo previsto por la ley. Si no está conforme con la respuesta, puede acudir a la Superintendencia de Protección de Datos Personales.</p>

        <h2>8. Cambios</h2>
        <p>Publicaremos en esta página cualquier cambio de esta política, indicando la fecha de actualización.</p>
    </DocumentoLegal>
)

export const Cookies = () => {
    const consentimiento = leerConsentimiento()
    const hayAnalitica = Boolean(sitio.analitica.ga4)
    return (
        <DocumentoLegal titulo="Aviso de cookies" ruta="/cookies" descripcion={`Qué cookies y almacenamiento local usa el sitio de ${sitio.nombreCorto} y cómo gestionarlos.`}>
            <p>Las cookies y el almacenamiento local son pequeños archivos que el sitio guarda en su navegador. Usamos los mínimos imprescindibles.</p>

            <h2>1. Técnicas (necesarias)</h2>
            <p>No requieren consentimiento porque sin ellas la plataforma no funciona. No se usan para publicidad.</p>
            <ul>
                <li><code>descubrir.token</code> (almacenamiento local): mantiene la sesión iniciada. Se borra al cerrar sesión y caduca en pocas horas.</li>
                <li><code>descubrir.cookies</code> (almacenamiento local): recuerda su decisión sobre las cookies de analítica.</li>
                <li><code>descubrir.periodo</code> (almacenamiento de sesión): recuerda el periodo lectivo que está consultando mientras la pestaña esté abierta.</li>
            </ul>

            <h2>2. Analítica (opcionales)</h2>
            {hayAnalitica ? (
                <>
                    <p>Solo si las acepta, usamos Google Analytics 4 para saber cuántas personas visitan el sitio y qué páginas consultan. Los identificadores de la plataforma se ocultan antes de enviarse.</p>
                    <ul>
                        <li><code>_ga</code>, <code>_ga_*</code> (Google LLC): distinguen visitantes de forma anónima. Duración: hasta 2 años.</li>
                    </ul>
                    <p>Estado actual: <strong>{consentimiento ? (consentimiento.analitica ? 'aceptadas' : 'rechazadas') : 'sin decidir'}</strong>.</p>
                    <button type="button" className="btn-secundario mt-4" onClick={abrirPreferenciasCookies}>Cambiar mis preferencias</button>
                </>
            ) : (
                <p>Actualmente el sitio no usa cookies de analítica ni de publicidad.</p>
            )}

            <h2>3. Cómo eliminarlas</h2>
            <p>Puede borrar las cookies y el almacenamiento local desde la configuración de su navegador. Si borra el almacenamiento local se cerrará su sesión.</p>
        </DocumentoLegal>
    )
}
