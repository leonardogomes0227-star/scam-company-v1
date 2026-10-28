import { ArrowRight, Clock, CreditCard, Gift, Heart, MapPin, MessageCircle, ShieldCheck, Star, Tag, Truck, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import { cx } from './ui';
import { formatBRL } from '../lib/format';
import { openStatus, type Benefit, type IconKey, type StoreCustom } from '../lib/custom';
import type { ShippingConfig } from '../lib/shipping';

/** Peças da vitrine compartilhadas entre a loja real e a pré-visualização do painel. */

// eslint-disable-next-line react-refresh/only-export-components
export const ICONS: Record<IconKey, ComponentType<{ className?: string }>> = {
  truck: Truck, shield: ShieldCheck, zap: Zap, heart: Heart, gift: Gift, clock: Clock, star: Star, message: MessageCircle, card: CreditCard, pin: MapPin,
};

export function StoreLogo({ name, custom, size = 'md' }: { name: string; custom: StoreCustom; size?: 'md' | 'lg' }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'L';
  const showLogo = custom.logo && custom.logoMode !== 'name';
  const showName = !(custom.logo && custom.logoMode === 'logo');
  const box = size === 'lg' ? 'w-11 h-11 text-lg' : 'w-9 h-9';
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      {showLogo ? (
        <img src={custom.logo} alt={showName ? '' : name} className={cx('object-contain shrink-0', custom.logoMode === 'logo' ? 'h-9 max-w-[160px]' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9')} />
      ) : (
        <span className={cx(box, 'rounded-xl bg-[var(--store)] text-[var(--store-ink)] font-display font-semibold flex items-center justify-center shrink-0')}>{initial}</span>
      )}
      {showName && <span className={cx('font-display font-semibold truncate', size === 'lg' ? 'text-xl' : 'text-lg max-w-[140px] sm:max-w-[220px]')}>{name}</span>}
    </span>
  );
}

export function AnnouncementBar({ custom, ship }: { custom: StoreCustom; ship: ShippingConfig }) {
  if (!custom.announcement.enabled) return null;
  const style = {
    brand: 'bg-[var(--store)] text-[var(--store-ink)]',
    dark: 'bg-[#111] text-white',
    light: 'bg-black/[0.05] text-[var(--fg)]',
  }[custom.announcement.style];
  const status = openStatus(custom.hours);
  return (
    <div className={cx(style, 'text-[12px] font-medium')}>
      <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-center gap-5 overflow-x-auto scrollbar-none whitespace-nowrap">
        {custom.announcement.messages.length > 0 ? (
          custom.announcement.messages.map((m) => <span key={m}>{m}</span>)
        ) : (
          <>
            <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Pedido direto pelo WhatsApp</span>
            {custom.payments.pix && <span className="hidden sm:flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {custom.payments.pixDiscount > 0 ? `${custom.payments.pixDiscount}% off no Pix` : 'Pix na hora'}</span>}
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> {ship.shipNationwide ? 'Enviamos para todo o Brasil' : `Entrega a partir de ${formatBRL(Math.min(ship.shippingLocal, ship.shippingFar))}`}</span>
            {ship.freeShippingMin ? <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Frete grátis acima de {formatBRL(ship.freeShippingMin)}</span> : null}
          </>
        )}
        {status && (
          <span className="flex items-center gap-1.5"><span className={cx('w-2 h-2 rounded-full', status.open ? 'bg-emerald-400' : 'bg-red-400')} /> {status.label}</span>
        )}
      </div>
    </div>
  );
}

export function StoreHero({ name, about, custom, contactLink, onCta }: { name: string; about: string; custom: StoreCustom; contactLink: string | null; onCta: () => void }) {
  const h = custom.hero;
  const image = h.style === 'image' && h.image;
  const center = h.align === 'center';
  const pad = { compact: 'py-7 sm:py-10', normal: 'py-10 sm:py-14', tall: 'py-16 sm:py-24' }[h.size];
  const background = image
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,${h.overlay / 100}), rgba(0,0,0,${h.overlay / 100})), url(${h.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : h.style === 'gradient'
      ? { backgroundImage: 'linear-gradient(135deg, var(--store), var(--store-2))' }
      : { backgroundColor: 'var(--store)' };
  return (
    <div className={cx('relative overflow-hidden rounded-3xl px-6 sm:px-12', pad, image ? 'text-white' : 'text-[var(--store-ink)]')} style={background}>
      {!image && (
        <>
          <div aria-hidden className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/15 blur-2xl" />
          <div aria-hidden className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-black/10 blur-2xl" />
        </>
      )}
      <div className={cx('relative max-w-xl', center && 'mx-auto text-center')}>
        {h.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{h.eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold text-balance">{h.title || name}</h1>
        <p className="mt-3 text-[15px] opacity-90 leading-relaxed">{h.subtitle || about || 'Confira nossos produtos e faça seu pedido pelo WhatsApp.'}</p>
        <div className={cx('mt-6 flex flex-wrap gap-2', center && 'justify-center')}>
          {h.cta && (
            <button type="button" onClick={onCta} className="inline-flex h-11 px-5 items-center gap-2 rounded-xl bg-[#ffffff] text-[#10190F] font-semibold text-sm hover:bg-[#f1f1f1]">
              {h.cta} <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {h.showWhatsapp && contactLink && (
            <a href={contactLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 px-5 items-center gap-2 rounded-xl bg-black/20 hover:bg-black/30 font-semibold text-sm text-inherit">
              <MessageCircle className="w-4 h-4" /> Falar com a loja
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function defaultBenefits(ship: ShippingConfig, custom: StoreCustom): Benefit[] {
  const pays = [custom.payments.pix && 'Pix', custom.payments.card && 'cartão', custom.payments.cash && 'dinheiro'].filter(Boolean) as string[];
  return [
    { icon: 'message', title: 'Atendimento', text: 'via WhatsApp' },
    { icon: 'card', title: 'Pagamento', text: pays.length ? pays.join(', ').replace(/^./, (c) => c.toUpperCase()) : 'Combine com a loja' },
    { icon: 'truck', title: ship.shipNationwide ? 'Todo o Brasil' : 'Entrega', text: ship.city ? `${ship.city} e região` : `a partir de ${formatBRL(Math.min(ship.shippingLocal, ship.shippingFar))}` },
  ];
}

export function BenefitsRow({ items }: { items: Benefit[] }) {
  const cols = items.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div className={cx('grid gap-2 sm:gap-4', cols)}>
      {items.map((b) => {
        const Icon = ICONS[b.icon];
        return (
          <div key={b.title + b.text} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left rounded-2xl bg-black/[0.03] px-3 py-3 sm:px-4">
            <span className="w-9 h-9 rounded-xl bg-[var(--store-soft)] text-[var(--store)] flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></span>
            <span className="leading-tight"><span className="block text-[13px] font-semibold">{b.title}</span><span className="text-[11.5px] text-ink-muted">{b.text}</span></span>
          </div>
        );
      })}
    </div>
  );
}
