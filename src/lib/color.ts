import type { CSSProperties } from 'react';

/** Utilitários para aplicar a cor escolhida pelo lojista com contraste legível. */

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function mix(a: string, b: string, t: number): string {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return a;
  const c = ra.map((v, i) => Math.round(v + (rb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function safeColor(hex: string | null | undefined, fallback = '#f59e0b'): string {
  return hex && parseHex(hex) ? (hex.startsWith('#') ? hex : `#${hex}`) : fallback;
}

/** Texto preto ou branco, o que tiver mais contraste sobre a cor. */
export function readableOn(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return '#000';
  const L = luminance(rgb);
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#0b0b0b' : '#ffffff';
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Variáveis CSS usadas pela vitrine/painel para pintar com a cor da loja. */
export function brandVars(hex: string): CSSProperties {
  const color = safeColor(hex);
  return {
    '--store': color,
    '--store-ink': readableOn(color),
    '--store-soft': withAlpha(color, 0.1),
    '--store-ring': withAlpha(color, 0.35),
  } as CSSProperties;
}
