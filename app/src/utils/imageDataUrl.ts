/** Max longest side for uploaded recipe photos (keeps DB payloads reasonable). */
const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.82;

/**
 * Convert a local image File into a durable data URL (base64).
 * Blob/object URLs die on reload; data URLs can be stored in `image_url`.
 */
export async function fileToPersistedImageUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen.');
  }

  if (typeof createImageBitmap !== 'function') {
    return readFileAsDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return readFileAsDataUrl(file);
    ctx.drawImage(bitmap, 0, 0, width, height);
    // Food photos: JPEG is smaller; keep PNG only if source was PNG and tiny after resize is still ok as JPEG.
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('No se pudo leer la imagen.'));
    };
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
}
