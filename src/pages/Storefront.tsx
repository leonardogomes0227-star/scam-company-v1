import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Copy, CreditCard, Heart, MapPin, MessageCircle, Minus, Package, Plus,
  Search, ShoppingBag, SlidersHorizontal, Star, Store as StoreIcon, Tag, Trash2, Truck, X, Zap,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatBRL, formatDate, generateId, generateOrderCode, normalizeWhatsapp, whatsappLink } from '../lib/format';
import { buildPixPayload } from '../lib/pix';
import { brandVars, safeColor } from '../lib/color';
import { Drawer, Modal, cx } from '../components/ui';
import type { Coupon, OrderItem, Product, Review, Tenant } from '../types';

const PAYMENT_METHODS = [
  { id: 'Pix', label: 'Pix', hint: 'Código na hora' },
  { id: 'Cartão', label: 'Cartão', hint: 'Na entrega' },
  { id: 'Dinheiro', label: 'Dinheiro', hint: 'Na entrega' },
] as const;

type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'rating';

interface CartLine {
  productId: string;
  quantity: number;
}

interface TrackedOrder {
  id: string;
  status: string;
  total: number;
  date: string;
}

interface PlacedOrder {
  id: string;
  total: number;
  payment: string;
  whatsappUrl: string;
  pixCode: string | null;
}

interface Rating {
  average: number;
  count: number;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // armazenamento indisponível (modo privado etc.) — segue sem persistir
  }
}

// ---------------------------------------------------------------------------
// Peças visuais
// ---------------------------------------------------------------------------
function Stars({ rating, size = 'w-3.5 h-3.5' }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex text-amber-400" aria-label={`${rating.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cx(size, i < Math.round(rating) ? 'fill-current' : 'text-black/15')} />
      ))}
    </span>
  );
}

function ProductImage({ product, className }: { product: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!product.image || failed) {
    return (
      <div className={cx('flex items-center justify-center bg-[var(--store-soft)] text-[var(--store)]', className)}>
        <Package className="w-10 h-10 opacity-60" />
      </div>
    );
  }
  return <img src={product.image} alt={product.name} loading="lazy" onError={() => setFailed(true)} className={cx('object-cover bg-black/[0.03]', className)} />;
}

function QuantityStepper({ value, max, onChange, size = 'md' }: { value: number; max: number; onChange: (v: number) => void; size?: 'sm' | 'md' }) {
  const btn = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div className="inline-flex items-center rounded-xl border border-black/10 bg-white">
      <button type="button" onClick={() => onChange(value - 1)} className={cx(btn, 'flex items-center justify-center text-ink-muted hover:text-ink')} aria-label="Diminuir quantidade"><Minus className="w-3.5 h-3.5" /></button>
      <span className={cx('text-center font-semibold tabular-nums', size === 'sm' ? 'w-6 text-sm' : 'w-8')}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} className={cx(btn, 'flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30')} aria-label="Aumentar quantidade"><Plus className="w-3.5 h-3.5" /></button>
    </div>
  );
}

const storeButton = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl bg-[var(--store)] text-[var(--store-ink)] hover:brightness-95 active:brightness-90 transition disabled:opacity-40 disabled:pointer-events-none';
const fieldClass = 'w-full h-11 rounded-xl border border-black/10 bg-white px-3.5 text-sm placeholder:text-ink-soft focus:outline-none focus:border-[var(--store)] focus:ring-4 focus:ring-[var(--store-soft)]';

// ---------------------------------------------------------------------------
// Vitrine
// ---------------------------------------------------------------------------
export default function Storefront({ tenantId }: { tenantId: string }) {
  const [store, setStore] = useState<Tenant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeNotFound, setStoreNotFound] = useState(false);

  const cartKey = `store_cart_${tenantId}`;
  const favKey = `store_favorites_${tenantId}`;
  const [cart, setCart] = useState<CartLine[]>(() => readStorage(cartKey, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(favKey, []));

  const [panel, setPanel] = useState<'cart' | 'favorites' | 'tracking' | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [cartPulse, setCartPulse] = useState(0);

  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const [clientName, setClientName] = useState(() => readStorage('stck_customer', { name: '' }).name);
  const [clientPhone, setClientPhone] = useState(() => readStorage('stck_customer', { phone: '' }).phone);
  const [clientAddress, setClientAddress] = useState(() => readStorage('stck_customer', { address: '' }).address);
  const [shippingRegion, setShippingRegion] = useState<'local' | 'far'>('local');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pix');
  const [checkoutError, setCheckoutError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<TrackedOrder | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Carrega a loja, produtos, cupons e avaliações
  useEffect(() => {
    let cancelled = false;

    async function loadStoreData() {
      setLoadingStore(true);
      const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle();
      if (cancelled) return;

      if (!tenant) {
        setStoreNotFound(true);
        setLoadingStore(false);
        return;
      }
      setStore(tenant as Tenant);

      const [productsRes, couponsRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').eq('tenant_id', tenantId),
        supabase.from('reviews').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;

      const loaded = ((productsRes.data as Product[]) || []).map((p) => ({ ...p, price: Number(p.price), stock: Number(p.stock) || 0 }));
      setProducts(loaded);
      setCoupons(((couponsRes.data as Coupon[]) || []).map((c) => ({ ...c, discount: Number(c.discount) })));
      setReviews((reviewsRes.data as Review[]) || []);

      const ids = new Set(loaded.map((p) => p.id));
      setCart((prev) => prev.filter((l) => ids.has(l.productId)));
      setFavorites((prev) => prev.filter((id) => ids.has(id)));
      setLoadingStore(false);
    }

    if (tenantId) loadStoreData();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  useEffect(() => writeStorage(cartKey, cart), [cartKey, cart]);
  useEffect(() => writeStorage(favKey, favorites), [favKey, favorites]);

  useEffect(() => {
    if (store?.name) document.title = store.name;
    return () => {
      document.title = 'STCK Company';
    };
  }, [store?.name]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const ratings = useMemo(() => {
    const acc = new Map<string, { sum: number; count: number }>();
    for (const r of reviews) {
      const cur = acc.get(r.product_id) || { sum: 0, count: 0 };
      acc.set(r.product_id, { sum: cur.sum + r.rating, count: cur.count + 1 });
    }
    const out = new Map<string, Rating>();
    acc.forEach((v, k) => out.set(k, { average: v.sum / v.count, count: v.count }));
    return out;
  }, [reviews]);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map((p) => p.category || 'Geral')))], [products]);

  const visibleProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const inCategory = selectedCategory === 'Todos' || (p.category || 'Geral') === selectedCategory;
      const inSearch = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      return inCategory && inSearch;
    });
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'rating') sorted.sort((a, b) => (ratings.get(b.id)?.average ?? 0) - (ratings.get(a.id)?.average ?? 0));
    // Esgotados sempre por último
    return sorted.sort((a, b) => Number(a.stock <= 0) - Number(b.stock <= 0));
  }, [products, selectedCategory, searchQuery, sort, ratings]);

  const cartLines = cart
    .map((line) => ({ ...line, product: productById.get(line.productId) }))
    .filter((l): l is CartLine & { product: Product } => !!l.product);
  const cartCount = cartLines.reduce((acc, l) => acc + l.quantity, 0);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  const addToCart = (product: Product, quantity = 1, openCart = true) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: Math.min(l.quantity + quantity, product.stock) } : l));
      }
      return [...prev, { productId: product.id, quantity: Math.min(quantity, product.stock) }];
    });
    setCartPulse((n) => n + 1);
    setActiveProductId(null);
    if (openCart) {
      setCheckoutStep('cart');
      setPlacedOrder(null);
      setPanel('cart');
    }
  };

  const setLineQuantity = (productId: string, quantity: number) => {
    const product = productById.get(productId);
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, product?.stock ?? quantity) } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const openProduct = (product: Product) => {
    setActiveProductId(product.id);
    setModalQuantity(1);
    setReviewSent(false);
  };

  const handleAddReview = async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newReview: Review = {
      id: generateId(),
      tenant_id: tenantId,
      product_id: productId,
      name: reviewName.trim().slice(0, 60),
      comment: reviewComment.trim().slice(0, 500),
      rating: reviewRating,
    };
    setReviewSending(true);
    const { error } = await supabase.from('reviews').insert([newReview]);
    setReviewSending(false);
    if (error) {
      alert('Não foi possível enviar sua avaliação agora. Tente novamente mais tarde.');
      return;
    }
    setReviews((prev) => [newReview, ...prev]);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSent(true);
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.toUpperCase().trim();
    if (!code) return;
    const found = coupons.find((c) => c.code.toUpperCase() === code);
    if (found) {
      setAppliedCoupon(found);
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const shippingLocal = Number(store?.shipping_local ?? 10);
  const shippingFar = Number(store?.shipping_far ?? 18);
  const shippingFee = shippingRegion === 'local' ? shippingLocal : shippingFar;
  const subtotal = cartLines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount) + shippingFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    if (cartLines.length === 0 || !store) return;
    if (!clientName.trim() || !clientAddress.trim()) {
      setCheckoutError('Preencha seu nome e endereço para continuar.');
      return;
    }
    if (normalizeWhatsapp(clientPhone).length < 12) {
      setCheckoutError('Informe um WhatsApp válido com DDD.');
      return;
    }

    const orderId = generateOrderCode();
    const items: OrderItem[] = cartLines.map((l) => ({ id: l.product.id, name: l.product.name, price: l.product.price, quantity: l.quantity }));
    const pixCode =
      paymentMethod === 'Pix' && store.pix_key
        ? buildPixPayload({ key: store.pix_key, merchantName: store.name, amount: total, txid: orderId.replace('-', '') })
        : null;

    let msg =
      `🛒 *NOVO PEDIDO (${orderId}) - ${store.name}*\n\n` +
      `👤 *Cliente:* ${clientName.trim()}\n` +
      `📱 *WhatsApp:* ${clientPhone.trim()}\n` +
      `📍 *Endereço:* ${clientAddress.trim()}\n` +
      `💳 *Pagamento:* ${paymentMethod}\n\n` +
      `📦 *Itens:*\n`;
    items.forEach((item) => {
      msg += `- ${item.quantity}x ${item.name} (${formatBRL(item.price * item.quantity)})\n`;
    });
    msg += `\nSubtotal: ${formatBRL(subtotal)}\n`;
    if (appliedCoupon) msg += `🎟 Cupom ${appliedCoupon.code} (-${appliedCoupon.discount}%): -${formatBRL(discountAmount)}\n`;
    msg += `🚚 Frete: ${formatBRL(shippingFee)}\n`;
    msg += `\n💰 *Total Geral: ${formatBRL(total)}*`;
    if (pixCode) msg += `\n\nVou pagar via Pix e envio o comprovante aqui.`;

    const whatsappUrl = whatsappLink(store.whatsapp, msg);

    // Abre o WhatsApp de forma síncrona ao clique (senão o navegador bloqueia o pop-up)
    if (store.whatsapp) window.open(whatsappUrl, '_blank', 'noopener');

    writeStorage('stck_customer', { name: clientName.trim(), phone: clientPhone.trim(), address: clientAddress.trim() });

    setPlacingOrder(true);
    const { error } = await supabase.from('orders').insert([
      {
        id: orderId,
        tenant_id: tenantId,
        customer: clientName.trim(),
        whatsapp: clientPhone.trim(),
        address: clientAddress.trim(),
        payment: paymentMethod,
        total,
        shipping: shippingFee,
        discount: discountAmount,
        coupon: appliedCoupon?.code ?? null,
        items,
        status: 'Aguardando Pagamento',
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    setPlacingOrder(false);
    if (error) console.error('[Storefront] Falha ao registrar pedido:', error.message);

    setPlacedOrder({ id: orderId, total, payment: paymentMethod, whatsappUrl, pixCode });
    setCart([]);
    setAppliedCoupon(null);
  };

  const handleCopyPix = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    } catch {
      prompt('Copie o código Pix:', code);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingCodeInput.trim().toUpperCase();
    if (!code) return;

    setTrackingLoading(true);
    const { data, error } = await supabase.rpc('track_order', { p_tenant_id: tenantId, p_code: code });
    setTrackingLoading(false);
    if (error) console.error('[Storefront] Falha no rastreio:', error.message);
    const found = Array.isArray(data) ? data[0] : data;
    setTrackedOrderResult(found ? { ...found, total: Number(found.total) } : null);
    setTrackingSearched(true);
  };

  const closePanel = () => {
    setPanel(null);
    setPlacedOrder(null);
    setCheckoutError('');
    setCheckoutStep('cart');
  };

  const activeProduct = activeProductId ? productById.get(activeProductId) : undefined;
  const activeRating = activeProduct ? ratings.get(activeProduct.id) : undefined;
  const activeReviews = activeProduct ? reviews.filter((r) => r.product_id === activeProduct.id) : [];
  const relatedProducts = activeProduct
    ? products.filter((p) => p.id !== activeProduct.id && (p.category || 'Geral') === (activeProduct.category || 'Geral') && p.stock > 0).slice(0, 4)
    : [];

  // ---------------------------------------------------------------------------
  // Estados especiais
  // ---------------------------------------------------------------------------
  if (loadingStore) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-16 border-b border-black/[0.06]" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
          <div className="h-48 rounded-3xl bg-black/[0.05]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-black/[0.05]" />)}
          </div>
        </div>
      </div>
    );
  }

  if (storeNotFound || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6 bg-canvas">
        <StoreIcon className="w-10 h-10 text-ink-soft" />
        <h1 className="text-2xl font-semibold">Loja não encontrada</h1>
        <p className="text-ink-muted">Verifique se o link da vitrine está correto.</p>
        <a href="#/" className="mt-4 text-sm font-semibold text-brand-700 hover:underline">Conheça a STCK Company</a>
      </div>
    );
  }

  if ((store.subscription_status || 'active') !== 'active') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6 bg-canvas">
        <h1 className="text-2xl font-semibold">{store.name}</h1>
        <p className="text-ink-muted">Esta loja está temporariamente indisponível. Volte em breve!</p>
      </div>
    );
  }

  const color = safeColor(store.color);
  const initial = store.name.trim().charAt(0).toUpperCase() || 'L';
  const contactLink = store.whatsapp ? whatsappLink(store.whatsapp, `Olá! Vim pela vitrine da ${store.name} e tenho uma dúvida.`) : null;

  return (
    <div style={brandVars(color)} className="min-h-screen bg-white text-ink selection:bg-[var(--store-soft)]">
      {/* Faixa de avisos */}
      <div className="bg-[var(--store)] text-[var(--store-ink)] text-[12px] font-medium">
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-center gap-5 overflow-x-auto scrollbar-none whitespace-nowrap">
          <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Pedido direto pelo WhatsApp</span>
          <span className="hidden sm:flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Pix na hora</span>
          <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Entrega a partir de {formatBRL(Math.min(shippingLocal, shippingFar))}</span>
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <a href={`#/loja/${tenantId}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 min-w-0 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-[var(--store)] text-[var(--store-ink)] font-display font-semibold flex items-center justify-center">{initial}</span>
            <span className="font-display font-semibold text-lg truncate max-w-[140px] sm:max-w-[220px]">{store.name}</span>
          </a>
          <div className="relative flex-1 hidden md:block max-w-md mx-auto">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar produtos" className={cx(fieldClass, 'pl-10 bg-black/[0.03] border-transparent')} />
          </div>
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <IconButton label="Rastrear pedido" onClick={() => setPanel('tracking')}><Truck className="w-5 h-5" /></IconButton>
            <IconButton label="Favoritos" onClick={() => setPanel('favorites')} badge={favorites.length}><Heart className="w-5 h-5" /></IconButton>
            <IconButton label="Carrinho" onClick={() => { setCheckoutStep('cart'); setPanel('cart'); }} badge={cartCount} pulse={cartPulse}><ShoppingBag className="w-5 h-5" /></IconButton>
          </div>
        </div>
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar produtos" className={cx(fieldClass, 'pl-10 h-10 bg-black/[0.03] border-transparent')} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-5">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--store)] text-[var(--store-ink)] px-6 py-10 sm:px-12 sm:py-14">
          <div aria-hidden className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/15 blur-2xl" />
          <div aria-hidden className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-black/10 blur-2xl" />
          <div className="relative max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">Bem-vindo(a) à</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold text-balance">{store.name}</h1>
            <p className="mt-3 text-[15px] opacity-85 leading-relaxed">{store.about || 'Confira nossos produtos e faça seu pedido pelo WhatsApp.'}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#produtos" onClick={(e) => { e.preventDefault(); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex h-11 px-5 items-center gap-2 rounded-xl bg-white text-ink font-semibold text-sm hover:bg-white/90">
                Ver produtos <ArrowRight className="w-4 h-4" />
              </a>
              {contactLink && (
                <a href={contactLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 px-5 items-center gap-2 rounded-xl bg-black/15 hover:bg-black/20 font-semibold text-sm">
                  <MessageCircle className="w-4 h-4" /> Falar com a loja
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
          {[
            { icon: MessageCircle, title: 'Atendimento', text: 'via WhatsApp' },
            { icon: CreditCard, title: 'Pagamento', text: 'Pix, cartão ou dinheiro' },
            { icon: Truck, title: 'Entrega', text: `a partir de ${formatBRL(Math.min(shippingLocal, shippingFar))}` },
          ].map((b) => (
            <div key={b.title} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left rounded-2xl bg-black/[0.03] px-3 py-3 sm:px-4">
              <span className="w-9 h-9 rounded-xl bg-[var(--store-soft)] text-[var(--store)] flex items-center justify-center shrink-0"><b.icon className="w-4 h-4" /></span>
              <span className="leading-tight"><span className="block text-[13px] font-semibold">{b.title}</span><span className="text-[11.5px] text-ink-muted">{b.text}</span></span>
            </div>
          ))}
        </div>
      </section>

      {/* Filtros */}
      <section id="produtos" className="max-w-6xl mx-auto px-4 pt-10 scroll-mt-28">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Produtos</h2>
            <p className="text-sm text-ink-muted">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'itens'}{searchQuery && ` para "${searchQuery}"`}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <SlidersHorizontal className="w-4 h-4" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-transparent font-medium text-ink focus:outline-none cursor-pointer">
              <option value="recent">Novidades</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="rating">Mais bem avaliados</option>
            </select>
          </label>
        </div>
        {categories.length > 2 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cx(
                  'h-9 px-4 rounded-full text-sm font-medium shrink-0 transition border',
                  selectedCategory === cat ? 'bg-[var(--store)] text-[var(--store-ink)] border-transparent' : 'bg-white border-black/10 text-ink-muted hover:text-ink hover:border-black/20',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Grade de produtos */}
      <section className="max-w-6xl mx-auto px-4 pt-5 pb-20">
        {visibleProducts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-black/[0.02] border border-dashed border-black/10">
            <Package className="w-10 h-10 mx-auto text-ink-soft" />
            <p className="mt-3 font-semibold">{products.length === 0 ? 'Em breve, novidades por aqui!' : 'Nenhum produto encontrado'}</p>
            <p className="text-sm text-ink-muted mt-1">{products.length === 0 ? 'A loja ainda está cadastrando os produtos.' : 'Tente outra busca ou categoria.'}</p>
            {(searchQuery || selectedCategory !== 'Todos') && (
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }} className="mt-4 text-sm font-semibold text-[var(--store)] hover:underline">Limpar filtros</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rating={ratings.get(product.id)}
                isFavorite={favorites.includes(product.id)}
                onOpen={() => openProduct(product)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Rodapé */}
      <footer className="border-t border-black/[0.06] bg-black/[0.015]">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[var(--store)] text-[var(--store-ink)] font-display font-semibold flex items-center justify-center">{initial}</span>
              <span className="font-display font-semibold text-lg">{store.name}</span>
            </div>
            <p className="mt-3 text-ink-muted leading-relaxed">{store.about}</p>
          </div>
          <div>
            <p className="font-semibold">Atendimento</p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              {contactLink && <li><a href={contactLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Falar no WhatsApp</a></li>}
              <li><button onClick={() => setPanel('tracking')} className="hover:text-ink flex items-center gap-2"><Truck className="w-4 h-4" /> Rastrear pedido</button></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Entrega</p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Centro / local: {formatBRL(shippingLocal)}</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Bairros distantes: {formatBRL(shippingFar)}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/[0.06] py-5 text-center text-xs text-ink-soft">
          © {new Date().getFullYear()} {store.name} · Loja criada com <a href="#/" className="font-semibold text-ink-muted hover:text-ink">STCK Company</a>
        </div>
      </footer>

      {/* Botão flutuante do WhatsApp */}
      {contactLink && (
        <a href={contactLink} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" className="fixed bottom-5 right-5 z-20 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lift flex items-center justify-center hover:scale-105 transition">
          <MessageCircle className="w-6 h-6" />
        </a>
      )}

      {/* Barra do carrinho no celular */}
      {cartCount > 0 && !panel && !activeProduct && (
        <button
          onClick={() => { setCheckoutStep('cart'); setPanel('cart'); }}
          className={cx(storeButton, 'fixed bottom-5 left-5 right-24 z-20 h-14 shadow-lift justify-between px-5 sm:hidden')}
        >
          <span className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> {cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
          <span>{formatBRL(subtotal)}</span>
        </button>
      )}

      {/* ===================== PRODUTO ===================== */}
      {activeProduct && (
        <Modal onClose={() => setActiveProductId(null)} size="lg">
          <div className="-mx-5 -mt-5 sm:mx-0 sm:mt-0 grid sm:grid-cols-2 gap-6">
            <div className="relative">
              <ProductImage product={activeProduct} className="w-full aspect-square sm:rounded-2xl" />
              <button onClick={() => setActiveProductId(null)} className="absolute top-3 left-3 sm:hidden w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow" aria-label="Fechar"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-5 sm:px-0 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{activeProduct.category || 'Geral'}</span>
                <button onClick={() => setActiveProductId(null)} className="hidden sm:block p-1 -m-1 text-ink-muted hover:text-ink" aria-label="Fechar"><X className="w-5 h-5" /></button>
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-semibold">{activeProduct.name}</h2>
              {activeRating && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Stars rating={activeRating.average} />
                  <span className="text-ink-muted">{activeRating.average.toFixed(1)} · {activeRating.count} {activeRating.count === 1 ? 'avaliação' : 'avaliações'}</span>
                </div>
              )}
              <p className="mt-4 font-display text-3xl font-semibold">{formatBRL(activeProduct.price)}</p>
              {activeProduct.description && <p className="mt-4 text-sm text-ink-muted leading-relaxed whitespace-pre-line">{activeProduct.description}</p>}
              <p className={cx('mt-4 text-sm font-medium flex items-center gap-1.5', activeProduct.stock <= 0 ? 'text-red-600' : activeProduct.stock <= 3 ? 'text-amber-600' : 'text-emerald-600')}>
                {activeProduct.stock <= 0 ? 'Esgotado no momento' : activeProduct.stock <= 3 ? `Últimas ${activeProduct.stock} unidades` : <><Check className="w-4 h-4" /> Em estoque</>}
              </p>
              <div className="mt-auto pt-6 flex gap-3">
                {activeProduct.stock > 0 && <QuantityStepper value={modalQuantity} max={activeProduct.stock} onChange={(v) => setModalQuantity(Math.max(1, v))} />}
                <button onClick={() => addToCart(activeProduct, modalQuantity)} disabled={activeProduct.stock <= 0} className={cx(storeButton, 'flex-1 h-10 text-sm whitespace-nowrap')}>
                  <ShoppingBag className="w-4 h-4" /> {activeProduct.stock <= 0 ? 'Esgotado' : 'Adicionar'}
                </button>
                <button onClick={() => toggleFavorite(activeProduct.id)} className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center shrink-0" aria-label="Favoritar">
                  <Heart className={cx('w-4 h-4', favorites.includes(activeProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-ink-muted')} />
                </button>
              </div>
            </div>
          </div>

          {/* Avaliações */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">Avaliações de clientes</h3>
              <div className="mt-3 space-y-3 max-h-64 overflow-y-auto pr-1">
                {activeReviews.length === 0 ? (
                  <p className="text-sm text-ink-muted">Ainda sem avaliações. Seja o primeiro!</p>
                ) : (
                  activeReviews.map((rev) => (
                    <div key={rev.id} className="rounded-xl bg-black/[0.025] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{rev.name}</span>
                        <Stars rating={rev.rating} size="w-3 h-3" />
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Deixe sua avaliação</h3>
              {reviewSent ? (
                <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3.5 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Obrigado pela sua avaliação!</p>
              ) : (
                <form onSubmit={(e) => handleAddReview(e, activeProduct.id)} className="mt-3 space-y-3">
                  <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setReviewRating(n)} aria-label={`${n} estrelas`} className="p-0.5">
                        <Star className={cx('w-6 h-6', n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-black/15')} />
                      </button>
                    ))}
                  </div>
                  <input placeholder="Seu nome" maxLength={60} value={reviewName} onChange={(e) => setReviewName(e.target.value)} className={fieldClass} required />
                  <textarea placeholder="O que você achou do produto?" maxLength={500} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className={cx(fieldClass, 'h-20 py-2.5 resize-none')} required />
                  <button type="submit" disabled={reviewSending} className="h-10 px-4 rounded-xl bg-ink text-white text-sm font-semibold disabled:opacity-50">{reviewSending ? 'Enviando...' : 'Enviar avaliação'}</button>
                </form>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-black/[0.06]">
              <h3 className="font-semibold mb-3">Você também pode gostar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((p) => (
                  <button key={p.id} onClick={() => openProduct(p)} className="text-left group">
                    <ProductImage product={p} className="w-full aspect-square rounded-xl group-hover:opacity-90" />
                    <p className="mt-2 text-sm truncate">{p.name}</p>
                    <p className="text-sm font-semibold">{formatBRL(p.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ===================== CARRINHO / CHECKOUT ===================== */}
      {panel === 'cart' && (
        <Drawer
          onClose={closePanel}
          title={
            placedOrder ? 'Pedido enviado' : checkoutStep === 'details' ? (
              <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 hover:opacity-70"><ArrowLeft className="w-5 h-5" /> Entrega e pagamento</button>
            ) : <>Seu carrinho {cartCount > 0 && <span className="text-sm font-normal text-ink-muted">({cartCount})</span>}</>
          }
          footer={
            !placedOrder && cartLines.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1.5 text-sm">
                  <Row label="Subtotal" value={formatBRL(subtotal)} />
                  {appliedCoupon && <Row label={`Cupom ${appliedCoupon.code}`} value={`-${formatBRL(discountAmount)}`} className="text-emerald-700" />}
                  {checkoutStep === 'details' && <Row label="Frete" value={formatBRL(shippingFee)} />}
                  <Row label={checkoutStep === 'details' ? 'Total' : 'Total (sem frete)'} value={formatBRL(checkoutStep === 'details' ? total : subtotal - discountAmount)} className="text-base font-semibold pt-1.5 border-t border-black/[0.06]" />
                </div>
                {checkoutError && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{checkoutError}</p>}
                {checkoutStep === 'cart' ? (
                  <button onClick={() => setCheckoutStep('details')} className={cx(storeButton, 'w-full h-12')}>Continuar <ArrowRight className="w-4 h-4" /></button>
                ) : (
                  <button type="submit" form="checkout-form" disabled={placingOrder} className={cx(storeButton, 'w-full h-12')}>
                    <MessageCircle className="w-4 h-4" /> {placingOrder ? 'Enviando...' : 'Finalizar pelo WhatsApp'}
                  </button>
                )}
                {!store.whatsapp && checkoutStep === 'details' && <p className="text-xs text-ink-muted text-center">A loja entrará em contato para confirmar seu pedido.</p>}
              </div>
            ) : undefined
          }
        >
          {placedOrder ? (
            <div className="text-center">
              <span className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-7 h-7" /></span>
              <h3 className="mt-4 font-display text-xl font-semibold">Pedido recebido!</h3>
              <p className="mt-1 text-sm text-ink-muted">Guarde o código para acompanhar o status:</p>
              <p className="mt-2 inline-block font-mono font-semibold text-lg px-3 py-1 rounded-lg bg-black/[0.04] select-all">{placedOrder.id}</p>

              {placedOrder.pixCode && (
                <div className="mt-6 text-left rounded-2xl border border-black/[0.08] p-4">
                  <p className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-600" /> Pague {formatBRL(placedOrder.total)} com Pix</p>
                  <p className="mt-1 text-sm text-ink-muted">Copie o código e cole em "Pix Copia e Cola" no app do seu banco. Depois envie o comprovante no WhatsApp.</p>
                  <div className="mt-3 rounded-xl bg-black/[0.03] p-3 break-all font-mono text-[11px] text-ink-muted max-h-24 overflow-y-auto">{placedOrder.pixCode}</div>
                  <button onClick={() => handleCopyPix(placedOrder.pixCode!)} className="mt-3 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2">
                    {pixCopied ? <><Check className="w-4 h-4" /> Código copiado!</> : <><Copy className="w-4 h-4" /> Copiar código Pix</>}
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-2">
                {store.whatsapp && (
                  <a href={placedOrder.whatsappUrl} target="_blank" rel="noopener noreferrer" className={cx(storeButton, 'w-full h-11 text-sm')}>
                    <MessageCircle className="w-4 h-4" /> Abrir conversa no WhatsApp
                  </a>
                )}
                <button onClick={closePanel} className="w-full h-11 rounded-xl border border-black/10 text-sm font-semibold">Continuar comprando</button>
              </div>
            </div>
          ) : cartLines.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-10 h-10 mx-auto text-ink-soft" />
              <p className="mt-3 font-semibold">Seu carrinho está vazio</p>
              <p className="text-sm text-ink-muted">Que tal dar uma olhada nos produtos?</p>
              <button onClick={closePanel} className={cx(storeButton, 'mt-5 h-11 px-5 text-sm')}>Ver produtos</button>
            </div>
          ) : checkoutStep === 'cart' ? (
            <div className="space-y-5">
              <ul className="divide-y divide-black/[0.06]">
                {cartLines.map((line) => (
                  <li key={line.productId} className="flex gap-3 py-3 first:pt-0">
                    <ProductImage product={line.product} className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-2">{line.product.name}</p>
                        <button onClick={() => setLineQuantity(line.productId, 0)} className="text-ink-soft hover:text-red-600 shrink-0" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <QuantityStepper size="sm" value={line.quantity} max={line.product.stock} onChange={(v) => setLineQuantity(line.productId, v)} />
                        <span className="font-semibold text-sm">{formatBRL(line.product.price * line.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {coupons.length > 0 && (
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 text-emerald-800 px-3.5 py-3 text-sm">
                      <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> <b>{appliedCoupon.code}</b> −{appliedCoupon.discount}%</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-emerald-700 hover:underline text-xs font-semibold">Remover</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        placeholder="Cupom de desconto"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                        className={cx(fieldClass, 'uppercase')}
                      />
                      <button onClick={handleApplyCoupon} className="h-11 px-4 rounded-xl bg-ink text-white text-sm font-semibold shrink-0">Aplicar</button>
                    </div>
                  )}
                  {couponError && <p className="mt-1.5 text-xs text-red-600">{couponError}</p>}
                </div>
              )}
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold">Seus dados</p>
                <input autoComplete="name" placeholder="Nome completo" value={clientName} onChange={(e) => setClientName(e.target.value)} className={fieldClass} required />
                <input type="tel" autoComplete="tel" placeholder="WhatsApp com DDD" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={fieldClass} required />
                <input autoComplete="street-address" placeholder="Endereço completo e bairro" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={fieldClass} required />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Região de entrega</p>
                {([
                  { id: 'local', label: 'Centro / local', fee: shippingLocal },
                  { id: 'far', label: 'Bairros distantes', fee: shippingFar },
                ] as const).map((reg) => (
                  <OptionCard key={reg.id} selected={shippingRegion === reg.id} onClick={() => setShippingRegion(reg.id)} icon={<MapPin className="w-4 h-4" />} title={reg.label} aside={formatBRL(reg.fee)} />
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Pagamento</p>
                {PAYMENT_METHODS.map((m) => (
                  <OptionCard key={m.id} selected={paymentMethod === m.id} onClick={() => setPaymentMethod(m.id)} icon={m.id === 'Pix' ? <Zap className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />} title={m.label} aside={m.hint} />
                ))}
              </div>
            </form>
          )}
        </Drawer>
      )}

      {/* ===================== FAVORITOS ===================== */}
      {panel === 'favorites' && (
        <Drawer onClose={closePanel} title="Favoritos">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-10 h-10 mx-auto text-ink-soft" />
              <p className="mt-3 font-semibold">Nenhum favorito ainda</p>
              <p className="text-sm text-ink-muted">Toque no coração dos produtos para salvar aqui.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {products.filter((p) => favorites.includes(p.id)).map((p) => (
                <li key={p.id} className="flex gap-3 py-3 first:pt-0">
                  <button onClick={() => { closePanel(); openProduct(p); }} className="shrink-0"><ProductImage product={p} className="w-20 h-20 rounded-xl" /></button>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                      <button onClick={() => toggleFavorite(p.id)} className="text-ink-soft hover:text-red-600 shrink-0" aria-label="Remover dos favoritos"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-semibold text-sm">{formatBRL(p.price)}</span>
                      <button onClick={() => addToCart(p, 1, false)} disabled={p.stock <= 0} className={cx(storeButton, 'h-8 px-3 text-xs')}>{p.stock <= 0 ? 'Esgotado' : 'Adicionar'}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Drawer>
      )}

      {/* ===================== RASTREIO ===================== */}
      {panel === 'tracking' && (
        <Modal title="Rastrear pedido" onClose={closePanel}>
          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <input placeholder="Código do pedido (ex: PED-AB12CD34)" value={trackingCodeInput} onChange={(e) => setTrackingCodeInput(e.target.value)} className={cx(fieldClass, 'uppercase')} required autoFocus />
            <button type="submit" disabled={trackingLoading} className={cx(storeButton, 'h-11 px-5 text-sm shrink-0')}>{trackingLoading ? '...' : 'Buscar'}</button>
          </form>
          {trackingSearched && (
            trackedOrderResult ? (
              <div className="mt-5 rounded-2xl border border-black/[0.08] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-semibold">{trackedOrderResult.id}</span>
                  <span className="text-sm text-ink-muted">{formatDate(trackedOrderResult.date)}</span>
                </div>
                <OrderProgress status={trackedOrderResult.status} />
                <p className="mt-4 text-sm text-ink-muted">Total: <b className="text-ink">{formatBRL(trackedOrderResult.total)}</b></p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-red-700 bg-red-50 rounded-xl p-3.5">Nenhum pedido encontrado com este código nesta loja.</p>
            )
          )}
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------
function IconButton({ label, onClick, badge = 0, pulse, children }: { label: string; onClick: () => void; badge?: number; pulse?: number; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-ink hover:bg-black/[0.04]">
      {children}
      {badge > 0 && (
        <span key={pulse} className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--store)] text-[var(--store-ink)] text-[10px] font-bold flex items-center justify-center animate-pop">
          {badge}
        </span>
      )}
    </button>
  );
}

function ProductCard({ product, rating, isFavorite, onOpen, onToggleFavorite, onAdd }: {
  product: Product;
  rating?: Rating;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onAdd: () => void;
}) {
  const soldOut = product.stock <= 0;
  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl">
        <button onClick={onOpen} className="block w-full" aria-label={`Ver ${product.name}`}>
          <ProductImage product={product} className={cx('w-full aspect-[4/5] transition duration-500 group-hover:scale-[1.03]', soldOut && 'opacity-50 grayscale')} />
        </button>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition"
        >
          <Heart className={cx('w-4 h-4', isFavorite ? 'fill-rose-500 text-rose-500' : 'text-ink')} />
        </button>
        {soldOut ? (
          <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-ink text-white text-[10px] font-bold uppercase tracking-wide">Esgotado</span>
        ) : product.stock <= 3 ? (
          <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-white/90 text-amber-700 text-[10px] font-bold uppercase tracking-wide">Últimas unidades</span>
        ) : null}
        {!soldOut && (
          <button
            onClick={onAdd}
            className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[var(--store)] text-[var(--store-ink)] flex items-center justify-center shadow-lg sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
      <button onClick={onOpen} className="mt-3 text-left">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{product.category || 'Geral'}</p>
        <h3 className="mt-0.5 text-sm font-medium line-clamp-2">{product.name}</h3>
        {rating && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating.average.toFixed(1)} <span className="text-ink-soft">({rating.count})</span>
          </p>
        )}
        <p className="mt-1.5 font-semibold">{formatBRL(product.price)}</p>
      </button>
    </article>
  );
}

function OptionCard({ selected, onClick, icon, title, aside }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; aside: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx('w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition', selected ? 'border-[var(--store)] bg-[var(--store-soft)] ring-1 ring-[var(--store)]' : 'border-black/10 hover:border-black/20')}
    >
      <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center', selected ? 'bg-[var(--store)] text-[var(--store-ink)]' : 'bg-black/[0.04] text-ink-muted')}>{icon}</span>
      <span className="flex-1 text-sm font-medium">{title}</span>
      <span className="text-sm text-ink-muted">{aside}</span>
    </button>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cx('flex justify-between', className)}>
      <span className={className ? undefined : 'text-ink-muted'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const PROGRESS_STEPS = [
  { key: 'Aguardando Pagamento', label: 'Recebido', icon: Clock },
  { key: 'Pago / Separando', label: 'Pago', icon: CreditCard },
  { key: 'Enviado / A Caminho', label: 'A caminho', icon: Truck },
  { key: 'Entregue com Sucesso', label: 'Entregue', icon: CheckCircle2 },
];

function OrderProgress({ status }: { status: string }) {
  if (status === 'Cancelado') {
    return <p className="mt-4 text-sm font-semibold text-red-700 bg-red-50 rounded-xl px-3 py-2">Pedido cancelado</p>;
  }
  const current = Math.max(0, PROGRESS_STEPS.findIndex((s) => s.key === status));
  return (
    <ol className="mt-5 grid grid-cols-4 gap-1">
      {PROGRESS_STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s.key} className="flex flex-col items-center text-center gap-1.5">
            <span className={cx('w-full h-1 rounded-full', done ? 'bg-[var(--store)]' : 'bg-black/10')} />
            <s.icon className={cx('w-4 h-4 mt-1', done ? 'text-[var(--store)]' : 'text-ink-soft')} />
            <span className={cx('text-[11px]', i === current ? 'font-semibold text-ink' : 'text-ink-muted')}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
