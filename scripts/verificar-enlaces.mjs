// Busca enlaces rotos: cada enlace interno del código debe corresponder a una ruta definida en App.jsx,
// y cada enlace externo configurado (sitio.config.js / .env) debe responder sin error.
// Uso: npm run verificar:enlaces   (con --sin-red omite los externos)
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { loadEnv } from 'vite'
import { crearSitio } from '../sitio.config.js'

const archivos = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true }))
    .map(d => d.isDirectory() ? archivos(join(dir, d.name)) : [join(dir, d.name)]))).flat().filter(f => /\.jsx?$/.test(f))

const app = await readFile('src/App.jsx', 'utf8')
// Rutas declaradas: <Route path="..."> anidadas bajo "app" se prefijan con /app
const rutas = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1]).filter(r => r !== '*')
const patrones = ['/', ...rutas.map(r => `/${r}`), ...rutas.map(r => `/app/${r}`)]
    .map(r => new RegExp('^' + r.replace(/:\w+/g, '[^/]+').replace(/\/\*$/, '(/.*)?') + '$'))

const rotos = []
for (const f of await archivos('src')) {
    const codigo = await readFile(f, 'utf8')
    for (const [, enlace, sigue] of codigo.matchAll(/(?:to|href|a)[=:]\s*[{]?[`'"](\/[^`'"$?#]*)(.?)/g)) {
        // Un segmento dinámico (`/app/clases/${id}`) se reemplaza por un valor de ejemplo
        const ruta = (sigue === '$' ? enlace + 'x' : enlace).replace(/\/$/, '') || '/'
        if (/^\/(img|favicon|icon|apple|site\.webmanifest)/.test(ruta)) continue
        if (!patrones.some(p => p.test(ruta))) rotos.push(`${f}: ${enlace}`)
    }
}

if (!process.argv.includes('--sin-red')) {
    const sitio = crearSitio(loadEnv('production', process.cwd(), 'VITE_'))
    const externos = [sitio.fichaGoogle, sitio.appMovil, ...sitio.redes.map(r => r.url)].filter(Boolean)
    for (const url of externos) {
        try {
            const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(10000) })
            if (r.status >= 400) rotos.push(`${url} → HTTP ${r.status}`)
        } catch (e) { rotos.push(`${url} → ${e.message}`) }
    }
}

if (rotos.length) { console.error('Enlaces rotos:\n' + rotos.map(r => '  - ' + r).join('\n')); process.exit(1) }
console.log(`Sin enlaces rotos (${patrones.length} rutas revisadas).`)
