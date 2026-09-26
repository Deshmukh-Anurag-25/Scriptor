// Downscale + re-encode an image file to keep embedded (base64) images from
// bloating the single localStorage blob. Original writecode inserted the raw
// file as-is; this caps dimensions and re-compresses as JPEG.
export function resizeImageFile(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // PNGs with transparency get re-encoded as PNG (no quality loss control);
        // everything else becomes a smaller JPEG.
        const isPng = file.type === 'image/png';
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
