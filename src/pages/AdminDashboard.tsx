import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Tag, Settings, Save, Trash2, Plus, Truck, CheckCircle2, TrendingUp, Users, BarChart3, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'settings' | 'analytics'>('products');
  
  const currentUser = JSON.parse(localStorage.getItem('saas_auth_user') || '{}');
  const tenantId = currentUser.tenantId || 'lkd-imports';

  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeColor, setStoreColor] = useState('#10b981');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados de Produtos com Estoque
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Geral');

  const [orders, setOrders] = useState<any[]>([]);
  const [abandonedLeads, setAbandonedLeads] = useState<any[]>([]);

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem(`store_config_${tenantId}`) || '{}');
    if (savedConfig.name) setStoreName(savedConfig.name);
    else setStoreName('LKD Imports');

    if (savedConfig.about) setStoreAbout(savedConfig.about);
    else setStoreAbout('Encontre os melhores produtos com entrega garantida.');

    if (savedConfig.whatsapp) setStoreWhatsapp(savedConfig.whatsapp);
    else setStoreWhatsapp('5567999999999');

    if (savedConfig.color) setStoreColor(savedConfig.color);

    const savedProducts = JSON.parse(localStorage.getItem(`store_products_${tenantId}`) || '[]');
    if (savedProducts.length > 0) {
      setProducts(savedProducts);
    } else {
      const initial = [
        { id: '1', name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, stock: 3, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' },
        { id: '2', name: 'Smartwatch Esportivo 4K', price: 299.90, stock: 15, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Eletrônicos' }
      ];
      setProducts(initial);
      localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(initial));
    }

    const savedOrders = JSON.parse(localStorage.getItem(`store_orders_${tenantId}`) || '[]');
    if (savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      const initialOrders = [
        { id: 'ORD-101', customer: 'Mariana Souza', total: 149.90, status: 'Aguardando Pagamento', date: '2026-07-22' }
      ];
      setOrders(initialOrders);
      localStorage.setItem(`store_orders_${tenantId}`, JSON.stringify(initialOrders));
    }

    const leadCart = JSON.parse(localStorage.getItem('scam_abandoned_lead') || 'null');
    if (leadCart) setAbandonedLeads([leadCart]);
  }, [tenantId]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const configData = { name: storeName, about: storeAbout, whatsapp: storeWhatsapp, color: storeColor };
    localStorage.setItem(`store_config_${tenantId}`, JSON.stringify(configData));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    const newProd = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
      category
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(updated));
    setName('');
    setPrice('');
    setStock('10');
    setImage('');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(updated));
  };

  const updateOrderStatus = (id: string, newStatus: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem(`store_orders_${tenantId}`, JSON.stringify(updated));
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div>
            <h1 className="text-2xl font-black text-white">Painel da Loja ({storeName})</h1>
            <p className="text-xs text-slate-400">Gerenciamento completo de produtos, estoque e pedidos.</p>
          </div>
          <a href={`#/loja/${tenantId}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-xs rounded-xl transition-all">
            Ver Minha Vitrine ↗
          </a>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <Package className="w-4 h-4" /> Produtos & Estoque
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <ShoppingBag className="w-4 h-4" /> Pedidos & CRM
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <BarChart3 className="w-4 h-4" /> Relatórios
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </div>

        {/* PRODUTOS COM CONTROLE DE ESTOQUE */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Cadastrar Produto com Controle de Estoque</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                <input type="number" placeholder="Qtd. em Estoque" value={stock} onChange={e => setStock(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500/10 file:text-emerald-400 cursor-pointer"
                />

                <input type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" />
              </div>
              <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all">Salvar Produto</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => {
                const isLowStock = p.stock <= 3;
                return (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 flex gap-4 items-center relative">
                    <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-slate-950" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">{p.category}</span>
                      <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-300">{formatBRL(p.price)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isLowStock ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300'}`}>
                          {isLowStock && <AlertTriangle className="w-3 h-3" />} Estoque: {p.stock}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">{orders.length} Pedido(s) registrado(s)</h3>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Relatórios Ativos</h3>
            <p className="text-xs text-slate-400">Controle de estoque e faturamento operando perfeitamente.</p>
          </div>
        )}

        {/* CONFIGURAÇÕES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-2xl space-y-6">
            <h3 className="text-base font-black text-white">Configurações Gerais</h3>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white" />
            <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">Salvar</button>
          </form>
        )}

      </div>
    </div>
  );
}
