const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(value: number | string | null | undefined): string {
  return brl.format(Number(value) || 0);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const [y, m, d] = value.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y}` : value;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Normaliza um telefone brasileiro para o formato usado pelo wa.me (55 + DDD + número). */
export function normalizeWhatsapp(phone: string | null | undefined): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
}

export function whatsappLink(phone: string | null | undefined, text: string): string {
  return `https://wa.me/${normalizeWhatsapp(phone)}?text=${encodeURIComponent(text)}`;
}

/** Código de pedido difícil de adivinhar (evita que terceiros consultem pedidos alheios). */
export function generateOrderCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'PED-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function generateId(): string {
  return crypto.randomUUID();
}

/** "P, M, G" → ["P", "M", "G"] */
export function parseVariants(value: string | null | undefined): string[] {
  return Array.from(new Set((value || '').split(/[,;\n]/).map((v) => v.trim()).filter(Boolean)));
}

/** Percentual de desconto entre o preço "de" e o preço atual. */
export function discountPercent(price: number, comparePrice: number | null | undefined): number {
  const cp = Number(comparePrice);
  if (!cp || cp <= price) return 0;
  return Math.round((1 - price / cp) * 100);
}
