import { useState, useEffect } from 'react';
import { 
  Package, Settings, ShoppingBag, Plus, Trash2, Edit3, 
  Sparkles, Ticket, DollarSign, Users, Copy, Check, Save, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'script' | 'config'>('products');

  // PRODUTOS
  const [products, setProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Fone de Ouvido Bluetooth', price: 149.90, promoPrice: 99.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', variants: ['Preto', 'Branco'] },
      { id: '2', name: 'Smartwatch Esportivo', price: 299.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', variants: ['Preto', 'Cinza'] }
    ];
  });

  // CONFIGURAÇÕES DA LOJA
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

  // CUPONS
  const [coupons, setCoupons] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_coupons');
    return saved ? JSON.parse(saved) : [
      { id: '1', code: 'PRIMEIRACOMPRA', discount: 10, type: 'percent' },
      { id: '2', code: 'FRETEGRATIS', discount: 15, type: 'fixed' }
    ];
  });

  // PEDIDOS (CRM)
  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_orders');
    return saved ? JSON.parse(saved) : [
      { id: '1001', customer: 'João Silva', total: 149.90, status: 'Pago', date: '22/07/2026' },
      { id: '1002', customer: 'Maria Oliveira', total: 299.90, status: 'Pendente', date: '22/07/2026' }
    ];
  });

  // FORMULÁRIO NOVO PRODUTO
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    promoPrice: '',
    category: 'Eletrônicos',
    image: '',
    variants: ''
  });

  // FORMULÁRIO NOVO CUPOM
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percent' });

  // GERADOR DE SCRIPT
  const [selectedProductForScript, setSelectedProductForScript] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<any>(null);

  // ESTADOS DE FEEDBACK
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // PERSISTÊNCIA NO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('store_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('store_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('store_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('store_orders', JSON.stringify(orders));
  }, [orders]);

  // AÇÕES DE PRODUTO
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
      variants: newProduct.variants ? newProduct.variants.split(',').map((v) => v.trim()) : []
    };
    setProducts([...products, item]);
    setNewProduct({ name: '', price: '', promoPrice: '', category: 'Eletrônicos', image: '', variants: '' });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // AÇÕES DE CUPOM
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    setCoupons([...coupons, {
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase().trim(),
      discount: parseFloat(newCoupon.discount),
      type: newCoupon.type
    }]);
    setNewCoupon({ code: '', discount: '', type: 'percent' });
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  // GERAR SCRIPT DE VENDAS
  const handleGenerateScript = () => {
    const prod = products.find((p) => p.id === selectedProductForScript);
    if (!prod) return;
    setGeneratedScript({
      hook: `🔥 Procurando ${prod.name} com o melhor preço do mercado?`,
      demo: `Garantimos entrega rápida, suporte via WhatsApp e pagamento facilitado no Pix!`,
      cta: `Clique no link do perfil e faça seu pedido agora mesmo antes que acabe o estoque!`
    });
  };

  // SALVAR CONFIGURAÇÕES COM FEEDBACK VISUAL
  const handleSaveConfig = () => {
    localStorage.setItem('store_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABEÇALHO DO PAINEL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Settings className="w-7 h-7 text-emerald-400" /> Painel de Controle
            </h1>
            <p className="text-xs text-slate-400 mt-1">Gerencie produtos, pedidos, cupons e inteligência de vendas da sua loja.</p>
          </div>
          
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}
          </button>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ABA: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Cadastrar Produto
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold">Nome do Produto</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    placeholder="Ex: Tênis Esportivo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      placeholder="199.90"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold">Promoção (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.promoPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, promoPrice: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      placeholder="149.90"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold">URL da Imagem</label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold">Variações (Separe por vírgula)</label>
                  <input
                    type="text"
                    value={newProduct.variants}
                    onChange={(e) => setNewProduct({ ...newProduct, variants: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    placeholder="P, M, G, GG ou Preto, Branco"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all">
                  Salvar Produto
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-extrabold text-white">Produtos Cadastrados ({products.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between">
                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <p className="text-xs text-emerald-400 font-black">{formatBRL(p.promoPrice ?? p.price)}</p>
                      {p.variants && p.variants.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate">Opções: {p.variants.join(', ')}</p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: PEDIDOS (CRM) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white">Gestão de Pedidos (CRM)</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Pedido</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="p-4 font-mono text-emerald-400 font-bold">#{o.id}</td>
                      <td className="p-4 text-white font-bold">{o.customer}</td>
                      <td className="p-4 text-slate-400">{o.date}</td>
                      <td className="p-4 font-bold text-white">{formatBRL(o.total)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA: CUPONS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-400" /> Criar Cupom
              </h3>
              <form onSubmit={handleAddCoupon} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold">Código do Cupom</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 uppercase"
                    placeholder="EX: PROMO10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold">Desconto</label>
                    <input
                      type="number"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold">Tipo</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="percent">Porcentagem (%)</option>
                      <option value="fixed">Fixo (R$)</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all">
                  Cadastrar Cupom
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-extrabold text-white">Cupons Ativos ({coupons.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">{c.code}</span>
                      <p className="text-xs text-slate-300 mt-2 font-bold">
                        Desconto: {c.type === 'percent' ? `${c.discount}%` : formatBRL(c.discount)}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: GERADOR DE SCRIPT */}
        {activeTab === 'script' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Gerador Inteligente de Script de Vendas
            </h3>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Selecione o Produto:</label>
              <select
                value={selectedProductForScript}
                onChange={(e) => setSelectedProductForScript(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="">-- Escolha um produto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                onClick={handleGenerateScript}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all"
              >
                Gerar Script Copia e Cola
              </button>
            </div>

            {generatedScript && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300 relative">
                <p><strong>Ganchos:</strong> {generatedScript.hook}</p>
                <p><strong>Demonstração:</strong> {generatedScript.demo}</p>
                <p><strong>Chamada para Ação:</strong> {generatedScript.cta}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${generatedScript.hook}\n${generatedScript.demo}\n${generatedScript.cta}`);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold flex items-center gap-2 text-[11px]"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Copiado!' : 'Copiar Texto Completo'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ABA: CONFIGURAÇÕES */}
        {activeTab === 'config' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" /> Configurações da Loja White-Label
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-bold">Nome da Loja</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold">WhatsApp de Vendas (com DDD)</label>
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold">Chave Pix</label>
                <input
                  type="text"
                  value={config.pixKey}
                  onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold">Frete Fixo (R$)</label>
                  <input
                    type="number"
                    value={config.fixedFreight}
                    onChange={(e) => setConfig({ ...config, fixedFreight: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold">Frete Grátis acima de (R$)</label>
                  <input
                    type="number"
                    value={config.freeFreightThreshold}
                    onChange={(e) => setConfig({ ...config, freeFreightThreshold: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar Todas as Configurações
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
