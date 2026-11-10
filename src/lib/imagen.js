// Comprime en el navegador las fotos de evidencia antes de subirlas (una foto de celular pesa 3-8 MB):
// se reduce a 1600 px de lado mayor en JPEG de calidad 0,82. Las imágenes pequeñas y los GIF se envían tal cual.
const LADO_MAXIMO = 1600
const UMBRAL_BYTES = 900 * 1024

export const comprimirImagen = async (archivo) => {
    if (!archivo || !/^image\/(jpeg|png|webp)$/.test(archivo.type) || archivo.size <= UMBRAL_BYTES) return archivo
    try {
        const bitmap = await createImageBitmap(archivo)
        const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * escala)
        canvas.height = Math.round(bitmap.height * escala)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close?.()
        const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.82))
        if (!blob || blob.size >= archivo.size) return archivo
        return new File([blob], archivo.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
    } catch {
        return archivo
    }
}
