// Foto optimizada: AVIF/WebP/JPEG en dos tamaños; el navegador elige el formato y ancho adecuados.
// Siempre con texto alternativo y dimensiones (evita saltos de diseño).
export const Foto = ({ nombre, alt, sizes = '100vw', prioridad = false, className = '', ancho = 1280, alto = 853 }) => {
    const srcset = (ext) => `/img/${nombre}-640.${ext} 640w, /img/${nombre}-1280.${ext} 1280w`
    return (
        <picture>
            <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
            <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
            <img
                src={`/img/${nombre}-1280.jpg`} srcSet={srcset('jpg')} sizes={sizes}
                alt={alt} width={ancho} height={alto} className={className}
                loading={prioridad ? 'eager' : 'lazy'} decoding="async"
                fetchpriority={prioridad ? 'high' : undefined}
            />
        </picture>
    )
}
