import type { CSSProperties } from 'react';
import { brandVars, mix, readableOn, safeColor } from './color';

/**
 * Personalização completa da loja. Tudo fica numa única coluna `custom` (jsonb) da
 * tabela `tenants`; qualquer campo ausente cai no valor padrão de `DEFAULT_CUSTOM`.
 */

export type FontKey = 'modern' | 'elegant' | 'friendly' | 'bold' | 'classic';
export type RadiusKey = 'square' | 'soft' | 'round';
export type SectionId = 'benefits' | 'featured' | 'products' | 'about' | 'faq';
export type IconKey = 'truck' | 'shield' | 'zap' | 'heart' | 'gift' | 'clock' | 'star' | 'message' | 'card' | 'pin';

export interface Benefit {
  icon: IconKey;
  title: string;
  text: string;
}

export interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

export interface DeliveryZone {
  name: string;
  fee: number;
  eta: string;
}

export interface StoreCustom {
  logo: string;
  /** Como a marca aparece no topo: só o nome, logo + nome ou só a logo */
  logoMode: 'name' | 'logo-name' | 'logo';
  mode: 'light' | 'dark';
  /** Cor de fundo (vazio = padrão do modo) */
  bg: string;
  font: FontKey;
  radius: RadiusKey;
  hero: {
    style: 'solid' | 'gradient' | 'image';
    image: string;
    /** Escurecimento sobre a foto, 0–80 */
    overlay: number;
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    showWhatsapp: boolean;
    align: 'left' | 'center';
    size: 'compact' | 'normal' | 'tall';
  };
  announcement: {
    enabled: boolean;
    style: 'brand' | 'dark' | 'light';
    /** Vazio = avisos automáticos (WhatsApp, Pix, frete) */
    messages: string[];
  };
  layout: {
    columns: 3 | 4;
    mobileColumns: 1 | 2;
    aspect: 'portrait' | 'square' | 'tall';
    cardStyle: 'clean' | 'boxed';
    showRating: boolean;
    showCategory: boolean;
    showQuickAdd: boolean;
    showSearch: boolean;
    showCategories: boolean;
    productsTitle: string;
  };
  sections: { id: SectionId; enabled: boolean }[];
  benefits: Benefit[];
  about: { title: string; text: string; image: string };
  faq: { q: string; a: string }[];
  footer: {
    text: string;
    address: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    site: string;
    showBrand: boolean;
  };
  hours: { enabled: boolean; acceptOutside: boolean; days: DayHours[] };
  paused: boolean;
  pausedMessage: string;
  delivery: { zones: DeliveryZone[]; localEta: string; nationalEta: string; minOrder: number };
  payments: { pix: boolean; card: boolean; cash: boolean; pixDiscount: number; cardNote: string };
}

export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const DEFAULT_CUSTOM: StoreCustom = {
  logo: '',
  logoMode: 'name',
  mode: 'light',
  bg: '',
  font: 'modern',
  radius: 'soft',
  hero: { style: 'solid', image: '', overlay: 45, eyebrow: 'Bem-vindo(a) à', title: '', subtitle: '', cta: 'Ver produtos', showWhatsapp: true, align: 'left', size: 'normal' },
  announcement: { enabled: true, style: 'brand', messages: [] },
  layout: { columns: 4, mobileColumns: 2, aspect: 'portrait', cardStyle: 'clean', showRating: true, showCategory: true, showQuickAdd: true, showSearch: true, showCategories: true, productsTitle: 'Produtos' },
  sections: [
    { id: 'benefits', enabled: true },
    { id: 'featured', enabled: true },
    { id: 'products', enabled: true },
    { id: 'about', enabled: false },
    { id: 'faq', enabled: false },
  ],
  benefits: [],
  about: { title: 'Nossa história', text: '', image: '' },
  faq: [],
  footer: { text: '', address: '', instagram: '', facebook: '', tiktok: '', youtube: '', site: '', showBrand: true },
  hours: {
    enabled: false,
    acceptOutside: true,
    days: [
      { open: false, from: '09:00', to: '13:00' },
      ...Array.from({ length: 5 }, () => ({ open: true, from: '09:00', to: '18:00' })),
      { open: true, from: '09:00', to: '14:00' },
    ],
  },
  paused: false,
  pausedMessage: 'Estamos com os pedidos pausados por enquanto. Volte em breve!',
  delivery: { zones: [], localEta: '', nationalEta: '', minOrder: 0 },
  payments: { pix: true, card: true, cash: true, pixDiscount: 0, cardNote: '' },
};

export const SECTION_LABELS: Record<SectionId, { label: string; hint: string }> = {
  benefits: { label: 'Destaques da loja', hint: 'Faixa com 3–4 diferenciais (entrega, pagamento, garantia...)' },
  featured: { label: 'Produtos em destaque', hint: 'Mostra os produtos marcados como destaque no cadastro' },
  products: { label: 'Catálogo de produtos', hint: 'Busca, categorias e grade com todos os produtos' },
  about: { label: 'Sobre a loja', hint: 'Sua história, com foto' },
  faq: { label: 'Perguntas frequentes', hint: 'Respostas para as dúvidas mais comuns' },
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function oneOf<T extends string | number>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}
const str = (v: unknown, fallback: string, max = 600) => (typeof v === 'string' ? v.slice(0, max) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const numIn = (v: unknown, fallback: number, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const time = (v: unknown, fallback: string) => (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v) ? v : fallback);

/** Lê o jsonb do banco (qualquer formato, inclusive nulo) e devolve uma configuração completa e segura. */
export function normalizeCustom(raw: unknown): StoreCustom {
  const d = DEFAULT_CUSTOM;
  const r = isObj(raw) ? raw : {};
  const hero = isObj(r.hero) ? r.hero : {};
  const ann = isObj(r.announcement) ? r.announcement : {};
  const lay = isObj(r.layout) ? r.layout : {};
  const about = isObj(r.about) ? r.about : {};
  const foot = isObj(r.footer) ? r.footer : {};
  const hours = isObj(r.hours) ? r.hours : {};
  const del = isObj(r.delivery) ? r.delivery : {};
  const pay = isObj(r.payments) ? r.payments : {};

  // Seções: mantém a ordem salva e acrescenta as que faltarem (versões novas)
  const savedSections = Array.isArray(r.sections) ? r.sections.filter(isObj) : [];
  const seen = new Set<SectionId>();
  const sections: StoreCustom['sections'] = [];
  for (const s of savedSections) {
    const id = s.id as SectionId;
    if (id in SECTION_LABELS && !seen.has(id)) {
      seen.add(id);
      sections.push({ id, enabled: bool(s.enabled, true) });
    }
  }
  for (const s of d.sections) if (!seen.has(s.id)) sections.push({ ...s });

  const days = Array.isArray(hours.days) ? hours.days : [];
  return {
    logo: str(r.logo, '', 400_000),
    logoMode: oneOf(r.logoMode, ['name', 'logo-name', 'logo'] as const, d.logoMode),
    mode: oneOf(r.mode, ['light', 'dark'] as const, d.mode),
    bg: typeof r.bg === 'string' && /^#[0-9a-f]{6}$/i.test(r.bg) ? r.bg : '',
    font: oneOf(r.font, ['modern', 'elegant', 'friendly', 'bold', 'classic'] as const, d.font),
    radius: oneOf(r.radius, ['square', 'soft', 'round'] as const, d.radius),
    hero: {
      style: oneOf(hero.style, ['solid', 'gradient', 'image'] as const, d.hero.style),
      image: str(hero.image, '', 600_000),
      overlay: numIn(hero.overlay, d.hero.overlay, 0, 80),
      eyebrow: str(hero.eyebrow, d.hero.eyebrow, 60),
      title: str(hero.title, '', 90),
      subtitle: str(hero.subtitle, '', 220),
      cta: str(hero.cta, d.hero.cta, 30),
      showWhatsapp: bool(hero.showWhatsapp, d.hero.showWhatsapp),
      align: oneOf(hero.align, ['left', 'center'] as const, d.hero.align),
      size: oneOf(hero.size, ['compact', 'normal', 'tall'] as const, d.hero.size),
    },
    announcement: {
      enabled: bool(ann.enabled, true),
      style: oneOf(ann.style, ['brand', 'dark', 'light'] as const, d.announcement.style),
      messages: Array.isArray(ann.messages) ? ann.messages.filter((m): m is string => typeof m === 'string' && m.trim() !== '').map((m) => m.slice(0, 90)).slice(0, 4) : [],
    },
    layout: {
      columns: oneOf(Number(lay.columns), [3, 4] as const, d.layout.columns),
      mobileColumns: oneOf(Number(lay.mobileColumns), [1, 2] as const, d.layout.mobileColumns),
      aspect: oneOf(lay.aspect, ['portrait', 'square', 'tall'] as const, d.layout.aspect),
      cardStyle: oneOf(lay.cardStyle, ['clean', 'boxed'] as const, d.layout.cardStyle),
      showRating: bool(lay.showRating, true),
      showCategory: bool(lay.showCategory, true),
      showQuickAdd: bool(lay.showQuickAdd, true),
      showSearch: bool(lay.showSearch, true),
      showCategories: bool(lay.showCategories, true),
      productsTitle: str(lay.productsTitle, d.layout.productsTitle, 40) || d.layout.productsTitle,
    },
    sections,
    benefits: Array.isArray(r.benefits)
      ? r.benefits
          .filter(isObj)
          .slice(0, 4)
          .map((b) => ({ icon: oneOf(b.icon, ICON_KEYS, 'star'), title: str(b.title, '', 30), text: str(b.text, '', 50) }))
      : [],
    about: { title: str(about.title, d.about.title, 60), text: str(about.text, '', 1500), image: str(about.image, '', 600_000) },
    faq: Array.isArray(r.faq) ? r.faq.filter(isObj).slice(0, 12).map((f) => ({ q: str(f.q, '', 120), a: str(f.a, '', 600) })) : [],
    footer: {
      text: str(foot.text, '', 300),
      address: str(foot.address, '', 160),
      instagram: str(foot.instagram, '', 80),
      facebook: str(foot.facebook, '', 120),
      tiktok: str(foot.tiktok, '', 80),
      youtube: str(foot.youtube, '', 120),
      site: str(foot.site, '', 160),
      showBrand: bool(foot.showBrand, true),
    },
    hours: {
      enabled: bool(hours.enabled, false),
      acceptOutside: bool(hours.acceptOutside, true),
      days: d.hours.days.map((def, i) => {
        const day = isObj(days[i]) ? (days[i] as Record<string, unknown>) : {};
        return { open: bool(day.open, def.open), from: time(day.from, def.from), to: time(day.to, def.to) };
      }),
    },
    paused: bool(r.paused, false),
    pausedMessage: str(r.pausedMessage, d.pausedMessage, 160) || d.pausedMessage,
    delivery: {
      zones: Array.isArray(del.zones)
        ? del.zones.filter(isObj).slice(0, 60).map((z) => ({ name: str(z.name, '', 60).trim(), fee: numIn(z.fee, 0, 0, 9999), eta: str(z.eta, '', 40) })).filter((z) => z.name)
        : [],
      localEta: str(del.localEta, '', 40),
      nationalEta: str(del.nationalEta, '', 40),
      minOrder: numIn(del.minOrder, 0, 0, 99999),
    },
    payments: {
      pix: bool(pay.pix, true),
      card: bool(pay.card, true),
      cash: bool(pay.cash, true),
      pixDiscount: numIn(pay.pixDiscount, 0, 0, 50),
      cardNote: str(pay.cardNote, '', 120),
    },
  };
}

export const ICON_KEYS: readonly IconKey[] = ['truck', 'shield', 'zap', 'heart', 'gift', 'clock', 'star', 'message', 'card', 'pin'];

export const ICON_LABELS: Record<IconKey, string> = {
  truck: 'Entrega', shield: 'Garantia', zap: 'Rapidez', heart: 'Carinho', gift: 'Brinde', clock: 'Prazo', star: 'Qualidade', message: 'Atendimento', card: 'Pagamento', pin: 'Local',
};

// ---------------------------------------------------------------------------
// Tema visual
// ---------------------------------------------------------------------------
export const FONTS: Record<FontKey, { label: string; sample: string; display: string; body: string; google: string }> = {
  modern: { label: 'Moderna', sample: 'Space Grotesk', display: '"Space Grotesk", Inter, sans-serif', body: 'Inter, system-ui, sans-serif', google: 'Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700' },
  elegant: { label: 'Elegante', sample: 'Playfair Display', display: '"Playfair Display", Georgia, serif', body: 'Inter, system-ui, sans-serif', google: 'Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700' },
  friendly: { label: 'Amigável', sample: 'Nunito', display: 'Nunito, system-ui, sans-serif', body: 'Nunito, system-ui, sans-serif', google: 'Nunito:wght@400;600;700;800' },
  bold: { label: 'Forte', sample: 'Montserrat', display: 'Montserrat, system-ui, sans-serif', body: 'Montserrat, system-ui, sans-serif', google: 'Montserrat:wght@400;500;600;700;800' },
  classic: { label: 'Clássica', sample: 'DM Serif Display', display: '"DM Serif Display", Georgia, serif', body: 'Inter, system-ui, sans-serif', google: 'DM+Serif+Display&family=Inter:wght@400;500;600;700' },
};

const RADII: Record<RadiusKey, [string, string, string]> = {
  square: ['4px', '6px', '8px'],
  soft: ['0.75rem', '1rem', '1.5rem'],
  round: ['1.25rem', '1.5rem', '2.25rem'],
};

/** Carrega a fonte escolhida do Google Fonts (uma única vez por fonte). */
export function ensureFont(font: FontKey) {
  if (typeof document === 'undefined' || font === 'modern') return;
  const id = `stck-font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${FONTS[font].google}&display=swap`;
  document.head.appendChild(link);
}

export const DEFAULT_BG = { light: '#ffffff', dark: '#0f1115' };

/** Variáveis CSS que pintam a loja inteira (cores, fundo, cantos e fontes). */
export function themeStyle(colorInput: string | null | undefined, custom: StoreCustom): CSSProperties {
  const color = safeColor(colorInput);
  const dark = custom.mode === 'dark';
  const bg = custom.bg || DEFAULT_BG[custom.mode];
  const surface = dark ? mix(bg, '#ffffff', 0.06) : '#ffffff';
  const [rMd, rLg, rXl] = RADII[custom.radius];
  const light = readableOn(color) === '#0b0b0b';
  return {
    ...brandVars(color),
    '--store-2': light ? mix(color, '#ffffff', 0.35) : mix(color, '#000000', 0.4),
    '--bg': bg,
    '--surface': surface,
    '--fg': dark ? '#f4f4f5' : '#10190F',
    '--muted': dark ? 'rgba(244,244,245,.64)' : '#5B6B63',
    '--soft': dark ? 'rgba(244,244,245,.42)' : '#8A978F',
    '--r-md': rMd,
    '--r-lg': rLg,
    '--r-xl': rXl,
    '--font-display': FONTS[custom.font].display,
    '--font-body': FONTS[custom.font].body,
  } as CSSProperties;
}

// ---------------------------------------------------------------------------
// Temas prontos
// ---------------------------------------------------------------------------
export interface ThemePreset {
  id: string;
  label: string;
  color: string;
  patch: Partial<Pick<StoreCustom, 'mode' | 'bg' | 'font' | 'radius'>> & { heroStyle: StoreCustom['hero']['style'] };
}

export const PRESETS: ThemePreset[] = [
  { id: 'moderno', label: 'Moderno', color: '#0E6B4F', patch: { mode: 'light', bg: '', font: 'modern', radius: 'soft', heroStyle: 'gradient' } },
  { id: 'minimal', label: 'Minimalista', color: '#111827', patch: { mode: 'light', bg: '', font: 'modern', radius: 'square', heroStyle: 'solid' } },
  { id: 'elegante', label: 'Elegante', color: '#a16207', patch: { mode: 'light', bg: '#faf6f0', font: 'elegant', radius: 'soft', heroStyle: 'gradient' } },
  { id: 'vibrante', label: 'Vibrante', color: '#ec4899', patch: { mode: 'light', bg: '#fff7fb', font: 'friendly', radius: 'round', heroStyle: 'gradient' } },
  { id: 'noturno', label: 'Noturno', color: '#8b5cf6', patch: { mode: 'dark', bg: '', font: 'modern', radius: 'soft', heroStyle: 'gradient' } },
  { id: 'urbano', label: 'Urbano', color: '#f59e0b', patch: { mode: 'dark', bg: '#0b0b0c', font: 'bold', radius: 'square', heroStyle: 'solid' } },
];

// ---------------------------------------------------------------------------
// Horário de funcionamento
// ---------------------------------------------------------------------------
export interface OpenStatus {
  open: boolean;
  label: string;
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export function openStatus(hours: StoreCustom['hours'], now = new Date()): OpenStatus | null {
  if (!hours.enabled) return null;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = hours.days[now.getDay()];
  if (today.open && minutes >= toMin(today.from) && minutes < toMin(today.to)) {
    return { open: true, label: `Aberto até ${today.to}` };
  }
  if (today.open && minutes < toMin(today.from)) return { open: false, label: `Fechado · abre hoje às ${today.from}` };
  for (let i = 1; i <= 7; i++) {
    const idx = (now.getDay() + i) % 7;
    const next = hours.days[idx];
    if (next.open) return { open: false, label: `Fechado · abre ${i === 1 ? 'amanhã' : DAY_NAMES[idx].toLowerCase()} às ${next.from}` };
  }
  return { open: false, label: 'Fechado' };
}

/** Texto curto para o rodapé: "Seg a Sex 09:00–18:00 · Sáb 09:00–14:00" */
export function hoursSummary(hours: StoreCustom['hours']): string[] {
  const short = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const lines: string[] = [];
  let i = 1;
  const order = [1, 2, 3, 4, 5, 6, 0];
  while (i <= order.length) {
    const d = hours.days[order[i - 1]];
    if (!d.open) {
      i++;
      continue;
    }
    let j = i;
    while (j < order.length) {
      const n = hours.days[order[j]];
      if (n.open && n.from === d.from && n.to === d.to) j++;
      else break;
    }
    const first = short[order[i - 1]];
    const last = short[order[j - 1]];
    lines.push(`${j > i ? `${first} a ${last}` : first} ${d.from}–${d.to}`);
    i = j + 1;
  }
  return lines;
}

export function socialLinks(f: StoreCustom['footer']): { id: string; label: string; url: string }[] {
  const handle = (v: string) => v.trim().replace(/^@/, '');
  const url = (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`);
  const out: { id: string; label: string; url: string }[] = [];
  if (f.instagram.trim()) out.push({ id: 'instagram', label: 'Instagram', url: /instagram\.com/i.test(f.instagram) ? url(f.instagram) : `https://instagram.com/${handle(f.instagram)}` });
  if (f.facebook.trim()) out.push({ id: 'facebook', label: 'Facebook', url: /facebook\.com|fb\.com/i.test(f.facebook) ? url(f.facebook) : `https://facebook.com/${handle(f.facebook)}` });
  if (f.tiktok.trim()) out.push({ id: 'tiktok', label: 'TikTok', url: /tiktok\.com/i.test(f.tiktok) ? url(f.tiktok) : `https://tiktok.com/@${handle(f.tiktok)}` });
  if (f.youtube.trim()) out.push({ id: 'youtube', label: 'YouTube', url: url(f.youtube) });
  if (f.site.trim()) out.push({ id: 'site', label: 'Site', url: url(f.site) });
  return out;
}
