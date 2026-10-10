import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Star, Filter, Trash2, MessageSquare, CreditCard, Search, Eye, Truck, Clock, Heart, MapPin, Send, Minus, Plus, CheckCircle2, Copy, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatBRL, formatDate, generateId, generateOrderCode, normalizeWhatsapp, whatsappLink } from '../lib/format';
import { buildPixPayload } from '../lib/pix';
import type { Coupon, OrderItem, Product, Review, Tenant } from '../types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80';
const PAYMENT_METHODS = ['Pix', 'Cartão', 'Dinheiro'] as const;

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

function Stars({ rating, className = 'w-3 h-3' }: { rating: number; className?: string }) {
  return (
    <div className="flex text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < Math.round(rating) ? 'fill-current' : 'opacity-30'}`} />
      ))}
    </div>
  );
}

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const [cartPulse, setCartPulse] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSending, setReviewSending] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [shippingRegion, setShippingRegion] = useState<'local' | 'far'>('local');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pix');
  const [checkoutError, setCheckoutError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<TrackedOrder | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Carrega os dados da loja e dos produtos do Supabase, com base no tenantId da URL
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

      // Remove do carrinho/favoritos produtos que não existem mais
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

  const reviewsByProduct = useMemo(() => {
    const map = new Map<string, Review[]>();
    for (const r of reviews) map.set(r.product_id, [...(map.get(r.product_id) || []), r]);
    return map;
  }, [reviews]);

  const ratingOf = (productId: string) => {
    const list = reviewsByProduct.get(productId) || [];
    if (list.length === 0) return null;
    return { average: list.reduce((acc, r) => acc + r.rating, 0) / list.length, count: list.length };
  };

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category || 'Geral')))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || (product.category || 'Geral') === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartLines = cart
    .map((line) => ({ ...line, product: productById.get(line.productId) }))
    .filter((l): l is CartLine & { product: Product } => !!l.product);
  const cartCount = cartLines.reduce((acc, l) => acc + l.quantity, 0);

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: Math.min(l.quantity + 1, product.stock) } : l));
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
    setActiveProductId(null);
    setIsWishlistOpen(false);
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 800);
    setIsCartOpen(true);
  };

  const changeQuantity = (productId: string, delta: number) => {
    const product = productById.get(productId);
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.min(l.quantity + delta, product?.stock ?? Infinity) } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((l) => l.productId !== productId));

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
  };

  const handleApplyCoupon = (e: { preventDefault: () => void }) => {
    e.preventDefault();
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

  const handleCheckoutWhatsApp = async (e: React.FormEvent) => {
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

    const { data, error } = await supabase.rpc('track_order', { p_tenant_id: tenantId, p_code: code });
    if (error) console.error('[Storefront] Falha no rastreio:', error.message);
    const found = Array.isArray(data) ? data[0] : data;
    setTrackedOrderResult(found ? { ...found, total: Number(found.total) } : null);
    setTrackingSearched(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setPlacedOrder(null);
    setCheckoutError('');
  };

  const activeProduct = activeProductId ? productById.get(activeProductId) : undefined;
  const activeRating = activeProduct ? ratingOf(activeProduct.id) : null;
  const activeReviews = activeProduct ? reviewsByProduct.get(activeProduct.id) || [] : [];

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400 text-xs">Carregando loja...</p>
      </div>
    );
  }

  if (storeNotFound || !store) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 text-center p-6">
        <h1 className="text-xl font-black text-white">Loja não encontrada</h1>
        <p className="text-xs text-zinc-400">Verifique se o link da vitrine está correto.</p>
      </div>
    );
  }

  if ((store.subscription_status || 'active') !== 'active') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 text-center p-6">
        <h1 className="text-xl font-black text-white">{store.name}</h1>
        <p className="text-xs text-zinc-400">Esta loja está temporariamente indisponível. Volte em breve!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-24 selection:bg-amber-500 selection:text-black">

      {/* Faixa de destaque */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black py-2.5 px-4 text-center font-black text-xs flex flex-wrap items-center justify-center gap-x-4 gap-y-1 shadow-lg">
        <span className="flex items-center gap-1"><Zap className="w-4 h-4 fill-current" /> Pedido direto pelo WhatsApp</span>
        <span className="hidden sm:inline">•</span>
        <span>Pix na hora</span>
        <span className="hidden sm:inline">•</span>
        <span>Entrega a partir de {formatBRL(Math.min(shippingLocal, shippingFar))}</span>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center gap-4 max-w-4xl mx-auto rounded-b-3xl shadow-xl mt-2">
        <div className="min-w-0">
          <h1 className="text-xl font-black text-white truncate">{store.name}</h1>
          <p className="text-xs text-zinc-400">{store.about || 'Seja bem-vindo(a)!'} <span className="text-amber-400 italic">"The World Is Yours"</span></p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2.5 bg-black border border-zinc-800 hover:border-amber-500 text-rose-400 rounded-xl transition-all flex items-center justify-center"
            title="Meus Favoritos"
          >
            <Heart className="w-4 h-4 fill-current" />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 ${cartPulse ? 'scale-110 ring-4 ring-amber-400/50' : ''}`}
          >
            <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Rastreio */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" /> Acompanhe o Status do seu Pedido
          </h3>
          <form onSubmit={handleTrackOrder} className="flex gap-2">
            <input
              type="text"
              placeholder="Código do pedido (ex: PED-AB12CD34)"
              value={trackingCodeInput}
              onChange={(e) => setTrackingCodeInput(e.target.value)}
              className="flex-1 min-w-0 bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase outline-none focus:border-amber-500"
              required
            />
            <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-md">
              Consultar
            </button>
          </form>

          {trackingSearched && (
            <div className="pt-2">
              {trackedOrderResult ? (
                <div className="bg-black border border-amber-500/30 p-4 rounded-2xl flex flex-wrap gap-3 justify-between items-center text-xs">
                  <div>
                    <span className="text-amber-400 font-bold">{trackedOrderResult.id}</span>
                    <p className="text-zinc-400">Feito em {formatDate(trackedOrderResult.date)} · Total: {formatBRL(trackedOrderResult.total)}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold rounded-xl flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {trackedOrderResult.status}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center font-bold">
                  Nenhum pedido encontrado com este código.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition-all shadow-md"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 shrink-0"><Filter className="w-3.5 h-3.5" /> Categoria:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategory === cat ? 'bg-amber-500 text-black shadow-md font-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-3xl">
            {products.length === 0 ? 'Esta loja ainda não cadastrou produtos.' : 'Nenhum produto encontrado.'}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isFav = favorites.includes(product.id);
            const rating = ratingOf(product.id);
            const soldOut = product.stock <= 0;
            return (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-3 cursor-pointer relative" onClick={() => setActiveProductId(product.id)}>

                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-xl border backdrop-blur-md transition-all ${isFav ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <div className="relative group">
                    <img src={product.image || DEFAULT_IMAGE} alt={product.name} loading="lazy" className={`w-full h-48 object-cover rounded-2xl bg-black border border-zinc-800 ${soldOut ? 'opacity-50 grayscale' : ''}`} />
                    {soldOut && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg">ESGOTADO</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <span className="px-3 py-1.5 bg-zinc-900/90 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-md border border-zinc-700">
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> Ver Detalhes
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">{product.category || 'Geral'}</span>
                    <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
                    {rating ? (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-black text-white ml-1">{rating.average.toFixed(1)}</span>
                        <span className="text-[10px] text-zinc-400">({rating.count} {rating.count === 1 ? 'avaliação' : 'avaliações'})</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500">Sem avaliações ainda</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <span className="text-sm font-black text-amber-400">{formatBRL(product.price)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={soldOut}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black text-xs rounded-xl transition-all shadow-md"
                  >
                    {soldOut ? 'Esgotado' : 'Comprar 🛒'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Favoritos */}
      {isWishlistOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end" onClick={() => setIsWishlistOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-current" /> Seus Produtos Favoritos
                </h2>
                <button onClick={() => setIsWishlistOpen(false)} className="text-zinc-400 hover:text-white font-bold text-sm">✕ Fechar</button>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500">Nenhum produto favoritado ainda.</div>
              ) : (
                <div className="space-y-3">
                  {products.filter((p) => favorites.includes(p.id)).map((favProd) => (
                    <div key={favProd.id} className="flex items-center justify-between bg-black border border-zinc-800 p-3 rounded-2xl gap-3">
                      <img src={favProd.image || DEFAULT_IMAGE} alt={favProd.name} className="w-14 h-14 object-cover rounded-xl bg-zinc-900 border border-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{favProd.name}</h4>
                        <span className="text-xs font-black text-amber-400">{formatBRL(favProd.price)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addToCart(favProd)} disabled={favProd.stock <= 0} className="px-3 py-2 bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold text-[10px] rounded-xl">
                          {favProd.stock <= 0 ? 'Esgotado' : 'Comprar'}
                        </button>
                        <button onClick={(e) => toggleFavorite(favProd.id, e)} className="p-2 text-rose-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setIsWishlistOpen(false)} className="w-full py-3 bg-zinc-800 text-white font-bold text-xs rounded-xl mt-4">Continuar Comprando</button>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Produto com Envio de Avaliações */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveProductId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative space-y-6">
            <button onClick={() => setActiveProductId(null)} className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white font-bold text-xs bg-black px-3 py-1.5 rounded-xl border border-zinc-800">✕ Fechar</button>

            <div className="space-y-3">
              <img src={activeProduct.image || DEFAULT_IMAGE} alt={activeProduct.name} className="w-full h-56 object-cover rounded-2xl bg-black border border-zinc-800" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">{activeProduct.category || 'Geral'}</span>
                <h2 className="text-lg font-black text-white">{activeProduct.name}</h2>
                {activeRating && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black text-white ml-1">{activeRating.average.toFixed(1)}</span>
                    <span className="text-[10px] text-zinc-400">({activeRating.count} {activeRating.count === 1 ? 'avaliação' : 'avaliações'})</span>
                  </div>
                )}
                {activeProduct.description && <p className="text-xs text-zinc-300 leading-relaxed pt-1 whitespace-pre-line">{activeProduct.description}</p>}
                <p className={`text-[11px] font-bold pt-1 ${activeProduct.stock <= 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {activeProduct.stock <= 0 ? 'Esgotado no momento' : `${activeProduct.stock} em estoque`}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-white uppercase">Avaliações de Clientes</h3>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {activeReviews.length > 0 ? (
                  activeReviews.map((rev) => (
                    <div key={rev.id} className="bg-black border border-zinc-800 p-3 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{rev.name}</span>
                        <Stars rating={rev.rating} />
                      </div>
                      <p className="text-zinc-400 text-[11px]">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Seja o primeiro a avaliar este produto!</p>
                )}
              </div>

              <form onSubmit={(e) => handleAddReview(e, activeProduct.id)} className="space-y-3 pt-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase">Deixe sua avaliação</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Seu Nome" maxLength={60} value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500" required />
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
                <textarea placeholder="O que você achou do produto?" maxLength={500} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none h-16 resize-none focus:border-amber-500" required />
                <button type="submit" disabled={reviewSending} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5 text-amber-400" /> {reviewSending ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <span className="text-base font-black text-amber-400">{formatBRL(activeProduct.price)}</span>
              <button
                onClick={() => addToCart(activeProduct)}
                disabled={activeProduct.stock <= 0}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black text-xs rounded-xl transition-all shadow-lg"
              >
                {activeProduct.stock <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho 🛒'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gaveta do Carrinho / Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end" onClick={closeCart}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            {placedOrder ? (
              <div className="space-y-5 text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white">Pedido enviado!</h2>
                  <p className="text-xs text-zinc-400">Guarde o código para acompanhar o status:</p>
                  <p className="font-mono font-black text-amber-400 text-base select-all">{placedOrder.id}</p>
                </div>

                {placedOrder.pixCode && (
                  <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-3 text-left">
                    <h3 className="text-xs font-black text-emerald-400">Pague {formatBRL(placedOrder.total)} com Pix</h3>
                    <p className="text-[11px] text-zinc-400">Copie o código abaixo e cole na opção "Pix Copia e Cola" do app do seu banco. Depois, envie o comprovante no WhatsApp da loja.</p>
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 break-all text-[10px] font-mono text-zinc-300 max-h-24 overflow-y-auto">
                      {placedOrder.pixCode}
                    </div>
                    <button onClick={() => handleCopyPix(placedOrder.pixCode!)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" /> {pixCopied ? 'Código copiado!' : 'Copiar código Pix'}
                    </button>
                  </div>
                )}

                {store.whatsapp && (
                  <a href={placedOrder.whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Abrir conversa no WhatsApp
                  </a>
                )}
                <button onClick={closeCart} className="w-full py-3 bg-zinc-800 text-white font-bold text-xs rounded-xl">Continuar Comprando</button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400" /> Seu Carrinho
                    </h2>
                    <button onClick={closeCart} className="text-zinc-400 hover:text-white font-bold text-sm">✕ Fechar</button>
                  </div>

                  {cartLines.length === 0 ? (
                    <div className="text-center py-12 text-xs text-zinc-500">Seu carrinho está vazio.</div>
                  ) : (
                    <form id="checkout-form" onSubmit={handleCheckoutWhatsApp} className="space-y-4">
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {cartLines.map((line) => (
                          <div key={line.productId} className="flex justify-between items-center gap-3 bg-black border border-zinc-800 p-3 rounded-xl">
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{line.product.name}</h4>
                              <span className="text-xs font-black text-amber-400">{formatBRL(line.product.price * line.quantity)}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button type="button" onClick={() => changeQuantity(line.productId, -1)} className="p-1 bg-zinc-800 rounded-lg text-white" aria-label="Diminuir"><Minus className="w-3 h-3" /></button>
                              <span className="text-xs font-black text-white w-5 text-center">{line.quantity}</span>
                              <button type="button" onClick={() => changeQuantity(line.productId, 1)} disabled={line.quantity >= line.product.stock} className="p-1 bg-zinc-800 disabled:opacity-40 rounded-lg text-white" aria-label="Aumentar"><Plus className="w-3 h-3" /></button>
                              <button type="button" onClick={() => removeFromCart(line.productId)} className="text-zinc-500 hover:text-red-400 ml-1" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {coupons.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Cupom de desconto"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(e); }}
                              className="flex-1 min-w-0 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-amber-500"
                            />
                            <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl">Aplicar</button>
                          </div>
                          {couponError && <p className="text-[10px] text-red-400 font-bold">{couponError}</p>}
                          {appliedCoupon && (
                            <p className="text-[10px] text-amber-400 font-bold flex items-center justify-between">
                              ✔ Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discount}%)
                              <button type="button" onClick={() => setAppliedCoupon(null)} className="text-zinc-500 hover:text-white underline">remover</button>
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-3 pt-3 border-t border-zinc-800">
                        <h3 className="text-xs font-bold text-zinc-300 uppercase">Dados para Entrega</h3>
                        <input type="text" autoComplete="name" placeholder="Seu Nome Completo" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" required />
                        <input type="tel" autoComplete="tel" placeholder="Seu WhatsApp (com DDD)" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" required />
                        <input type="text" autoComplete="street-address" placeholder="Endereço completo / Bairro" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" required />
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Região de Entrega (Frete)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { id: 'local', label: `Centro / Local (${formatBRL(shippingLocal)})` },
                            { id: 'far', label: `Bairros Distantes (${formatBRL(shippingFar)})` },
                          ] as const).map((reg) => (
                            <button
                              key={reg.id}
                              type="button"
                              onClick={() => setShippingRegion(reg.id)}
                              className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-all border text-left ${shippingRegion === reg.id ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black' : 'bg-black border-zinc-800 text-zinc-300'}`}
                            >
                              {reg.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-400" /> Forma de Pagamento</label>
                        <div className="grid grid-cols-3 gap-2">
                          {PAYMENT_METHODS.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${paymentMethod === method ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black' : 'bg-black border-zinc-800 text-zinc-300'}`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {cartLines.length > 0 && (
                  <div className="space-y-4 pt-4 mt-4 border-t border-zinc-800">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-400"><span>Subtotal:</span> <span>{formatBRL(subtotal)}</span></div>
                      {appliedCoupon && <div className="flex justify-between text-amber-400"><span>Desconto:</span> <span>-{formatBRL(discountAmount)}</span></div>}
                      <div className="flex justify-between text-zinc-400"><span>Frete:</span> <span>{formatBRL(shippingFee)}</span></div>
                      <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-zinc-800"><span>Total:</span> <span className="text-amber-400">{formatBRL(total)}</span></div>
                    </div>
                    {checkoutError && <p className="text-[11px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-center">{checkoutError}</p>}
                    {!store.whatsapp && <p className="text-[11px] text-amber-300 text-center">Esta loja ainda não configurou o WhatsApp — seu pedido será registrado e a loja entrará em contato.</p>}
                    <button type="submit" form="checkout-form" disabled={placingOrder} className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10">
                      <MessageSquare className="w-4 h-4" /> {placingOrder ? 'Enviando...' : 'Enviar Pedido via WhatsApp ↗'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
