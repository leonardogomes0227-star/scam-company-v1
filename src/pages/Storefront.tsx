import { useState } from 'react';
import { 
  ShoppingBag, Search, Plus, Minus, X, MessageCircle, 
  QrCode, Copy, Check, Tag, ShieldCheck, HeartHandshake, Star
} from 'lucide-react';

export default function Storefront() {
  const CATEGORIES = [
    'Todos',
    'Eletrônicos',
    'Acessórios',
    'Vestuário',
    'Calçados',
    'Casa & Decoração'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const generatePixPayload = (key: string, name: string, amount: number) => {
    const cleanKey = key ? key.trim() : '00000000000';
    const cleanName = name ? name.substring(0, 25).trim() : 'LOJA';
    const valStr = amount.toFixed(2);
    return `00020126580014BR.GOV.BCB.PIX0114${cleanKey}520400005303986540${valStr.length < 10 ? '0' + valStr.length : valStr}${valStr}5802BR5915${cleanName}6009SAO PAULO62070503***6304`;
  };

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);

  // Modal Detalhes do Produto & Variações
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  const [products] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Fone de Ouvido Bluetooth', price: 149.90, promoPrice: 99.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', variants: ['Preto', 'Branco'] },
      { id: '2', name: 'Smartwatch Esportivo', price: 299.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', variants: ['Preto', 'Cinza'] }
    ];
  });

  const [config] = useState<any>(() => {
    const saved = localStorage.getItem('store_config');
    return saved ? JSON.parse(saved) : {
      name: 'Minha Loja Digital',
      about: 'Encontre os melhores produtos com entrega garantida e pagamento via Pix.',
      whatsapp: '5567999999999',
      pixKey: '00000000000',
      fixedFreight: 10,
      freeFreightThreshold: 150
    };
  });

  const [testimonials] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_testimonials');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Lucas Andrade', stars: 5, comment: 'Atendimento nota 10, entregaram super rápido!' },
      { id: '2', name: 'Carla Dias', stars: 5, comment: 'Produto de altíssima qualidade. Recomendo demais!' }
    ];
  });

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: any, variant?: string) => {
    const chosenVariant = variant || (product.variants && product.variants[0]) || '';
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.variant === chosenVariant);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.variant === chosenVariant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, variant: chosenVariant }];
    });
    setSelectedProductModal(null);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, variant: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.variant === variant) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as any[]
    );
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.promoPrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const freightCost = subtotal >= (config.freeFreightThreshold || 150) ? 0 : (config.fixedFreight || 10);
  const cartTotal = subtotal + freightCost;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;
    let message = `🛒 *NOVO PEDIDO - ${config.name.toUpperCase()}*\n\n`;
    cart.forEach((item) => {
      const unitPrice = item.product.promoPrice ?? item.product.price;
      const variantText = item.variant ? ` (${item.variant})` : '';
      message += `• ${item.quantity}x ${item.product.name}${variantText} - ${formatCurrency(unitPrice)}\n`;
    });
    message += `\n📦 *Subtotal:* ${formatCurrency(subtotal)}\n`;
    message += `🚚 *Frete:* ${freightCost === 0 ? 'GRÁTIS' : formatCurrency(freightCost)}\n`;
    message += `💰 *TOTAL DO PEDIDO:* ${formatCurrency(cartTotal)}\n\nAguardando instruções para pagamento via Pix.`;
    window.open(`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNegotiateWhatsApp = () => {
    if (cart.length === 0) return;
    let message = `👋 *Olá! Gostaria de negociar uma condição especial para estes itens:*\n\n`;
    cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.product.name}\n`;
    });
    message += `\n💰 *Total do Carrinho:* ${formatCurrency(cartTotal)}\nConsegue um cupom ou desconto no Pix para fechar agora?`;
    window.open(`https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const pixPayload = generatePixPayload(config.pixKey, config.name, cartTotal);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* BANNER PRINCIPAL COM MARCA DO LOJISTA (WHITE-LABEL) */}
      <div className="bg-slate-900 border-b border-slate-800 pt-12 pb-10 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          {config.logoUrl && (
            <img src={config.logoUrl} alt={config.name} className="w-16 h-16 mx-auto rounded-2xl object-cover mb-2 border border-slate-700 shadow-lg" />
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Compra 100% Segura via WhatsApp & Pix
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{config.name}</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">{config.about}</p>
        </div>
      </div>

      {/* FILTROS & BUSCA */}
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
          {filteredProducts.map((p) => {
            const hasPromo = p.promoPrice && p.promoPrice < p.price;
            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => {
                  setSelectedProductModal(p);
                  if (p.variants && p.variants.length > 0) setSelectedVariant(p.variants[0]);
                }}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {hasPromo && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Tag className="w-3 h-3" /> PROMO
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{p.category}</span>
                    <h3 className="text-xs font-bold text-white line-clamp-2">{p.name}</h3>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {hasPromo && <span className="block text-[10px] text-slate-500 line-through">{formatCurrency(p.price)}</span>}
                      <span className="text-sm font-black text-emerald-400">{formatCurrency(p.promoPrice ?? p.price)}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                      }}
                      className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PROVA SOCIAL / DEPOIMENTOS */}
        {testimonials.length > 0 && (
          <div className="pt-12 border-t border-slate-900 space-y-4">
            <h3 className="text-base font-extrabold text-white text-center">O que nossos clientes dizem ⭐</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t: any) => (
                <div key={t.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs text-white">{t.name}</strong>
                    <span className="text-xs text-amber-400 font-bold">⭐ {t.stars}.0</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{t.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3.5 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-3 transition-all active:scale-95"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItemsCount}
            </span>
          </div>
          <span>Ver Carrinho ({formatCurrency(cartTotal)})</span>
        </button>
      )}

      {/* MODAL DETALHES DO PRODUTO (VARIAÇÕES) */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 relative">
            <button onClick={() => setSelectedProductModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <img src={selectedProductModal.image} alt={selectedProductModal.name} className="w-full h-48 object-cover rounded-2xl" />

            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-bold">{selectedProductModal.category}</span>
              <h3 className="text-base font-extrabold text-white">{selectedProductModal.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedProductModal.description || 'Produto de altíssima qualidade disponível na loja.'}</p>
            </div>

            {selectedProductModal.variants && selectedProductModal.variants.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Selecione a Opção / Tamanho:</label>
                <div className="flex gap-2 flex-wrap">
                  {selectedProductModal.variants.map((v: string) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedVariant === v ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-500 block">Preço:</span>
                <span className="text-xl font-black text-emerald-400">{formatCurrency(selectedProductModal.promoPrice ?? selectedProductModal.price)}</span>
              </div>
              <button
                onClick={() => addToCart(selectedProductModal, selectedVariant)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between p-6 overflow-y-auto">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" /> Seu Carrinho ({totalItemsCount})
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {cart.map((item) => {
                  const price = item.product.promoPrice ?? item.product.price;
                  return (
                    <div key={`${item.product.id}-${item.variant}`} className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        {item.variant && <p className="text-[10px] text-slate-400">Opção: {item.variant}</p>}
                        <p className="text-xs text-emerald-400 font-bold">{formatCurrency(price)}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.product.id, item.variant, -1)} className="p-1 text-slate-400">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[16px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.variant, 1)} className="p-1 text-slate-400">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frete:</span>
                  <span>{freightCost === 0 ? <strong className="text-emerald-400">GRÁTIS</strong> : formatCurrency(freightCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-1">
                  <span>Total:</span>
                  <span className="text-emerald-400">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Finalizar Pedido no WhatsApp
              </button>

              <button
                onClick={handleNegotiateWhatsApp}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" /> Pedir Desconto / Negociar
              </button>

              <button
                onClick={() => setShowPixModal(true)}
                className="w-full py-2 text-xs text-slate-400 font-bold flex items-center justify-center gap-1 hover:text-white"
              >
                <QrCode className="w-4 h-4 text-emerald-400" /> Ver Chave Pix Copia e Cola
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIX COPIA E COLA */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <h3 className="font-extrabold text-white text-base flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" /> Pix Copia e Cola
            </h3>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-mono text-slate-300 break-all select-all">
              {pixPayload}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(pixPayload);
                setCopiedPix(true);
                setTimeout(() => setCopiedPix(false), 2000);
              }}
              className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
            </button>
            <button onClick={() => setShowPixModal(false)} className="text-xs font-bold text-slate-500">Fechar</button>
          </div>
        </div>
      )}

    </div>
  );
}
