import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { crearSitio } from './sitio.config.js'

const escaparHtml = (t = '') => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// Datos estructurados (schema.org) para que Google entienda que es una escuela y la asocie a su ficha
const datosEstructurados = (sitio) => {
    const { direccion: d, contacto: c } = sitio
    const datos = {
        '@context': 'https://schema.org',
        '@type': 'ElementarySchool',
        name: sitio.nombre,
        alternateName: sitio.nombreCorto,
        description: sitio.descripcion,
        ...(sitio.url && { url: sitio.url, logo: `${sitio.url}/icon-512.png`, image: `${sitio.url}/img/og-imagen.jpg` }),
        ...(c.telefono && { telephone: c.telefono }),
        ...(c.email && { email: c.email }),
        ...((d.calle || d.ciudad) && {
            address: {
                '@type': 'PostalAddress',
                ...(d.calle && { streetAddress: d.calle }),
                ...(d.ciudad && { addressLocality: d.ciudad }),
                ...(d.provincia && { addressRegion: d.provincia }),
                addressCountry: d.pais
            }
        }),
        ...(sitio.fichaGoogle && { hasMap: sitio.fichaGoogle }),
        ...((sitio.redes.length || sitio.fichaGoogle) && { sameAs: [...sitio.redes.map(r => r.url), sitio.fichaGoogle].filter(Boolean) })
    }
    return JSON.stringify(datos).replace(/</g, '\\u003c')
}

// Plugin: inyecta SEO en index.html y genera robots.txt, sitemap.xml y 404.html al compilar
const seo = (sitio) => ({
    name: 'descubrir-seo',
    transformIndexHtml(html) {
        const canonical = sitio.url ? `<link rel="canonical" href="${sitio.url}/">\n    <meta property="og:url" content="${sitio.url}/">\n    <meta property="og:image" content="${sitio.url}/img/og-imagen.jpg">` : ''
        return html
            .replaceAll('%SITIO_TITULO%', escaparHtml(`${sitio.nombreCorto} | ${sitio.eslogan}`))
            .replaceAll('%SITIO_NOMBRE%', escaparHtml(sitio.nombreCorto))
            .replaceAll('%SITIO_DESCRIPCION%', escaparHtml(sitio.descripcion))
            .replace('<!--SITIO_CANONICAL-->', canonical)
            .replace('<!--SITIO_JSONLD-->', `<script type="application/ld+json">${datosEstructurados(sitio)}</script>`)
    },
    generateBundle() {
        const robots = ['User-agent: *', 'Allow: /', 'Disallow: /app', 'Disallow: /v2/', '']
        if (sitio.url) {
            robots.push(`Sitemap: ${sitio.url}/sitemap.xml`, '')
            const hoy = new Date().toISOString().slice(0, 10)
            const urls = sitio.paginasPublicas.map(p => `  <url><loc>${sitio.url}${p.ruta}</loc><lastmod>${hoy}</lastmod>`
                + `<changefreq>${p.frecuencia}</changefreq><priority>${p.prioridad}</priority></url>`)
            this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n` })
        } else {
            this.warn('VITE_SITE_URL no está definido: no se generará sitemap.xml ni la URL canónica')
        }
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') })
    },
    // Página 404 real: Vercel la sirve con estado 404 para cualquier ruta desconocida y React muestra la página personalizada
    async writeBundle({ dir }) {
        const index = await readFile(join(dir, 'index.html'), 'utf8')
        await writeFile(join(dir, '404.html'), index.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex">'))
    }
})

export default defineConfig(({ mode }) => {
    const sitio = crearSitio(loadEnv(mode, process.cwd(), 'VITE_'))
    return {
        plugins: [react(), seo(sitio)],
        define: { __SITIO__: JSON.stringify(sitio) },
        build: {
            target: 'es2020',
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    // Librerías en chunks separados: cambian poco y quedan en caché del navegador
                    manualChunks: {
                        react: ['react', 'react-dom', 'react-router-dom'],
                        red: ['axios']
                    }
                }
            }
        }
    }
})
