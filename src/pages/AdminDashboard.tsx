import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Tag, Settings, Save, Trash2, Plus, AlertTriangle, Users, TrendingUp, ShieldCheck, BarChart3, MessageCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'abandoned' | 'settings'>('products');
  
  const currentUser = JSON.parse(localStorage.getItem('saas_auth_user') || '{}');
  const tenantId = currentUser.tenantId || 'lkd-imports';

  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeColor, setStoreColor] = useState('#10b981');
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        { id: '1', name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, stock: 3, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' }
      ];
      setProducts(initial);
      localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(initial));
    }

    // Carrega leads de carrinhos abandonados salvos no navegador
    const leadCart = JSON.parse(localStorage.getItem('scam_abandoned_lead') || 'null');
    if (leadCart) {
      setAbandonedLeads([leadCart]);
    } else {
      // Exemplo para testes caso esteja vazio
      setAbandonedLeads([
        { name: 'Carlos Eduardo', whatsapp: '67999887766', items: [{ name: 'Fone Pro' }], timestamp: new Date().toISOString() }
      ]);
    }
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

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div>
            <h1 className="text-2xl font-black text-white">Painel da Loja ({storeName})</h1>
            <p className="text-xs text-slate-400">Gestão de estoque e recuperação de carrinhos abandonados.</p>
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
          <button onClick={() => setActiveTab('abandoned')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'abandoned' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <TrendingUp className="w-4 h-4" /> Carrinhos Abandonados ({abandonedLeads.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <ShoppingBag className="w-4 h-4" /> Pedidos
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </div>

        {/* PRODUTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Cadastrar Produto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                <input type="number" placeholder="Estoque" value={stock} onChange={e => setStock(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 cursor-pointer" />
                <input type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" />
              </div>
              <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all">Salvar Produto</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 flex gap-4 items-center">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-slate-950" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <span className="text-xs font-black text-slate-300">{formatBRL(p.price)} | Estoque: {p.stock}</span>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CARRINHOS ABANDONADOS (RECUPERAÇÃO ATIVA) */}
        {activeTab === 'abandoned' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Recuperação de Vendas Perdidas
                </h3>
                <p className="text-xs text-slate-400">Clientes que iniciaram o checkout mas não finalizaram. Resgate pelo WhatsApp com 1 clique.</p>
              </div>
            </div>

            {abandonedLeads.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-xs text-slate-500">
                Nenhum carrinho abandonado registrado recentemente.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {abandonedLeads.map((lead, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Lead Quente 🛒</span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" /> {lead.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-300">WhatsApp: {lead.whatsapp}</p>
                    </div>

                    <a 
                      href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.name)},%20notamos%20que%20você%20quase%20garantiu%20seu%20pedido%20na%20${encodeURIComponent(storeName)}!%20Ainda%20tem%20interesse?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <MessageCircle className="w-4 h-4" /> Resgatar no WhatsApp ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OUTRAS ABAS */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-xs text-slate-400">
            Painel de pedidos integrado.
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-2xl space-y-4">
            <h3 className="text-base font-black text-white">Configurações da Loja</h3>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white" />
            <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">Salvar</button>
          </form>
        )}

      </div>
    </div>
  );
}
