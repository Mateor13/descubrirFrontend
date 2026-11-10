# Escuela Descubrir · Frontend v2

Sitio público y plataforma académica de la Escuela de Educación Básica Particular "Descubrir", conectados a la **API v2** del backend (`/api/v2`).

- **Sitio público** (`/`): presentación de la escuela, una única llamada a la acción (WhatsApp), aviso legal, privacidad y cookies.
- **Plataforma** (`/app`): menú según los roles de cada cuenta (una persona puede ser admin, profesor y representante a la vez).
  - **Administración:** periodos lectivos (crear, configurar ponderaciones, activar, cerrar y **promoción de año por partes** con barra de progreso), usuarios, estudiantes y matrículas, cursos, asignaturas, clases y docentes, justificación de inasistencias.
  - **Docentes:** mis clases, evaluaciones con evidencia fotográfica, planilla de calificaciones, asistencia diaria, observaciones.
  - **Representantes:** boletín (promedios por tipo y final), asistencia y observaciones de sus representados.
  - Selector de **periodo** para consultar años anteriores en modo solo lectura.
- **Cuentas:** `/login`, `/recuperar`, `/v2/activar/:token` y `/v2/restablecer/:token` (enlaces de los correos de la v2).

## Puesta en marcha

```bash
cp .env.example .env.local   # completar los valores
nvm use        # Node 24 (ver .nvmrc)
npm install
npm run dev
npm run build                # genera dist/ con sitemap.xml, robots.txt y 404.html
```

Los datos de la escuela (nombre, contacto, dirección, ficha de Google, datos legales) se editan en **`sitio.config.js`** o con las variables `VITE_*` de `.env.example`. Un dato vacío no se muestra; en las páginas legales aparece resaltado como *[Completar]*.

## Checklist del sitio

| Requisito | Dónde |
|---|---|
| Aviso legal, privacidad, cookies | `src/paginas/publico/Legal.jsx` (Ecuador, LOPDP). Revisar con asesoría legal y completar razón social/RUC. |
| Aviso de cookies | `AvisoCookies.jsx`: la analítica **no se carga** hasta que se acepta; preferencias modificables desde el pie. |
| Forzar HTTPS | Vercel redirige HTTP→HTTPS; `vercel.json` añade HSTS, `upgrade-insecure-requests` y cabeceras de seguridad (CSP, X-Frame-Options…). |
| Meta títulos y descripciones | `useSeo` por página (título, descripción, canonical, `noindex` en páginas privadas). |
| Datos estructurados | JSON-LD `ElementarySchool` generado en el build (`vite.config.js`). |
| Sitemap y robots.txt | Generados en el build a partir de `VITE_SITE_URL`. |
| Ficha de Google | `VITE_FICHA_GOOGLE` (enlace del Perfil de Empresa): se enlaza en el pie, en "Visítanos" y en los datos estructurados. |
| Favicon | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, iconos 192/512 y `site.webmanifest`. |
| Texto alternativo en imágenes | Todas las fotos tienen `alt` descriptivo; los iconos decorativos, `aria-hidden`. |
| Imágenes comprimidas | `npm run imagenes`: AVIF/WebP/JPEG en 640 y 1280 px (de 2,2 MB a ~35-180 KB por foto). Las evidencias se comprimen en el navegador antes de subir. |
| Velocidad de carga | Carga diferida por página, librerías en chunks cacheables, imágenes responsivas, caché inmutable para `/assets`. |
| Contraste de colores | Paleta institucional en `tailwind.config.cjs`; texto sobre verde usa tonos ≥ 4,5:1 (WCAG AA). |
| Móvil | Diseño *mobile-first*, tablas que pasan a tarjetas, botones ≥ 44 px, sin desplazamiento horizontal. |
| Página 404 | `NoEncontrado.jsx`; Vercel la sirve con **estado HTTP 404** (`404.html`). |
| Enlaces rotos | `npm run verificar:enlaces`; las rutas de la v1 redirigen (301) a las nuevas. |
| Formularios contra spam | Campo trampa + tiempo mínimo en el navegador, rechazo del campo trampa en el backend y límite de intentos por IP. |
| Botón de WhatsApp | Flotante en todas las páginas públicas (`VITE_WHATSAPP`). |
| Analítica | Google Analytics 4 (`VITE_GA_ID`) con consentimiento; las rutas privadas se anonimizan. |
| Una sola llamada a la acción | "Escríbenos por WhatsApp" es el único botón destacado del sitio público. |

## Estructura

```
sitio.config.js          datos públicos de la escuela (única fuente)
src/api/                 cliente HTTP y endpoints de la API v2
src/context/             sesión y periodo lectivo seleccionado
src/componentes/ui/      componentes reutilizables (campos, modales, tablas)
src/layouts/             sitio público, pantallas de acceso y plataforma
src/paginas/             publico · cuenta · app · admin · docente · representante
recursos/                originales de fotos y logo (no se publican)
```
