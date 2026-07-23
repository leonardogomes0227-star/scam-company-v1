import { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, CheckCircle2, Search, Store } from 'lucide-react';

export default function Storefront({ tenantId }: { tenantId: string }) {
  const [storeConfig, setStoreConfig] = useState({
    name: 'Carregando...',
    about: '',
    whatsapp: '5567999999999',
    color: '#10b981'
  });

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 1. Verifica se a loja está ativa pelo Super Admin
    const tenants = JSON.parse(localStorage.getItem('saas_tenants') || '[]');
    const currentTenant = tenants.find((t: any) => t.id === tenantId);
    
    if (currentTenant && currentTenant.active === false) {
      setStoreConfig({
        name: 'Loja Temporariamente Indisponível',
        about: 'Esta vitrine está com o acesso suspenso por questões administrativas.',
        whatsapp: '',
        color: '#ef4444'
      });
      return;
    }

    // 2. Carrega as configurações personalizadas da loja
    const savedConfig = JSON.parse(localStorage.getItem(`store_config_${tenantId}`) || '{}');
    if (savedConfig.name) {
      setStoreConfig(savedConfig);
    } else {
      // Fallback padrão amigável baseado no ID
      const defaultName = tenantId === 'lkd-imports' ? 'LKD Imports' : tenantId === 'carbura-ms' ? 'Carbura MS' : 'Loja Virtual';
      setStoreConfig({
        name: defaultName,
        about: 'Os melhores produtos com envio rápido e seguro direto no seu WhatsApp.',
        whatsapp: '5567999999999',
        color: '#10b981'
      });
    }

    // 3. Carrega os produtos da loja
    const savedProducts = JSON.parse(localStorage.getItem(`store_products_${tenantId}`) || '[]');
    if (savedProducts.length > 0) {
      setProducts(savedProducts);
    } else {
      // Produtos iniciais de exemplo se estiver vazio
      const initial = tenantId === 'lkd-imports' ? [
        { id: '1', name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' },
        { id: '2', name: 'Smartwatch Esportivo 4K', price: 299.90, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Eletrônicos' }
      ] : [
        { id: '3', name: 'Capacete Moto Esportivo', price: 450.00, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80', category: 'Acessórios' },
        { id: '4', name: 'Luva de Couro Protetora', price: 120.00, image: 'https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?w=500&q=80', category: 'Acessórios' }
      ];
      setProducts(initial);
    }
  }, [tenantId]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    // Monta a mensagem formatada para o WhatsApp do lojista
    const itemsList = cart.map(i => `• ${i.qty}x ${i.name} - R$ ${(i.price * i.qty).toFixed(2)}`).join('\n');
    const totalFormatted = `R$ ${cartTotal.toFixed(2)}`;
    
    const message = encodeURIComponent(
      `🛒 *Novo Pedido - ${storeConfig.name}*\n\n` +
      `*Cliente:* ${customerName}\n` +
      `*Endereço:* ${customerAddress || 'Retirada / Não informado'}\n\n` +
      `*Itens do Pedido:*\n${itemsList}\n\n` +
      `*Total a Pagar:* ${totalFormatted}`
    );

    const whatsappNumber = storeConfig.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    setOrderSent(true);
    setCart([]);
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-24">
      
      {/* Header Dinâmico da Vitrine com a Cor Personalizada */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-lg"
              style={{ backgroundColor: storeConfig.color }}
            >
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">{storeConfig.name}</h1>
              <p className="text-[11px] text-slate-400 line-clamp-1">{storeConfig.about}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="relative px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg text-slate-950"
              style={{ backgroundColor: storeConfig.color }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Carrinho</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-950 text-white rounded-full text-[10px] flex items-center justify-center border border-slate-800">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar produtos na vitrine..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs text-white outline-none focus:border-slate-700 transition-all shadow-inner"
          />
        </div>

        {/* Grade de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col group hover:border-slate-700 transition-all">
              <div className="aspect-square bg-slate-950 overflow-hidden relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 border border-slate-800">
                  {product.category || 'Destaque'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-base font-black mt-1" style={{ color: storeConfig.color }}>
                    {formatBRL(product.price)}
                  </p>
                </div>

                <button 
                  onClick={() => addToCart(product)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 text-slate-950"
                  style={{ backgroundColor: storeConfig.color }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Drawer / Modal do Carrinho */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" style={{ color: storeConfig.color }} /> Seu Carrinho
                </h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-xs text-slate-400 hover:text-white font-bold">Fechar ✕</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-xs text-slate-400">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-slate-900" />
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                          <p className="text-xs font-black text-slate-300">{formatBRL(item.price)} x {item.qty}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 text-xs font-bold p-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="space-y-4 pt-6 border-t border-slate-800 mt-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Seu Nome / Contato</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Carlos Silva" 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)} 
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-slate-600" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço de Entrega</label>
                    <input 
                      type="text" 
                      placeholder="Rua, Número, Bairro" 
                      value={customerAddress} 
                      onChange={e => setCustomerAddress(e.target.value)} 
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-slate-600" 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-bold text-slate-400">Total do Pedido:</span>
                  <span className="text-base font-black text-white">{formatBRL(cartTotal)}</span>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 text-slate-950"
                  style={{ backgroundColor: storeConfig.color }}
                >
                  <MessageCircle className="w-4 h-4" /> Enviar Pedido via WhatsApp
                </button>
              </form>
            )}

            {orderSent && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center space-y-2 mt-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-black text-white">Pedido Encaminhado!</h4>
                <p className="text-[11px] text-slate-400">O WhatsApp foi aberto com os detalhes da sua compra.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
