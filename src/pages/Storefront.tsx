import { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, StoreConfig } from '@/types';
import { CATEGORIES, formatCurrency, generatePixPayload } from '@/data';
import { buildWhatsAppMessage } from '@/utils';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X, Copy, Check, MessageCircle, QrCode, Star, Sparkles, ShieldCheck
} from 'lucide-react';

interface StorefrontProps {
  products?: Product[];
  config?: StoreConfig;
  cart?: CartItem[];
  onAdd?: (p: Product) => void;
  onRemove?: (id: string) => void;
  onQty?: (id: string, delta: number) => void;
  onClear?: () => void;
  cartOpen?: boolean;
  onCartOpen?: () => void;
  onCartClose?: () => void;
}

const DEFAULT_CONFIG: StoreConfig = {
  name: 'Sua Loja Digital',
  about: 'Encontre os melhores produtos com os melhores preços e entrega garantida.',
  whatsapp: '5567999999999',
  pixKey: '00000000000',
  pixKeyType: 'cpf',
};

const FREE_SHIPPING_THRESHOLD = 150;

export default function Storefront(props: StorefrontProps) {
  const products = props.products || [];
  const config = props.config || DEFAULT_CONFIG;
  const cart = props.cart || [];

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [internalCartOpen, setInternalCartOpen] = useState(false);
  const [socialProof, setSocialProof] = useState<{ name: string; city: string; product: string } | null>(null);
  const [pixModal, setPixModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const isCartOpen = props.cartOpen !== undefined ? props.cartOpen : internalCartOpen;
  const handleOpenCart = props.onCartOpen || (() => setInternalCartOpen(true));
  const handleCloseCart = props.onCartClose || (() => setInternalCartOpen(false));

  // Notificações de Prova Social
  useEffect(() => {
    if (!products || products.length === 0) return;
    const names = ['Mariana', 'Lucas', 'Guilherme', 'Beatriz', 'Matheus', 'Fernanda'];
    const cities = ['Campo Grande', 'Rio Verde', 'São Paulo', 'Curitiba', 'Goiânia'];

    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)]?.name || 'Produto';

      setSocialProof({ name: randomName, city: randomCity, product: randomProduct });

      setTimeout(() => setSocialProof(null), 4000);
    }, 10000);

    return () => clearInterval(interval);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p || !p.active) return false;
      if (category !== 'Todos' && p.category !== category) return false;
      if (search && !(p.name || '').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, category, search]);

  const totalCart = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.product?.price || 0) * (item.quantity || 1)), 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cart]);

  const freeShippingProgress = Math.min(100, (totalCart / FREE_SHIPPING_THRESHOLD) * 100);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalCart);

  const handleCheckoutWhatsApp = () => {
    const text = buildWhatsAppMessage(cart, totalCart, config);
    const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // ✅ FIX: Ordem corrigida dos parâmetros (key, name, amount)
  const pixCode = useMemo(() => {
    return generatePixPayload(config.pixKey || '', config.name || 'Loja', totalCart);
  }, [config, totalCart]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Envio rápido e pagamento seguro via Pix
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">{config.name}</h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">{config.about}</p>
        </div>
      </section>

      {/* Categorias e Busca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  category === c
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {p.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-gray-400 font-normal ml-1">(4.9)</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base line-clamp-1">{p.name}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{p.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between mt-2">
                <div>
                  <span className="text-xs text-gray-400 block">Preço</span>
                  <span className="text-lg font-black text-emerald-600">{formatCurrency(p.price)}</span>
                </div>

                <button
                  onClick={() => props.onAdd && props.onAdd(p)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão Flutuante do Carrinho */}
      {totalItems > 0 && !isCartOpen && (
        <button
          onClick={handleOpenCart}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-bold text-sm">{formatCurrency(totalCart)}</span>
        </button>
      )}

      {/* Gaveta Lateral do Carrinho */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleCloseCart}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-lg text-gray-900">Seu Carrinho</h2>
                </div>
                <button onClick={handleCloseCart} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar Frete Grátis */}
              <div className="my-4 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
                <div className="flex justify-between text-xs font-semibold text-emerald-800 mb-1.5">
                  <span>
                    {freeShippingRemaining === 0 ? '🎉 Você ganhou Frete Grátis!' : `Faltam ${formatCurrency(freeShippingRemaining)} para Frete Grátis`}
                  </span>
                  <span>{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${freeShippingProgress}%` }} />
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="space-y-4 my-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-gray-900 truncate">{item.product.name}</h4>
                        <span className="text-xs font-bold text-emerald-600">{formatCurrency(item.product.price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => props.onQty && props.onQty(item.product.id, -1)} className="p-1 rounded bg-white border text-gray-600 hover:bg-gray-100">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                        <button onClick={() => props.onQty && props.onQty(item.product.id, 1)} className="p-1 rounded bg-white border text-gray-600 hover:bg-gray-100">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => props.onRemove && props.onRemove(item.product.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Total do Pedido</span>
                  <span className="text-xl font-black text-gray-900">{formatCurrency(totalCart)}</span>
                </div>

                <button
                  onClick={handleCheckoutWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar Pedido no WhatsApp
                </button>

                <button
                  onClick={() => setPixModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-colors"
                >
                  <QrCode className="w-4 h-4" /> Pagar via Pix Agora
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pop-up de Prova Social */}
      {socialProof && (
        <div className="fixed bottom-6 left-6 z-40 bg-white p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-slide-up max-w-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{socialProof.name} de {socialProof.city}</p>
            <p className="text-[11px] text-gray-500 truncate">Comprou <span className="text-emerald-600 font-semibold">{socialProof.product}</span></p>
          </div>
        </div>
      )}

      {/* Modal Pix */}
      {pixModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPixModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-base">Pagamento Pix</h3>
              <button onClick={() => setPixModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500">Copie o código abaixo para pagar <strong className="text-emerald-600">{formatCurrency(totalCart)}</strong>.</p>
            <div className="bg-gray-50 p-3 rounded-xl text-[11px] font-mono break-all text-gray-600 border border-gray-100">
              {pixCode}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(pixCode);
                setCopiedPix(true);
                setTimeout(() => setCopiedPix(false), 2000);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPix ? 'Chave Pix Copiada!' : 'Copiar Código Pix'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
