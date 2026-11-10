// Genera las imágenes optimizadas de /public a partir de los originales de /recursos.
// Uso: npm run imagenes  (solo hace falta al cambiar una foto o el logo; el resultado se versiona)
import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const FOTOS = ['descubrir', 'descubrir2', 'descubrir3']
const ANCHOS = [640, 1280]
await mkdir('public/img', { recursive: true })

for (const foto of FOTOS) {
    for (const ancho of ANCHOS) {
        const base = sharp(`recursos/fotos/${foto}.jpg`).rotate().resize({ width: ancho, withoutEnlargement: true })
        await base.clone().avif({ quality: 50, effort: 6 }).toFile(`public/img/${foto}-${ancho}.avif`)
        await base.clone().webp({ quality: 72 }).toFile(`public/img/${foto}-${ancho}.webp`)
        await base.clone().jpeg({ quality: 72, mozjpeg: true, progressive: true }).toFile(`public/img/${foto}-${ancho}.jpg`)
    }
}

// Imagen para redes sociales (Open Graph): 1200x630
await sharp('recursos/fotos/descubrir3.jpg').resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 75, mozjpeg: true }).toFile('public/img/og-imagen.jpg')

// Favicons e iconos de la app a partir del logo vectorial
const logo = await readFile('recursos/logo.svg')
await writeFile('public/favicon.svg', logo)
const png = (tam) => sharp(logo, { density: 384 }).resize(tam, tam).png({ compressionLevel: 9 }).toBuffer()
await writeFile('public/apple-touch-icon.png', await sharp(logo, { density: 384 }).resize(180, 180).flatten({ background: '#2f6e35' }).png().toBuffer())
await writeFile('public/icon-192.png', await png(192))
await writeFile('public/icon-512.png', await png(512))
// favicon.ico con una imagen PNG de 48x48 dentro (formato ICO admite PNG embebido)
const p48 = await png(48)
const cabecera = Buffer.alloc(22)
cabecera.writeUInt16LE(0, 0); cabecera.writeUInt16LE(1, 2); cabecera.writeUInt16LE(1, 4)
cabecera.writeUInt8(48, 6); cabecera.writeUInt8(48, 7); cabecera.writeUInt16LE(1, 10); cabecera.writeUInt16LE(32, 12)
cabecera.writeUInt32LE(p48.length, 14); cabecera.writeUInt32LE(22, 18)
await writeFile('public/favicon.ico', Buffer.concat([cabecera, p48]))
console.log('Imágenes optimizadas en /public')
