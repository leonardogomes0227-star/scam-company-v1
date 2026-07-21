import { useState, useMemo } from 'react';
import { Product, CartItem, StoreConfig } from '@/types';
import { CATEGORIES, formatCurrency, generatePixPayload } from '@/data';
import { buildWhatsAppMessage } from '@/utils';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, Copy, Check, MessageCircle, QrCode } from 'lucide-react';

interface StorefrontProps {
  products: Product[];
  config: StoreConfig;
  cart: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: string) => void;
  onQty: (id: string, delta: number) => void;
  onClear: () => void;
  cartOpen: boolean;
  onCartOpen: () => void;
  onCartClose: () => void;
}

export default function Storefront({
  products, config, cart, onAdd, onRemove, onQty, onClear, cartOpen, onCartOpen, onCartClose,
}: StorefrontProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (category !== 'Todos' && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, category, search]);

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{config.name}</h1>
          <p className="text-gray-500">{config.about}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Categories */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs text-emerald-600 font-medium">{p.category}</span>
                  <h3 className="font-semibold text-gray-900 text-sm mt-1 mb-1 line-clamp-2 min-h-[2.5rem]">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 min-h-[2rem]">{p.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900 text-base">{formatCurrency(p.price)}</span>
                    <button
                      onClick={() => onAdd(p)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button (mobile) */}
      {count > 0 && !cartOpen && (
        <button
          onClick={onCartOpen}
          className="md:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-300"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold text-sm">{formatCurrency(total)}</span>
          <span className="w-5 h-5 bg-white text-emerald-600 rounded-full text-xs font-bold flex items-center justify-center">{count}</span>
        </button>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={onCartClose}
        cart={cart}
        total={total}
        config={config}
        onRemove={onRemove}
        onQty={onQty}
        onClear={onClear}
      />
    </div>
  );
}

function CartDrawer({
  open, onClose, cart, total, config, onRemove, onQty, onClear,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  config: StoreConfig;
  onRemove: (id: string) => void;
  onQty: (id: string, delta: number) => void;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const pixPayload = useMemo(
    () => generatePixPayload(config.pixKey, config.name, total),
    [config, total]
  );
  const whatsappUrl = useMemo(
    () => buildWhatsAppMessage(cart, config, total),
    [cart, config, total]
  );

  const copyPix = () => {
    navigator.clipboard?.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900">Seu Carrinho</h2>
            <span className="text-sm text-gray-400">({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-3 rounded-xl border border-gray-100">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-400">{formatCurrency(item.product.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onQty(item.product.id, -1)}
                          className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onQty(item.product.id, 1)}
                          className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-2">
                Limpar carrinho
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Total</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>

            {/* Pix */}
            <div className="p-3 rounded-xl bg-white border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-gray-700">Pix Copia e Cola</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-gray-500 bg-gray-50 px-2 py-1.5 rounded truncate">
                  {pixPayload.substring(0, 45)}...
                </code>
                <button
                  onClick={copyPix}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Chave Pix ({config.pixKeyType.toUpperCase()}): <span className="font-mono">{config.pixKey}</span>
              </p>
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Finalizar Pedido via WhatsApp
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
