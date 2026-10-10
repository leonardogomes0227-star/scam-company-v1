/**
 * Reduz a foto no próprio navegador antes de salvar: redimensiona para no máximo
 * `maxSide` px e converte para JPEG. Uma foto de celular de 4 MB vira ~100–200 KB.
 */
export async function compressImage(file: File, maxSide = 1000, quality = 0.82): Promise<string> {
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
    ctx.fillStyle = '#ffffff'; // fundo branco para PNG transparente
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Tamanho aproximado, em KB, de uma imagem em data URL. */
export function dataUrlKB(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.round((base64.length * 3) / 4 / 1024);
}

const BUCKET = 'product-images';

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mime = /data:(.*?);/.exec(meta)?.[1] || 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Envia a foto (já otimizada, em data URL) para o Supabase Storage e devolve o link público.
 * Retorna null se o bucket ainda não existir — nesse caso a foto continua salva no próprio produto.
 */
export async function uploadProductImage(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  tenantId: string,
  dataUrl: string,
): Promise<string | null> {
  const path = `${tenantId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, dataUrlToBlob(dataUrl), {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.warn('[upload] Storage indisponível, mantendo a foto no produto:', error.message);
    return null;
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
