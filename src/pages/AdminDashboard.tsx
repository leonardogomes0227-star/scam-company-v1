import { useState, useEffect } from 'react';
import {
  Package, Settings, ShoppingBag, Plus, Trash2,
  Sparkles, Ticket, Copy, Check, Save
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'script' | 'config'>('products');

  const [products, setProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Fone de Ouvido Bluetooth', price: 149.90, promoPrice: 99.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', variants: ['Preto', 'Branco'] },
      { id: '2', name: 'Smartwatch Esportivo', price: 299.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', variants: ['Preto', 'Cinza'] }
    ];
  });

  const [config, setConfig] = useState<any>(() => {
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

  const [coupons, setCoupons] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_coupons');
    return saved ? JSON.parse(saved) : [
      { id: '1', code: 'PRIMEIRACOMPRA', discount: 10, type: 'percent' },
      { id: '2', code: 'FRETEGRATIS', discount: 15, type: 'fixed' }
    ];
  });

  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_orders');
    return saved ? JSON.parse(saved) : [
      { id: '1001', customer: 'João Silva', total: 149.90, status: 'Pendente', date: 'Hoje' },
      { id: '1002', customer: 'Maria Oliveira', total: 299.90, status: 'Pago', date: 'Ontem' }
    ];
  });

  const [newProduct, setNewProduct] = useState({ name: '', price: '', promoPrice: '', category: 'Eletrônicos', image: '', variants: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percent' });
  const [selectedProductForScript, setSelectedProductForScript] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => { localStorage.setItem('store_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('store_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('store_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('store_orders', JSON.stringify(orders)); }, [orders]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const item = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      promoPrice: newProduct.promoPrice ? parseFloat(newProduct.promoPrice) : undefined,
      category: newProduct.category,
      image: newProduct.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
      variants: newProduct.variants ? newProduct.variants.split(',').map(v => v.trim()) : []
    };
    setProducts([...products, item]);
    setNewProduct({ name: '', price: '', promoPrice: '', category: 'Eletrônicos', image: '', variants: '' });
  };

  const handleDeleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    setCoupons([...coupons, { id: Date.now().toString(), code: newCoupon.code.toUpperCase().trim(), discount: parseFloat(newCoupon.discount), type: newCoupon.type }]);
    setNewCoupon({ code: '', discount: '', type: 'percent' });
  };

  const handleDeleteCoupon = (id: string) => setCoupons(coupons.filter(c => c.id !== id));

  const handleGenerateScript = () => {
    const prod = products.find(p => p.id === selectedProductForScript);
    if (!prod) return;
    setGeneratedScript({
      hook: `🔥 Procurando ${prod.name} com o melhor preço do mercado?`,
      demo: `Garantimos entrega rápida, suporte via WhatsApp e pagamento facilitado no Pix!`,
      cta: `Clique no link do perfil e faça seu pedido agora mesmo antes que acabe o estoque!`
    });
  };

  const handleSaveConfig = () => {
    localStorage.setItem('store_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Settings className="w-7 h-7 text-emerald-400" /> Painel de Controle
            </h1>
            <p className="text-xs text-slate-400 mt-1">Gerencie produtos, pedidos, cupons e inteligência de vendas.</p>
          </div>
          <button onClick={handleSaveConfig} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2">
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-900">
          {[
            { id: 'products', label: 'Produtos', icon: Package },
            { id: 'orders', label: 'Pedidos (CRM)', icon: ShoppingBag },
            { id: 'coupons', label: 'Cupons', icon: Ticket },
            { id: 'script', label: 'Gerador de Script', icon: Sparkles },
            { id: 'config', label: 'Configurações', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Cadastrar</h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <input type="text" placeholder="Nome do Produto" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" placeholder="Preço" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                  <input type="number" step="0.01" placeholder="Promoção" value={newProduct.promoPrice} onChange={(e) => setNewProduct({...newProduct, promoPrice: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                </div>
                <input type="text" placeholder="URL da Imagem" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                <input type="text" placeholder="Variações (P, M, G)" value={newProduct.variants} onChange={(e) => setNewProduct({...newProduct, variants: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">Salvar Produto</button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-extrabold text-white">Produtos ({products.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between">
                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <p className="text-xs text-emerald-400 font-black">{formatBRL(p.promoPrice ?? p.price)}</p>
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr><th className="p-4">Pedido</th><th className="p-4">Cliente</th><th className="p-4">Total</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="p-4 font-mono text-emerald-400 font-bold">#{o.id}</td>
                    <td className="p-4 text-white font-bold">{o.customer}</td>
                    <td className="p-4 font-bold text-white">{formatBRL(o.total)}</td>
                    <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${o.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
               <form onSubmit={handleAddCoupon} className="space-y-3">
                 <input type="text" placeholder="Código" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white uppercase outline-none focus:border-emerald-500" />
                 <input type="number" placeholder="Desconto" value={newCoupon.discount} onChange={(e) => setNewCoupon({...newCoupon, discount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500" />
                 <select value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500">
                   <option value="percent">Porcentagem (%)</option><option value="fixed">Fixo (R$)</option>
                 </select>
                 <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">Salvar</button>
               </form>
             </div>
             <div className="lg:col-span-2 grid grid-cols-1 gap-4">
                {coupons.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                    <div><span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{c.code}</span></div>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
             <select value={selectedProductForScript} onChange={(e) => setSelectedProductForScript(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500">
                <option value="">-- Escolha um produto --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
             <button onClick={handleGenerateScript} className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">Gerar Script</button>
             {generatedScript && (
               <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
                 <p>{generatedScript.hook}</p>
                 <button onClick={() => setCopiedScript(true)} className="py-2 px-4 bg-slate-900 text-emerald-400 font-bold flex items-center gap-2 rounded-lg">
                   <Copy className="w-3.5 h-3.5" /> {copiedScript ? 'Copiado!' : 'Copiar'}
                 </button>
               </div>
             )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
             <input type="text" placeholder="Nome da Loja" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
             <input type="text" placeholder="WhatsApp" value={config.whatsapp} onChange={(e) => setConfig({...config, whatsapp: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
             <input type="text" placeholder="Pix" value={config.pixKey} onChange={(e) => setConfig({...config, pixKey: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
             <button onClick={handleSaveConfig} className="w-full py-3.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Salvar Configurações</button>
          </div>
        )}
      </div>
    </div>
  );
}
