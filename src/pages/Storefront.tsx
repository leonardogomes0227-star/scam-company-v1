import { Fragment, useState, useEffect, useMemo, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Copy, CreditCard, Heart, MapPin, MessageCircle, Minus, Package, Plus,
  Search, Share2, ShoppingBag, SlidersHorizontal, Star, Store as StoreIcon, Tag, Trash2, Truck, X, Zap,
  Facebook, Globe, Instagram, Lock, Music2, Youtube, ChevronDown,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { discountPercent, formatBRL, formatDate, generateId, generateOrderCode, normalizeWhatsapp, parseVariants, whatsappLink } from '../lib/format';
import { formatCep, lookupCep, UFS } from '../lib/cep';
import { deliveryOptions, PAYMENT_HINTS, shippingConfig, type DeliveryId } from '../lib/shipping';
import { buildPixPayload } from '../lib/pix';
import { safeColor } from '../lib/color';
import { ensureFont, hoursSummary, normalizeCustom, openStatus, socialLinks, themeStyle, type SectionId, type StoreCustom } from '../lib/custom';
import { AnnouncementBar, BenefitsRow, StoreHero, StoreLogo, defaultBenefits } from '../components/StoreParts';
import { Drawer, Modal, cx } from '../components/ui';
import type { Coupon, OrderItem, Product, Review, Tenant } from '../types';


type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'rating';

interface CartLine {
  productId: string;
  quantity: number;
  variant?: string;
}

interface SavedCustomer {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

const EMPTY_CUSTOMER: SavedCustomer = { name: '', phone: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: '' };

const lineKey = (l: { productId: string; variant?: string }) => `${l.productId}|${l.variant ?? ''}`;

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
  freightPending: boolean;
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
export default function Storefront({ tenantId, initialProductId }: { tenantId: string; initialProductId?: string }) {
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

  const [customer, setCustomer] = useState<SavedCustomer>(() => ({ ...EMPTY_CUSTOMER, ...readStorage<Partial<SavedCustomer>>('stck_customer', {}) }));
  const setField = (field: keyof SavedCustomer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setCustomer((c) => ({ ...c, [field]: e.target.value }));
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error' | 'notfound'>('idle');
  const [manualCity, setManualCity] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('Pix');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [variantError, setVariantError] = useState(false);
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

  const custom = useMemo(() => normalizeCustom(store?.custom), [store]);
  useEffect(() => ensureFont(custom.font), [custom.font]);

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
  const qtyInCart = (productId: string, exceptKey?: string) =>
    cart.filter((l) => l.productId === productId && lineKey(l) !== exceptKey).reduce((a, l) => a + l.quantity, 0);
  const cartCount = cartLines.reduce((acc, l) => acc + l.quantity, 0);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  const addToCart = (product: Product, quantity = 1, openCart = true, variant?: string) => {
    if (product.stock <= 0) return;
    // Produto com tamanho/cor: abre a página do produto para escolher
    if (parseVariants(product.variants).length > 0 && !variant) {
      openProduct(product);
      return;
    }
    const available = product.stock - qtyInCart(product.id);
    if (available <= 0) {
      setPanel('cart');
      return;
    }
    const key = lineKey({ productId: product.id, variant });
    setCart((prev) => {
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) return prev.map((l) => (lineKey(l) === key ? { ...l, quantity: l.quantity + Math.min(quantity, available) } : l));
      return [...prev, { productId: product.id, variant, quantity: Math.min(quantity, available) }];
    });
    setCartPulse((n) => n + 1);
    setActiveProductId(null);
    if (openCart) {
      setCheckoutStep('cart');
      setPlacedOrder(null);
      setPanel('cart');
    }
  };

  const setLineQuantity = (key: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (lineKey(l) !== key) return l;
          const product = productById.get(l.productId);
          const max = product ? product.stock - qtyInCart(l.productId, key) : quantity;
          return { ...l, quantity: Math.min(quantity, max) };
        })
        .filter((l) => l.quantity > 0),
    );
  };

  // Link direto para produto: #/loja/<loja>/p/<produto>
  useEffect(() => {
    if (!loadingStore && initialProductId && products.some((p) => p.id === initialProductId)) {
      setActiveProductId(initialProductId);
      setModalQuantity(1);
    }
  }, [initialProductId, loadingStore, products]);

  useEffect(() => {
    if (loadingStore) return;
    const target = `#/loja/${encodeURIComponent(tenantId)}${activeProductId ? `/p/${encodeURIComponent(activeProductId)}` : ''}`;
    if (window.location.hash !== target) window.history.replaceState(null, '', target);
  }, [activeProductId, tenantId, loadingStore]);

  const productUrl = (productId: string) =>
    `${window.location.origin}${window.location.pathname}#/loja/${encodeURIComponent(tenantId)}/p/${encodeURIComponent(productId)}`;

  const [linkCopied, setLinkCopied] = useState(false);
  const shareProduct = async (product: Product) => {
    const url = productUrl(product.id);
    const text = `${product.name} por ${formatBRL(product.price)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
        return;
      } catch {
        /* usuário cancelou ou não suportado: copia o link */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      prompt('Copie o link do produto:', url);
    }
  };

  function openProduct(product: Product) {
    setActiveProductId(product.id);
    setModalQuantity(1);
    setSelectedVariant('');
    setVariantError(false);
    setReviewSent(false);
  }

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

  const shipCfg = shippingConfig(store);
  const subtotal = cartLines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount) / 100 : 0;
  const options = deliveryOptions(shipCfg, customer.city, customer.state, subtotal - discountAmount, customer.district);
  const selectedDelivery = options.find((o) => o.id === delivery) ?? null;
  const freightPending = selectedDelivery?.fee === null;
  const shippingFee = selectedDelivery?.fee ?? 0;
  const payEnabled: Record<string, boolean> = { Pix: custom.payments.pix, Cartão: custom.payments.card, Dinheiro: custom.payments.cash };
  const enabledPayments = (selectedDelivery?.payments ?? ['Pix', 'Cartão', 'Dinheiro']).filter((m) => payEnabled[m]);
  const allowedPayments = enabledPayments.length > 0 ? enabledPayments : ['Pix'];
  const pixDiscountAmount = paymentMethod === 'Pix' && selectedDelivery && custom.payments.pixDiscount > 0 ? Math.round((subtotal - discountAmount) * custom.payments.pixDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount - pixDiscountAmount) + shippingFee;
  const hoursNow = openStatus(custom.hours);
  const blockReason = custom.paused ? custom.pausedMessage : hoursNow && !hoursNow.open && !custom.hours.acceptOutside ? `Estamos fechados no momento. ${hoursNow.label.replace('Fechado · ', '')}.` : null;
  const minOrderGap = custom.delivery.minOrder > 0 ? custom.delivery.minOrder - (subtotal - discountAmount) : 0;
  // Frete grátis só vale para fretes com valor definido (não para "a combinar")
  const freeShippingApplies = selectedDelivery ? selectedDelivery.id !== 'pickup' && !freightPending : options.some((o) => o.id === 'local' || o.id === 'far' || (o.id === 'national' && shipCfg.shippingNational != null));
  const freeShippingGap = shipCfg.freeShippingMin && shipCfg.freeShippingMin > 0 && freeShippingApplies ? shipCfg.freeShippingMin - (subtotal - discountAmount) : null;

  // Se a opção escolhida deixar de existir (ex.: mudou o CEP), limpa a escolha
  const optionIds = options.map((o) => o.id).join(',');
  const allowedKey = allowedPayments.join(',');
  useEffect(() => {
    if (delivery && !optionIds.split(',').includes(delivery)) setDelivery(null);
    const allowed = allowedKey.split(',');
    if (!allowed.includes(paymentMethod)) setPaymentMethod(allowed[0]);
  }, [delivery, optionIds, allowedKey, paymentMethod]);

  const handleCepChange = async (value: string) => {
    const cep = formatCep(value);
    setCustomer((c) => ({ ...c, cep }));
    if (cep.replace(/\D/g, '').length !== 8) {
      setCepStatus('idle');
      return;
    }
    setCepStatus('loading');
    try {
      const found = await lookupCep(cep);
      if (!found) {
        setCepStatus('notfound');
        setManualCity(true);
        return;
      }
      setCustomer((c) => ({ ...c, cep: found.cep, street: found.street || c.street, district: found.district || c.district, city: found.city, state: found.state }));
      setCepStatus('idle');
    } catch {
      setCepStatus('error');
      setManualCity(true);
    }
  };

  const fullAddress = () => {
    const c = customer;
    const line1 = [c.street, c.number].filter(Boolean).join(', ');
    const parts = [line1 + (c.complement ? ` (${c.complement})` : ''), c.district, [c.city, c.state].filter(Boolean).join('/'), c.cep ? `CEP ${c.cep}` : ''];
    return parts.filter((p) => p && p.trim()).join(' - ');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    if (cartLines.length === 0 || !store) return;
    if (blockReason) return setCheckoutError(blockReason);
    if (minOrderGap > 0) return setCheckoutError(`O pedido mínimo da loja é ${formatBRL(custom.delivery.minOrder)}.`);
    if (!customer.name.trim()) return setCheckoutError('Informe seu nome.');
    if (normalizeWhatsapp(customer.phone).length < 12) return setCheckoutError('Informe um WhatsApp válido com DDD.');
    if (!selectedDelivery) return setCheckoutError('Escolha como você quer receber o pedido.');
    if (selectedDelivery.id !== 'pickup') {
      if (!customer.city.trim() || !customer.state.trim()) return setCheckoutError('Informe seu CEP (ou cidade e estado).');
      if (!customer.street.trim() || !customer.number.trim()) return setCheckoutError('Informe a rua e o número para a entrega.');
      if (selectedDelivery.id === 'national' && customer.cep.replace(/\D/g, '').length !== 8) return setCheckoutError('Para envio a outra cidade, informe o CEP.');
    }

    const orderId = generateOrderCode();
    const items: OrderItem[] = cartLines.map((l) => ({
      id: l.product.id,
      name: l.variant ? `${l.product.name} (${l.variant})` : l.product.name,
      variant: l.variant,
      price: l.product.price,
      quantity: l.quantity,
    }));
    const pixCode =
      paymentMethod === 'Pix' && store.pix_key && !freightPending
        ? buildPixPayload({ key: store.pix_key, merchantName: store.name, merchantCity: shipCfg.city || 'BRASIL', amount: total, txid: orderId.replace('-', '') })
        : null;
    const address = selectedDelivery.id === 'pickup' ? `Retirada na loja${shipCfg.pickupAddress ? `: ${shipCfg.pickupAddress}` : ''}` : fullAddress();
    const hint = paymentMethod === 'Pix' && freightPending ? 'após combinar o frete' : PAYMENT_HINTS[paymentMethod]?.[selectedDelivery.id]?.toLowerCase();
    const paymentLabel = `${paymentMethod}${hint ? ` (${hint})` : ''}`;

    let msg =
      `🛒 *NOVO PEDIDO (${orderId}) - ${store.name}*\n\n` +
      `👤 *Cliente:* ${customer.name.trim()}\n` +
      `📱 *WhatsApp:* ${customer.phone.trim()}\n` +
      `🚚 *Entrega:* ${selectedDelivery.title}\n` +
      `📍 *Endereço:* ${address}\n` +
      `💳 *Pagamento:* ${paymentLabel}\n\n` +
      `📦 *Itens:*\n`;
    items.forEach((item) => {
      msg += `- ${item.quantity}x ${item.name} (${formatBRL(item.price * item.quantity)})\n`;
    });
    msg += `\nSubtotal: ${formatBRL(subtotal)}\n`;
    if (appliedCoupon) msg += `🎟 Cupom ${appliedCoupon.code} (-${appliedCoupon.discount}%): -${formatBRL(discountAmount)}\n`;
    if (pixDiscountAmount > 0) msg += `⚡ Desconto Pix (${custom.payments.pixDiscount}%): -${formatBRL(pixDiscountAmount)}\n`;
    msg += `🚚 Frete: ${freightPending ? 'a combinar (por favor, me informe o valor)' : shippingFee === 0 ? 'grátis' : formatBRL(shippingFee)}\n`;
    msg += `\n💰 *Total${freightPending ? ' (sem frete)' : ''}: ${formatBRL(total)}*`;
    if (pixCode) msg += `\n\nVou pagar via Pix e envio o comprovante aqui.`;
    if (freightPending) msg += `\n\nAguardo o valor do frete para pagar.`;

    const whatsappUrl = whatsappLink(store.whatsapp, msg);

    // Abre o WhatsApp de forma síncrona ao clique (senão o navegador bloqueia o pop-up)
    if (store.whatsapp) window.open(whatsappUrl, '_blank', 'noopener');

    writeStorage('stck_customer', { ...customer, name: customer.name.trim(), phone: customer.phone.trim() });

    setPlacingOrder(true);
    const { error } = await supabase.from('orders').insert([
      {
        id: orderId,
        tenant_id: tenantId,
        customer: customer.name.trim(),
        whatsapp: customer.phone.trim(),
        address: `[${selectedDelivery.title}] ${address}`,
        payment: paymentLabel,
        total,
        shipping: shippingFee,
        discount: discountAmount + pixDiscountAmount,
        coupon: appliedCoupon?.code ?? null,
        items,
        status: 'Aguardando Pagamento',
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    setPlacingOrder(false);
    if (error) console.error('[Storefront] Falha ao registrar pedido:', error.message);

    setPlacedOrder({ id: orderId, total, payment: paymentMethod, whatsappUrl, pixCode, freightPending });
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
  const contactLink = store.whatsapp ? whatsappLink(store.whatsapp, `Olá! Vim pela vitrine da ${store.name} e tenho uma dúvida.`) : null;

  const gridCols = {
    mobile: { 1: 'grid-cols-1', 2: 'grid-cols-2' }[custom.layout.mobileColumns],
    desktop: { 3: 'md:grid-cols-3', 4: 'md:grid-cols-3 lg:grid-cols-4' }[custom.layout.columns],
  };
  const featuredProducts = products.filter((p) => p.featured && p.stock > 0).slice(0, 8);
  const social = socialLinks(custom.footer);
  const hoursLines = custom.hours.enabled ? hoursSummary(custom.hours) : [];
  const goProducts = () => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });

  const renderCard = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      layout={custom.layout}
      rating={ratings.get(product.id)}
      isFavorite={favorites.includes(product.id)}
      onOpen={() => openProduct(product)}
      onToggleFavorite={() => toggleFavorite(product.id)}
      onAdd={() => addToCart(product)}
    />
  );

  const sectionNodes: Record<SectionId, ReactNode> = {
    benefits: (
      <section className="max-w-6xl mx-auto px-4 pt-4">
        <BenefitsRow items={custom.benefits.length > 0 ? custom.benefits : defaultBenefits(shipCfg, custom)} />
      </section>
    ),
    featured: featuredProducts.length > 0 && (
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <h2 className="font-display text-2xl font-semibold flex items-center gap-2"><Star className="w-5 h-5 text-[var(--store)] fill-current" /> Em destaque</h2>
        <div className={cx('mt-4 grid gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8', gridCols.mobile, gridCols.desktop)}>{featuredProducts.map(renderCard)}</div>
      </section>
    ),
    products: (
      <>
        <section id="produtos" className="max-w-6xl mx-auto px-4 pt-10 scroll-mt-28">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">{custom.layout.productsTitle}</h2>
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
          {custom.layout.showCategories && categories.length > 2 && (
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
        <section className="max-w-6xl mx-auto px-4 pt-5 pb-14">
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
            <div className={cx('grid gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8', gridCols.mobile, gridCols.desktop)}>{visibleProducts.map(renderCard)}</div>
          )}
        </section>
      </>
    ),
    about: (custom.about.text.trim() || custom.about.image) && (
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <div className={cx('grid gap-6 items-center rounded-3xl bg-black/[0.03] p-6 sm:p-10', custom.about.image && 'md:grid-cols-2')}>
          {custom.about.image && <img src={custom.about.image} alt={custom.about.title} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-2xl" />}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">{custom.about.title}</h2>
            <p className="mt-3 text-ink-muted leading-relaxed whitespace-pre-line">{custom.about.text}</p>
          </div>
        </div>
      </section>
    ),
    faq: custom.faq.filter((f) => f.q.trim() && f.a.trim()).length > 0 && (
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <h2 className="font-display text-2xl font-semibold text-center">Perguntas frequentes</h2>
        <div className="mt-5 space-y-2">
          {custom.faq.filter((f) => f.q.trim() && f.a.trim()).map((f) => (
            <details key={f.q} className="group rounded-2xl border border-black/10 bg-white px-4 py-3">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-sm">
                {f.q} <ChevronDown className="w-4 h-4 shrink-0 text-ink-soft transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed whitespace-pre-line">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    ),
  };

  const SOCIAL_ICONS: Record<string, typeof Globe> = { instagram: Instagram, facebook: Facebook, tiktok: Music2, youtube: Youtube, site: Globe };

  return (
    <div style={themeStyle(color, custom)} className={cx('store-themed min-h-screen selection:bg-[var(--store-soft)]', custom.mode === 'dark' && 'store-dark')}>
      <AnnouncementBar custom={custom} ship={shipCfg} />

      {blockReason && (
        <div className="bg-amber-50 text-amber-800 text-sm text-center px-4 py-2.5 flex items-center justify-center gap-2"><Lock className="w-4 h-4 shrink-0" /> {blockReason}</div>
      )}

      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <a href={`#/loja/${tenantId}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="min-w-0 shrink-0">
            <StoreLogo name={store.name} custom={custom} />
          </a>
          {custom.layout.showSearch && (
            <div className="relative flex-1 hidden md:block max-w-md mx-auto">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar produtos" className={cx(fieldClass, 'pl-10 bg-black/[0.03] border-transparent')} />
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <IconButton label="Rastrear pedido" onClick={() => setPanel('tracking')}><Truck className="w-5 h-5" /></IconButton>
            <IconButton label="Favoritos" onClick={() => setPanel('favorites')} badge={favorites.length}><Heart className="w-5 h-5" /></IconButton>
            <IconButton label="Carrinho" onClick={() => { setCheckoutStep('cart'); setPanel('cart'); }} badge={cartCount} pulse={cartPulse}><ShoppingBag className="w-5 h-5" /></IconButton>
          </div>
        </div>
        {custom.layout.showSearch && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar produtos" className={cx(fieldClass, 'pl-10 h-10 bg-black/[0.03] border-transparent')} />
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-5">
        <StoreHero name={store.name} about={store.about || ''} custom={custom} contactLink={contactLink} onCta={goProducts} />
      </section>

      {custom.sections.filter((sec) => sec.enabled).map((sec) => <Fragment key={sec.id}>{sectionNodes[sec.id]}</Fragment>)}

      {/* Rodapé */}
      <footer className="border-t border-black/[0.06] bg-black/[0.015]">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <StoreLogo name={store.name} custom={custom} size="lg" />
            <p className="mt-3 text-ink-muted leading-relaxed whitespace-pre-line">{custom.footer.text || store.about}</p>
            {social.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {social.map((l) => {
                  const Icon = SOCIAL_ICONS[l.id] ?? Globe;
                  return <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className="w-9 h-9 rounded-full bg-black/[0.05] hover:bg-[var(--store)] hover:text-[var(--store-ink)] flex items-center justify-center transition"><Icon className="w-4 h-4" /></a>;
                })}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">Atendimento</p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              {contactLink && <li><a href={contactLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Falar no WhatsApp</a></li>}
              <li><button onClick={() => setPanel('tracking')} className="hover:text-ink flex items-center gap-2"><Truck className="w-4 h-4" /> Rastrear pedido</button></li>
              {custom.footer.address && <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {custom.footer.address}</li>}
              {hoursLines.map((l) => <li key={l} className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 shrink-0" /> {l}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Entrega e pagamento</p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {shipCfg.city ? `${shipCfg.city}${shipCfg.state ? `/${shipCfg.state}` : ''}` : 'Na cidade'}: {shipCfg.zones.length > 0 ? `${formatBRL(Math.min(...shipCfg.zones.map((z) => z.fee)))} a ${formatBRL(Math.max(shipCfg.shippingFar, ...shipCfg.zones.map((z) => z.fee)))}` : `${formatBRL(shipCfg.shippingLocal)} a ${formatBRL(shipCfg.shippingFar)}`}</li>
              {shipCfg.shipNationwide && <li className="flex items-start gap-2"><Truck className="w-4 h-4 mt-0.5 shrink-0" /> Outras cidades: {shipCfg.shippingNational == null ? 'frete combinado no WhatsApp' : formatBRL(shipCfg.shippingNational)}</li>}
              {shipCfg.pickupEnabled && <li className="flex items-start gap-2"><StoreIcon className="w-4 h-4 mt-0.5 shrink-0" /> Retirada grátis{shipCfg.pickupAddress ? `: ${shipCfg.pickupAddress}` : ''}</li>}
              {shipCfg.freeShippingMin ? <li className="flex items-start gap-2"><Tag className="w-4 h-4 mt-0.5 shrink-0" /> Frete grátis acima de {formatBRL(shipCfg.freeShippingMin)}</li> : null}
              {shipCfg.minOrder > 0 && <li className="flex items-start gap-2"><ShoppingBag className="w-4 h-4 mt-0.5 shrink-0" /> Pedido mínimo de {formatBRL(shipCfg.minOrder)}</li>}
              <li className="flex items-start gap-2"><CreditCard className="w-4 h-4 mt-0.5 shrink-0" /> {[custom.payments.pix && 'Pix', custom.payments.card && 'Cartão', custom.payments.cash && 'Dinheiro'].filter(Boolean).join(' · ')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/[0.06] py-5 text-center text-xs text-ink-soft">
          © {new Date().getFullYear()} {store.name}{custom.footer.showBrand && <> · Loja criada com <a href="#/" className="font-semibold text-ink-muted hover:text-ink">STCK Company</a></>}
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
              <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                <p className="font-display text-3xl font-semibold">{formatBRL(activeProduct.price)}</p>
                {discountPercent(activeProduct.price, activeProduct.compare_price) > 0 && (
                  <>
                    <span className="text-ink-soft line-through">{formatBRL(activeProduct.compare_price)}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">-{discountPercent(activeProduct.price, activeProduct.compare_price)}%</span>
                  </>
                )}
              </div>
              {store.pix_key && <p className="mt-1 text-xs text-ink-muted">Pague com Pix na hora</p>}
              {parseVariants(activeProduct.variants).length > 0 && (
                <div className="mt-5">
                  <p className={cx('text-sm font-semibold', variantError && 'text-red-600')}>{variantError ? 'Escolha uma opção:' : 'Opção:'} <span className="font-normal text-ink-muted">{selectedVariant}</span></p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parseVariants(activeProduct.variants).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => { setSelectedVariant(v); setVariantError(false); }}
                        aria-pressed={selectedVariant === v}
                        className={cx('min-w-11 h-10 px-3 rounded-xl border text-sm font-medium transition', selectedVariant === v ? 'border-[var(--store)] bg-[var(--store)] text-[var(--store-ink)]' : variantError ? 'border-red-300' : 'border-black/15 hover:border-black/40')}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeProduct.description && <p className="mt-4 text-sm text-ink-muted leading-relaxed whitespace-pre-line">{activeProduct.description}</p>}
              <p className={cx('mt-4 text-sm font-medium flex items-center gap-1.5', activeProduct.stock <= 0 ? 'text-red-600' : activeProduct.stock <= 3 ? 'text-amber-600' : 'text-emerald-600')}>
                {activeProduct.stock <= 0 ? 'Esgotado no momento' : activeProduct.stock <= 3 ? `Últimas ${activeProduct.stock} unidades` : <><Check className="w-4 h-4" /> Em estoque</>}
              </p>
              <div className="mt-auto pt-6 flex gap-3">
                {activeProduct.stock > 0 && <QuantityStepper value={modalQuantity} max={activeProduct.stock} onChange={(v) => setModalQuantity(Math.max(1, v))} />}
                <button
                  onClick={() => {
                    if (parseVariants(activeProduct.variants).length > 0 && !selectedVariant) return setVariantError(true);
                    addToCart(activeProduct, modalQuantity, true, selectedVariant || undefined);
                  }}
                  disabled={activeProduct.stock <= 0} className={cx(storeButton, 'flex-1 h-10 text-sm whitespace-nowrap')}>
                  <ShoppingBag className="w-4 h-4" /> {activeProduct.stock <= 0 ? 'Esgotado' : 'Adicionar'}
                </button>
                <button onClick={() => toggleFavorite(activeProduct.id)} className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center shrink-0" aria-label="Favoritar">
                  <Heart className={cx('w-4 h-4', favorites.includes(activeProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-ink-muted')} />
                </button>
                <button onClick={() => shareProduct(activeProduct)} className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center shrink-0 text-ink-muted" aria-label="Compartilhar produto" title="Compartilhar">
                  {linkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
              {linkCopied && <p className="mt-2 text-xs text-emerald-700">Link do produto copiado!</p>}
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
                  {checkoutStep === 'details' && pixDiscountAmount > 0 && <Row label={`Desconto Pix (${custom.payments.pixDiscount}%)`} value={`-${formatBRL(pixDiscountAmount)}`} className="text-emerald-700" />}
                  {checkoutStep === 'details' && <Row label="Frete" value={!selectedDelivery ? '—' : freightPending ? 'A combinar' : shippingFee === 0 ? 'Grátis' : formatBRL(shippingFee)} />}
                  <Row label={checkoutStep === 'details' && selectedDelivery && !freightPending ? 'Total' : 'Total (sem frete)'} value={formatBRL(checkoutStep === 'details' ? total : subtotal - discountAmount)} className="text-base font-semibold pt-1.5 border-t border-black/[0.06]" />
                </div>
                {checkoutError && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{checkoutError}</p>}
                {blockReason && <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2 flex items-start gap-2"><Lock className="w-4 h-4 mt-0.5 shrink-0" /> {blockReason}</p>}
                {!blockReason && minOrderGap > 0 && <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">Pedido mínimo de {formatBRL(custom.delivery.minOrder)}: faltam {formatBRL(minOrderGap)}.</p>}
                {checkoutStep === 'cart' ? (
                  <button key="go-details" type="button" disabled={!!blockReason || minOrderGap > 0} onClick={(e) => { e.preventDefault(); setCheckoutStep('details'); }} className={cx(storeButton, 'w-full h-12')}>Continuar <ArrowRight className="w-4 h-4" /></button>
                ) : (
                  <button key="submit-order" type="submit" form="checkout-form" disabled={placingOrder || !!blockReason || minOrderGap > 0} className={cx(storeButton, 'w-full h-12')}>
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

              {placedOrder.freightPending && (
                <div className="mt-6 text-left rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900">
                  <p className="font-semibold flex items-center gap-2"><Truck className="w-4 h-4" /> Falta só o frete</p>
                  <p className="mt-1">A loja vai calcular o envio para sua cidade e te mandar o valor final e o Pix pelo WhatsApp.</p>
                </div>
              )}

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
                  <li key={lineKey(line)} className="flex gap-3 py-3 first:pt-0">
                    <ProductImage product={line.product} className="w-20 h-20 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{line.product.name}</p>
                          {line.variant && <p className="text-xs text-ink-muted mt-0.5">Opção: {line.variant}</p>}
                        </div>
                        <button onClick={() => setLineQuantity(lineKey(line), 0)} className="text-ink-soft hover:text-red-600 shrink-0" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <QuantityStepper size="sm" value={line.quantity} max={line.product.stock - qtyInCart(line.productId, lineKey(line))} onChange={(v) => setLineQuantity(lineKey(line), v)} />
                        <span className="font-semibold text-sm">{formatBRL(line.product.price * line.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {freeShippingGap != null && (
                <div className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
                  {freeShippingGap > 0 ? <>Faltam <b>{formatBRL(freeShippingGap)}</b> para ganhar frete grátis 🎉</> : <>Você ganhou <b>frete grátis</b> na entrega! 🎉</>}
                  <div className="mt-2 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((subtotal - discountAmount) / (shipCfg.freeShippingMin || 1)) * 100)}%` }} />
                  </div>
                </div>
              )}

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
                <p className="text-sm font-semibold">1. Seus dados</p>
                <input autoComplete="name" placeholder="Nome completo" value={customer.name} onChange={setField('name')} className={fieldClass} required />
                <input type="tel" autoComplete="tel" placeholder="WhatsApp com DDD" value={customer.phone} onChange={setField('phone')} className={fieldClass} required />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">2. Onde você está?</p>
                <div className="relative">
                  <input
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="CEP"
                    value={customer.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className={cx(fieldClass, 'pr-28')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">
                    {cepStatus === 'loading' ? 'Buscando...' : customer.city && !manualCity ? `${customer.city}/${customer.state}` : ''}
                  </span>
                </div>
                {cepStatus === 'notfound' && <p className="text-xs text-amber-700">CEP não encontrado. Confira o número ou preencha cidade e estado abaixo.</p>}
                {cepStatus === 'error' && <p className="text-xs text-amber-700">Não foi possível consultar o CEP agora. Preencha cidade e estado abaixo.</p>}
                {manualCity ? (
                  <div className="grid grid-cols-[1fr_88px] gap-2">
                    <input placeholder="Cidade" autoComplete="address-level2" value={customer.city} onChange={setField('city')} className={fieldClass} />
                    <select value={customer.state} onChange={setField('state')} className={cx(fieldClass, 'px-2')} aria-label="Estado">
                      <option value="">UF</option>
                      {UFS.map((uf) => <option key={uf}>{uf}</option>)}
                    </select>
                  </div>
                ) : (
                  <button type="button" onClick={() => setManualCity(true)} className="text-xs font-medium text-ink-muted underline">Não sei meu CEP</button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">3. Como quer receber?</p>
                {options.length === 0 ? (
                  <p className="text-sm text-ink-muted bg-black/[0.03] rounded-xl p-3.5">
                    {customer.city ? 'A loja ainda não entrega na sua cidade. Fale com a loja pelo WhatsApp para combinar.' : 'Informe seu CEP para ver as opções de entrega.'}
                  </p>
                ) : (
                  options.map((o) => (
                    <OptionCard
                      key={o.id}
                      selected={delivery === o.id}
                      onClick={() => setDelivery(o.id)}
                      icon={o.id === 'pickup' ? <StoreIcon className="w-4 h-4" /> : o.id === 'national' ? <Truck className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      title={o.title}
                      description={o.description}
                      aside={o.fee === null ? 'A combinar' : o.fee === 0 ? 'Grátis' : formatBRL(o.fee)}
                    />
                  ))
                )}
                {freeShippingGap != null && freeShippingGap > 0 && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">Faltam {formatBRL(freeShippingGap)} para ganhar frete grátis 🎉</p>
                )}
              </div>

              {selectedDelivery && selectedDelivery.id !== 'pickup' && (
                <div className="space-y-3 animate-fade-up">
                  <p className="text-sm font-semibold">Endereço de entrega</p>
                  <input autoComplete="address-line1" placeholder="Rua / Avenida" value={customer.street} onChange={setField('street')} className={fieldClass} />
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <input placeholder="Número" value={customer.number} onChange={setField('number')} className={fieldClass} />
                    <input autoComplete="address-line2" placeholder="Complemento (opcional)" value={customer.complement} onChange={setField('complement')} className={fieldClass} />
                  </div>
                  <input placeholder="Bairro" list="zone-list" autoComplete="off" value={customer.district} onChange={setField('district')} className={fieldClass} />
                  {shipCfg.zones.length > 0 && <datalist id="zone-list">{shipCfg.zones.map((z) => <option key={z.name} value={z.name} />)}</datalist>}
                </div>
              )}

              {selectedDelivery && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">4. Pagamento</p>
                  {allowedPayments.map((m) => (
                    <OptionCard
                      key={m}
                      selected={paymentMethod === m}
                      onClick={() => setPaymentMethod(m)}
                      icon={m === 'Pix' ? <Zap className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      title={m}
                      description={m === 'Pix' && custom.payments.pixDiscount > 0 ? `${custom.payments.pixDiscount}% de desconto` : m === 'Cartão' ? custom.payments.cardNote || undefined : undefined}
                      aside={m === 'Pix' && freightPending ? 'Após o frete' : PAYMENT_HINTS[m]?.[selectedDelivery.id] ?? ''}
                    />
                  ))}
                  {freightPending && <p className="text-xs text-ink-muted">O frete para sua cidade é calculado pela loja. Você recebe o valor final e o Pix pelo WhatsApp.</p>}
                </div>
              )}
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

function ProductCard({ product, layout, rating, isFavorite, onOpen, onToggleFavorite, onAdd }: {
  product: Product;
  layout: StoreCustom['layout'];
  rating?: Rating;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onAdd: () => void;
}) {
  const soldOut = product.stock <= 0;
  return (
    <article className={cx('group flex flex-col', layout.cardStyle === 'boxed' && 'p-2.5 rounded-2xl border border-black/[0.08] bg-white shadow-soft')}>
      <div className="relative overflow-hidden rounded-2xl">
        <button onClick={onOpen} className="block w-full" aria-label={`Ver ${product.name}`}>
          <ProductImage product={product} className={cx('w-full transition duration-500 group-hover:scale-[1.03]', { portrait: 'aspect-[4/5]', square: 'aspect-square', tall: 'aspect-[3/4]' }[layout.aspect], soldOut && 'opacity-50 grayscale')} />
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
        ) : discountPercent(product.price, product.compare_price) > 0 ? (
          <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">-{discountPercent(product.price, product.compare_price)}%</span>
        ) : product.stock <= 3 ? (
          <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-white/90 text-amber-700 text-[10px] font-bold uppercase tracking-wide">Últimas unidades</span>
        ) : null}
        {!soldOut && layout.showQuickAdd && (
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
        {layout.showCategory && <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{product.category || 'Geral'}</p>}
        <h3 className="mt-0.5 text-sm font-medium line-clamp-2">{product.name}</h3>
        {layout.showRating && rating && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating.average.toFixed(1)} <span className="text-ink-soft">({rating.count})</span>
          </p>
        )}
        <p className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold">{formatBRL(product.price)}</span>
          {discountPercent(product.price, product.compare_price) > 0 && <span className="text-xs text-ink-soft line-through">{formatBRL(product.compare_price)}</span>}
        </p>
        {parseVariants(product.variants).length > 0 && <p className="mt-0.5 text-[11px] text-ink-soft truncate">{parseVariants(product.variants).join(' · ')}</p>}
      </button>
    </article>
  );
}

function OptionCard({ selected, onClick, icon, title, description, aside }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; description?: string; aside: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx('w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition', selected ? 'border-[var(--store)] bg-[var(--store-soft)] ring-1 ring-[var(--store)]' : 'border-black/10 hover:border-black/20')}
    >
      <span className={cx('w-8 h-8 rounded-lg flex items-center justify-center', selected ? 'bg-[var(--store)] text-[var(--store-ink)]' : 'bg-black/[0.04] text-ink-muted')}>{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        {description && <span className="block text-xs text-ink-muted truncate">{description}</span>}
      </span>
      <span className={cx('text-sm shrink-0', aside === 'Grátis' ? 'font-semibold text-emerald-700' : 'text-ink-muted')}>{aside}</span>
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
