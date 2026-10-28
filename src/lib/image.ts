/**
 * Reduz a foto no próprio navegador antes de salvar: redimensiona para no máximo
 * `maxSide` px e converte para JPEG. Uma foto de celular de 4 MB vira ~100–200 KB.
 */
export async function compressImage(file: File, maxSide = 1000, quality = 0.82, format: 'jpeg' | 'png' = 'jpeg'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('O arquivo precisa ser uma imagem.');

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não foi possível ler esta imagem.'));
      el.src = url;
    });

    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Seu navegador não conseguiu processar a imagem.');
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff'; // fundo branco para PNG transparente
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return format === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Tamanho aproximado, em KB, de uma imagem em data URL. */
export function dataUrlKB(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.round((base64.length * 3) / 4 / 1024);
}
