import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Filter, Trash2, MessageSquare, CreditCard } from 'lucide-react';

export default function Storefront() {
  const [storeConfig, setStoreConfig] = useState({ name: 'Minha Loja', about: 'Seja bem-vindo!', whatsapp: '5567999999999', color: '#10b981' });
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Estados de Cupom
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Estados de Checkout e Pagamento
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix'); // Pix, Cartão ou Dinheiro

  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('store_config_lkd-imports') || '{}');
    if (config.name) setStoreConfig(config);

    const prods = JSON.parse(localStorage.getItem('store_products_lkd-imports') || '[]');
    if (prods.length > 0) {
      const prodsWithReviews = prods.map((p: any) => ({
        ...p,
        rating: 4.8,
        reviewsCount: Math.floor(Math.random() * 25) + 5
      }));
      setProducts(prodsWithReviews);
    } else {
      setProducts([
        { id: '1', name: 'Fone Bluetooth Pro', price: 149.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', rating: 4.9, reviewsCount: 12 }
      ]);
    }

    const savedCoupons = JSON.parse(localStorage.getItem('store_coupons_lkd-imports') || '[]');
    setCoupons(savedCoupons);
  }, []);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category || 'Geral')))];
  const filteredProducts = selectedCategory === 'Todos' ? products : products.filter(p => (p.category || 'Geral') === selectedCategory);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
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
  const total = subtotal - discountAmount;

  const handleCheckoutWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || cart.length === 0) return;

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customer: clientName,
      whatsapp: clientPhone,
      total: total,
      status: 'Aguardando Pagamento',
      date: new Date().toISOString().split('T')[0]
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('store_orders_lkd-imports') || '[]');
    localStorage.setItem('store_orders_lkd-imports', JSON.stringify([newOrder, ...existingOrders]));

    let msg = `🛒 *NOVO PEDIDO - ${storeConfig.name}*\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📍 *Endereço:* ${clientAddress}\n` +
      `💳 *Forma de Pagamento:* ${paymentMethod}\n\n` +
      `📦 *Itens do Pedido:*\n`;

    cart.forEach(item => {
      msg += `- ${item.name} (${formatBRL(item.price)})\n`;
    });

    if (appliedCoupon) {
      msg += `\n🎟 *Cupom:* ${appliedCoupon.code} (-${appliedCoupon.discount}%)\n`;
    }

    msg += `\n💰 *Total:* *${formatBRL(total)}*`;

    const whatsNumber = storeConfig.whatsapp || '5567999999999';
    const url = `https://wa.me/${whatsNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center max-w-4xl mx-auto rounded-b-3xl">
        <div>
          <h1 className="text-xl font-black text-white">{storeConfig.name}</h1>
          <p className="text-xs text-slate-400">{storeConfig.about}</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <ShoppingBag className="w-4 h-4" /> Carrinho
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Filtros */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0"><Filter className="w-3.5 h-3.5" /> Filtrar:</span>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl bg-slate-950" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">{product.category || 'Geral'}</span>
                <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-black text-white ml-1">{product.rating}</span>
                  <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-sm font-black text-emerald-400">{formatBRL(product.price)}</span>
              <button onClick={() => addToCart(product)} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all">
                Comprar 🛒
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gaveta do Carrinho / Checkout com Pagamento */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" /> Seu Carrinho
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕ Fechar</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">Seu carrinho está vazio.</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-3 rounded-xl">
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          <span className="text-xs font-black text-emerald-400">{formatBRL(item.price)}</span>
                        </div>
                        <button onClick={() => removeFromCart(idx)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Cupom */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input type="text" placeholder="Cupom de desconto" value={couponInput} onChange={e => setCouponInput(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-emerald-500" />
                    <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl">Aplicar</button>
                  </form>
                  {couponError && <p className="text-[10px] text-red-400 font-bold">{couponError}</p>}
                  {appliedCoupon && <p className="text-[10px] text-emerald-400 font-bold">✔ Cupom {appliedCoupon.code} aplicado (-{appliedCoupon.discount}%)</p>}

                  {/* Dados de Entrega */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase">Dados para Entrega</h3>
                    <input type="text" placeholder="Seu Nome Completo" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500" required />
                    <input type="text" placeholder="Seu WhatsApp (com DDD)" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500" required />
                    <input type="text" placeholder="Endereço / Bairro" value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500" required />
                  </div>

                  {/* Seleção de Forma de Pagamento */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Forma de Pagamento</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Pix', 'Cartão', 'Dinheiro'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            paymentMethod === method 
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md' 
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Rodapé Totais */}
            {cart.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400"><span>Subtotal:</span> <span>{formatBRL(subtotal)}</span></div>
                  {appliedCoupon && <div className="flex justify-between text-emerald-400"><span>Desconto:</span> <span>-{formatBRL(discountAmount)}</span></div>}
                  <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800"><span>Total:</span> <span className="text-emerald-400">{formatBRL(total)}</span></div>
                </div>

                <button 
                  onClick={handleCheckoutWhatsApp}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
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
