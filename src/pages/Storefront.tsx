import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Filter, Trash2, MessageSquare, CreditCard, Search, Eye, Truck, Clock, Heart, Zap, MapPin, Send } from 'lucide-react';

export default function Storefront() {
  const [storeConfig, setStoreConfig] = useState({ name: 'STCK Company', about: 'Seja bem-vindo! The World Is Yours.', whatsapp: '5567999999999', color: '#f59e0b' });
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const [cartPulse, setCartPulse] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<any>(null);

  // Estados para nova avaliação dentro do modal do produto
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Estados de Cupom
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Estados de Checkout e Frete
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [shippingFee, setShippingFee] = useState<number>(10.00);
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  // Estados de Rastreio
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<any>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Cronômetro Regressivo
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 35, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('store_config_lkd-imports') || '{}');
    if (config.name) setStoreConfig(config);

    const prods = JSON.parse(localStorage.getItem('store_products_lkd-imports') || '[]');
    if (prods.length > 0) {
      const prodsWithDetails = prods.map((p: any) => ({
        ...p,
        description: p.description || 'Produto de alta qualidade, original e com garantia de entrega rápida.',
        rating: p.rating || 4.8,
        reviewsCount: p.reviewsCount || 12,
        customerReviews: p.customerReviews || [
          { name: 'Mariana S.', comment: 'Excelente produto, chegou super rápido!', rating: 5 }
        ]
      }));
      setProducts(prodsWithDetails);
    } else {
      setProducts([
        { 
          id: '1', 
          name: 'Fone Bluetooth Pro', 
          price: 149.90, 
          category: 'Eletrônicos', 
          description: 'Fone sem fio de alta fidelidade.', 
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 
          rating: 4.9, 
          reviewsCount: 12,
          customerReviews: [{ name: 'Carlos E.', comment: 'Muito bom, recomendo!', rating: 5 }]
        }
      ]);
    }

    const savedFavs = JSON.parse(localStorage.getItem('store_favorites_lkd-imports') || '[]');
    setFavorites(savedFavs);

    const savedCoupons = JSON.parse(localStorage.getItem('store_coupons_lkd-imports') || '[]');
    setCoupons(savedCoupons);
  }, []);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category || 'Geral')))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || (product.category || 'Geral') === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(productId)) {
      updated = favorites.filter(id => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    setFavorites(updated);
    localStorage.setItem('store_favorites_lkd-imports', JSON.stringify(updated));
  };

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    setActiveProductModal(null);
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 800);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleAddReview = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const newRev = { name: reviewName, comment: reviewComment, rating: reviewRating };
    
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const currentReviews = p.customerReviews || [];
        const newReviewsList = [newRev, ...currentReviews];
        const newRating = Number((newReviewsList.reduce((acc, r) => acc + r.rating, 0) / newReviewsList.length).toFixed(1));
        
        const updatedProd = {
          ...p,
          rating: newRating,
          reviewsCount: newReviewsList.length,
          customerReviews: newReviewsList
        };

        if (activeProductModal && activeProductModal.id === productId) {
          setActiveProductModal(updatedProd);
        }
        return updatedProd;
      }
      return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem('store_products_lkd-imports', JSON.stringify(updatedProducts));
    setReviewName('');
    setReviewComment('');
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const found = coupons.find(c => c.code === couponInput.toUpperCase().trim());
    if (found) {
      setAppliedCoupon(found);
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const total = subtotal - discountAmount + shippingFee;

  const handleCheckoutWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || cart.length === 0) return;

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderId,
      customer: clientName,
      whatsapp: clientPhone,
      total: total,
      status: 'Aguardando Pagamento',
      date: new Date().toISOString().split('T')[0]
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('store_orders_lkd-imports') || '[]');
    localStorage.setItem('store_orders_lkd-imports', JSON.stringify([newOrder, ...existingOrders]));

    let msg = `🛒 *NOVO PEDIDO (${orderId}) - ${storeConfig.name}*\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📍 *Endereço:* ${clientAddress}\n` +
      `🚚 *Frete:* ${formatBRL(shippingFee)}\n` +
      `💳 *Pagamento:* ${paymentMethod}\n\n` +
      `📦 *Itens:*\n`;

    cart.forEach(item => {
      msg += `- ${item.name} (${formatBRL(item.price)})\n`;
    });

    if (appliedCoupon) {
      msg += `\n🎟 *Cupom:* ${appliedCoupon.code} (-${appliedCoupon.discount}%)\n`;
    }

    msg += `\n💰 *Total Geral:* *${formatBRL(total)}*`;

    const whatsNumber = storeConfig.whatsapp || '5567999999999';
    const url = `https://wa.me/${whatsNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput) return;
    const allOrders = JSON.parse(localStorage.getItem('store_orders_lkd-imports') || '[]');
    const found = allOrders.find((o: any) => o.id.toLowerCase() === trackingCodeInput.trim().toLowerCase());
    setTrackedOrderResult(found || null);
    setTrackingSearched(true);
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-24 selection:bg-amber-500 selection:text-black">
      
      {/* Banner Oferta Relâmpago */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black py-2.5 px-4 text-center font-black text-xs flex flex-wrap items-center justify-center gap-3 shadow-lg">
        <span className="flex items-center gap-1"><Zap className="w-4 h-4 fill-current" /> OFERTA RELÂMPAGO DA SEMANA:</span>
        <div className="bg-black text-amber-400 px-2.5 py-1 rounded-xl text-[11px] font-mono tracking-widest shadow-inner border border-amber-500/20">
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center max-w-4xl mx-auto rounded-b-3xl shadow-xl mt-2">
        <div>
          <h1 className="text-xl font-black text-white">{storeConfig.name}</h1>
          <p className="text-xs text-zinc-400">{storeConfig.about} <span className="text-amber-400 italic">"The World Is Yours"</span></p>
        </div>
        
        <div className="flex items-center gap-2">
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
            <ShoppingBag className="w-4 h-4" /> Carrinho
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
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
              placeholder="Digite o código do pedido (ex: ORD-1234)" 
              value={trackingCodeInput}
              onChange={e => setTrackingCodeInput(e.target.value)}
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white uppercase outline-none focus:border-amber-500"
              required
            />
            <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-md">
              Consultar
            </button>
          </form>

          {trackingSearched && (
            <div className="pt-2">
              {trackedOrderResult ? (
                <div className="bg-black border border-amber-500/30 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-amber-400 font-bold">{trackedOrderResult.id}</span>
                    <h4 className="font-bold text-white">Cliente: {trackedOrderResult.customer}</h4>
                    <span className="text-zinc-400">Total: {formatBRL(trackedOrderResult.total)}</span>
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
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition-all shadow-md"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 shrink-0"><Filter className="w-3.5 h-3.5" /> Categoria:</span>
          {categories.map((cat, idx) => (
            <button
              key={idx}
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
            Nenhum produto encontrado.
          </div>
        ) : (
          filteredProducts.map(product => {
            const isFav = favorites.includes(product.id);
            return (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-3 cursor-pointer relative" onClick={() => setActiveProductModal(product)}>
                  
                  <button 
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-xl border backdrop-blur-md transition-all ${isFav ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <div className="relative group">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl bg-black border border-zinc-800" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <span className="px-3 py-1.5 bg-zinc-900/90 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 shadow-md border border-zinc-700">
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> Ver Detalhes
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">{product.category || 'Geral'}</span>
                    <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-black text-white ml-1">{product.rating}</span>
                      <span className="text-[10px] text-zinc-400">({product.reviewsCount} avaliações)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <span className="text-sm font-black text-amber-400">{formatBRL(product.price)}</span>
                  <button onClick={() => addToCart(product)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-md">
                    Comprar 🛒
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Favoritos */}
      {isWishlistOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
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
                  {products.filter(p => favorites.includes(p.id)).map(favProd => (
                    <div key={favProd.id} className="flex items-center justify-between bg-black border border-zinc-800 p-3 rounded-2xl gap-3">
                      <img src={favProd.image} alt={favProd.name} className="w-14 h-14 object-cover rounded-xl bg-zinc-900 border border-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{favProd.name}</h4>
                        <span className="text-xs font-black text-amber-400">{formatBRL(favProd.price)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addToCart(favProd)} className="px-3 py-2 bg-amber-500 text-black font-bold text-[10px] rounded-xl">Comprar</button>
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
      {activeProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative space-y-6">
            <button onClick={() => setActiveProductModal(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xs bg-black px-3 py-1.5 rounded-xl border border-zinc-800">✕ Fechar</button>
            
            <div className="space-y-3">
              <img src={activeProductModal.image} alt={activeProductModal.name} className="w-full h-56 object-cover rounded-2xl bg-black border border-zinc-800" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">{activeProductModal.category}</span>
                <h2 className="text-lg font-black text-white">{activeProductModal.name}</h2>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-black text-white ml-1">{activeProductModal.rating}</span>
                  <span className="text-[10px] text-zinc-400">({activeProductModal.reviewsCount} avaliações)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed pt-1">{activeProductModal.description}</p>
              </div>
            </div>

            {/* Lista de Avaliações */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-white uppercase">Avaliações de Clientes</h3>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {activeProductModal.customerReviews && activeProductModal.customerReviews.length > 0 ? (
                  activeProductModal.customerReviews.map((rev: any, i: number) => (
                    <div key={i} className="bg-black border border-zinc-800 p-3 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{rev.name}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-400 text-[11px]">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Seja o primeiro a avaliar este produto!</p>
                )}
              </div>

              {/* Formulário de Enviar Avaliação */}
              <form onSubmit={(e) => handleAddReview(e, activeProductModal.id)} className="space-y-3 pt-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase">Deixe sua avaliação</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Seu Nome" value={reviewName} onChange={e => setReviewName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500" required />
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
                <textarea placeholder="O que você achou do produto?" value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none h-16 resize-none focus:border-amber-500" required />
                <button type="submit" className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5 text-amber-400" /> Enviar Avaliação
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <span className="text-base font-black text-amber-400">{formatBRL(activeProductModal.price)}</span>
              <button onClick={() => addToCart(activeProductModal)} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg">Adicionar ao Carrinho 🛒</button>
            </div>
          </div>
        </div>
      )}

      {/* Gaveta do Carrinho / Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" /> Seu Carrinho
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white font-bold text-sm">✕ Fechar</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500">Seu carrinho está vazio.</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black border border-zinc-800 p-3 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          <span className="text-xs font-black text-amber-400">{formatBRL(item.price)}</span>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input type="text" placeholder="Cupom de desconto" value={couponInput} onChange={e => setCouponInput(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-amber-500" />
                    <button type="submit" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl">Aplicar</button>
                  </form>
                  {couponError && <p className="text-[10px] text-red-400 font-bold">{couponError}</p>}
                  {appliedCoupon && <p className="text-[10px] text-amber-400 font-bold">✔ Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discount}%)</p>}

                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase">Dados para Entrega</h3>
                    <input type="text" placeholder="Seu Nome Completo" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" required />
                    <input type="text" placeholder="Seu WhatsApp (com DDD)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" required />
                    <input type="text" placeholder="Endereço / Bairro" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500" required />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Região de Entrega (Frete)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Centro / Local (R$ 10)', fee: 10.00 },
                        { label: 'Bairros Distantes (R$ 18)', fee: 18.00 }
                      ].map((reg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setShippingFee(reg.fee)}
                          className={`py-2 px-3 rounded-xl text-[11px] font-bold transition-all border text-left ${shippingFee === reg.fee ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black' : 'bg-black border-zinc-800 text-zinc-300'}`}
                        >
                          {reg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-400" /> Forma de Pagamento</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Pix', 'Cartão', 'Dinheiro'].map((method) => (
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
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal:</span> <span>{formatBRL(subtotal)}</span></div>
                  {appliedCoupon && <div className="flex justify-between text-amber-400"><span>Desconto:</span> <span>-{formatBRL(discountAmount)}</span></div>}
                  <div className="flex justify-between text-zinc-400"><span>Frete:</span> <span>{formatBRL(shippingFee)}</span></div>
                  <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-zinc-800"><span>Total:</span> <span className="text-amber-400">{formatBRL(total)}</span></div>
                </div>
                <button onClick={handleCheckoutWhatsApp} className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10">
                  <MessageSquare className="w-4 h-4" /> Enviar Pedido via WhatsApp ↗
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
