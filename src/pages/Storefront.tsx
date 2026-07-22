import { useState } from 'react';
import { Product, StoreConfig, CartItem } from '../types';
import { CATEGORIES, formatCurrency, generatePixPayload } from '../data';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, X, MessageCircle, 
  QrCode, Copy, Check, Sparkles, Tag, ShieldCheck, HeartHandshake 
} from 'lucide-react';

interface StorefrontProps {
  products?: Product[];
  config?: StoreConfig;
}

export default function Storefront({ products = [], config }: StorefrontProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);

  const storeConfig: StoreConfig = config || {
    name: 'Sua Loja Digital',
    about: 'Os melhores produtos com entrega rápida e pagamento seguro.',
    whatsapp: '5567999999999',
    pixKey: '00000000000',
    pixKeyType: 'cpf',
  };

  // Filtros de Busca e Categoria
  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Funções do Carrinho
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.product.promoPrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 💬 Fechamento Padrão via WhatsApp
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `🛒 *NOVO PEDIDO - ${storeConfig.name.toUpperCase()}*\n\n`;
    cart.forEach((item) => {
      const unitPrice = item.product.promoPrice ?? item.product.price;
      message += `• ${item.quantity}x ${item.product.name} (${formatCurrency(unitPrice)})\n`;
    });

    message += `\n💰 *Total:* ${formatCurrency(cartTotal)}\n`;
    message += `📍 Aguardando instruções para pagamento Pix e envio.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${storeConfig.whatsapp.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  // 🤝 NEGOCIAÇÃO / PROPOSTA DE DESCONTO NO WHATSAPP (Carrinho Abandonado/Dúvida)
  const handleNegotiateWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `👋 *Olá! Gostaria de uma proposta/condição especial para estes itens:*\n\n`;
    cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.product.name}\n`;
    });

    message += `\n💰 *Valor Atual no Carrinho:* ${formatCurrency(cartTotal)}\n`;
    message += ` Consegue um cupom ou desconto no frete para eu fechar agora?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${storeConfig.whatsapp.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  const pixPayload = generatePixPayload(storeConfig.pixKey, storeConfig.name, cartTotal);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* BANNER PRINCIPAL / HERO */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 pt-20 pb-10 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Compra 100% Segura via WhatsApp & Pix
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{storeConfig.name}</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">{storeConfig.about}</p>
        </div>
      </div>

      {/* FILTROS & BUSCA */}
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Categorias (Chips) */}
          <div className="flex gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
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
                className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasPromo && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Tag className="w-3 h-3" /> PROMO
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{p.category}</span>
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{p.name}</h3>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      {hasPromo && (
                        <span className="block text-[10px] text-slate-500 line-through">
                          {formatCurrency(p.price)}
                        </span>
                      )}
                      <span className="text-sm font-black text-emerald-400">
                        {formatCurrency(p.promoPrice ?? p.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3.5 rounded-2xl font-black text-xs shadow-2xl shadow-emerald-500/40 flex items-center gap-3 transition-all active:scale-95"
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

      {/* MODAL DO CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between p-6 overflow-y-auto">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" /> Seu Carrinho ({totalItemsCount})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Itens */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const price = item.product.promoPrice ?? item.product.price;
                  return (
                    <div key={item.product.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-xs text-emerald-400 font-bold">{formatCurrency(price)}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-emerald-400">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[16px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-emerald-400">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total e Ações do Carrinho */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Total:</span>
                <span className="text-xl font-black text-emerald-400">{formatCurrency(cartTotal)}</span>
              </div>

              {/* Botão 1: Finalizar Pedido Normal */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> Finalizar Pedido no WhatsApp
              </button>

              {/* Botão 2: Negociar / Pedir Proposta (Recuperação de Carrinho) */}
              <button
                onClick={handleNegotiateWhatsApp}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" /> Pedir Desconto / Negociar
              </button>

              {/* Botão 3: Ver Código Pix na Tela */}
              <button
                onClick={() => setShowPixModal(true)}
                className="w-full py-2.5 text-xs text-slate-400 font-bold hover:text-white flex items-center justify-center gap-1.5"
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
            <p className="text-xs text-slate-400">Copie o código abaixo e cole no seu aplicativo do banco para pagar:</p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-mono text-slate-300 break-all select-all">
              {pixPayload}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(pixPayload);
                setCopiedPix(true);
                setTimeout(() => setCopiedPix(false), 2000);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
            </button>

            <button
              onClick={() => setShowPixModal(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
