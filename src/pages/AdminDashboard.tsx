import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Tag, Settings, Save, Trash2, Plus, Truck, CheckCircle2, TrendingUp, Users, BarChart3, ShieldCheck, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'settings' | 'analytics'>('products');
  
  // Descobre qual é a loja do lojista logado através da sessão
  const currentUser = JSON.parse(localStorage.getItem('saas_auth_user') || '{}');
  const tenantId = currentUser.tenantId || 'lkd-imports';

  // Estados de Configuração da Loja
  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeColor, setStoreColor] = useState('#10b981'); // Verde padrão
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados de Produtos
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Geral');

  // Estados de Pedidos e Carrinhos Abandonados
  const [orders, setOrders] = useState<any[]>([]);
  const [abandonedLeads, setAbandonedLeads] = useState<any[]>([]);

  useEffect(() => {
    // Carrega as configurações salvas da loja
    const savedConfig = JSON.parse(localStorage.getItem(`store_config_${tenantId}`) || '{}');
    if (savedConfig.name) setStoreName(savedConfig.name);
    else setStoreName(tenantId === 'lkd-imports' ? 'LKD Imports' : tenantId === 'carbura-ms' ? 'Carbura MS' : 'Minha Loja');

    if (savedConfig.about) setStoreAbout(savedConfig.about);
    else setStoreAbout('Encontre os melhores produtos com entrega garantida.');

    if (savedConfig.whatsapp) setStoreWhatsapp(savedConfig.whatsapp);
    else setStoreWhatsapp('5567999999999');

    if (savedConfig.color) setStoreColor(savedConfig.color);

    // Carrega produtos simulados ou salvos
    const savedProducts = JSON.parse(localStorage.getItem(`store_products_${tenantId}`) || '[]');
    if (savedProducts.length > 0) {
      setProducts(savedProducts);
    } else {
      const initial = tenantId === 'lkd-imports' ? [
        { id: '1', name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' },
        { id: '2', name: 'Smartwatch Esportivo 4K', price: 299.90, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Eletrônicos' }
      ] : [
        { id: '3', name: 'Capacete Moto Esportivo', price: 450.00, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80', category: 'Acessórios' },
        { id: '4', name: 'Luva de Couro Protetora', price: 120.00, image: 'https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?w=500&q=80', category: 'Acessórios' }
      ];
      setProducts(initial);
      localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(initial));
    }

    // Carrega pedidos salvos do tenant ou cria dados de exemplo
    const savedOrders = JSON.parse(localStorage.getItem(`store_orders_${tenantId}`) || '[]');
    if (savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      const initialOrders = [
        { id: 'ORD-101', customer: 'Mariana Souza', whatsapp: '67999999999', total: 149.90, status: 'Aguardando Pagamento', date: '2026-07-22' },
        { id: 'ORD-102', customer: 'João Pedro', whatsapp: '67988888888', total: 299.90, status: 'Pago / Separando', date: '2026-07-23' }
      ];
      setOrders(initialOrders);
      localStorage.setItem(`store_orders_${tenantId}`, JSON.stringify(initialOrders));
    }

    // Carrega leads de carrinhos abandonados
    const leadCart = JSON.parse(localStorage.getItem('scam_abandoned_lead') || 'null');
    if (leadCart) {
      setAbandonedLeads([leadCart]);
    }
  }, [tenantId]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const configData = { name: storeName, about: storeAbout, whatsapp: storeWhatsapp, color: storeColor };
    localStorage.setItem(`store_config_${tenantId}`, JSON.stringify(configData));
    
    const tenants = JSON.parse(localStorage.getItem('saas_tenants') || '[]');
    const updated = tenants.map((t: any) => t.id === tenantId ? { ...t, name: storeName } : t);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));

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
      image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
      category
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(updated));
    setName('');
    setPrice('');
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

  // Função auxiliar para gerar link do WhatsApp para o cliente do pedido
  const gerarLinkWhatsAppNotificacao = (telefone: string, nomeCliente: string, numeroPedido: string, status: string) => {
    const foneLimpo = (telefone || '67999999999').replace(/\D/g, '');
    const textoMensagem = `Olá, *${nomeCliente}*! Passando para atualizar sobre o seu pedido *${numeroPedido}* na ${storeName}.\n\n` +
      `Status atual: *${status}* 📦\n\nQualquer dúvida, estamos à disposição!`;
    return `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(textoMensagem)}`;
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Cálculo de métricas rápidas para a aba de Analytics
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.status !== 'Cancelado' ? curr.total : 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header do Painel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div>
            <h1 className="text-2xl font-black text-white">Painel da Loja ({storeName})</h1>
            <p className="text-xs text-slate-400">Gerencie sua vitrine, estoque, carrinhos abandonados e relatórios.</p>
          </div>
          <a 
            href={`#/loja/${tenantId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2"
          >
            Ver Minha Vitrine ↗
          </a>
        </div>

        {/* Abas de Navegação */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
            <ShoppingBag className="w-4 h-4" /> Pedidos & CRM
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
            <BarChart3 className="w-4 h-4" /> Relatórios & Vendas
          </button>
          <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'coupons' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
            <Tag className="w-4 h-4" /> Cupons
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
            <Settings className="w-4 h-4" /> Configurações & Visual
          </button>
        </div>

        {/* CONTEÚDO: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Cadastrar Novo Produto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
                
                {/* Seletor de arquivo direto do PC/Celular */}
                <div className="flex flex-col justify-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400">
                  <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">Foto do Produto</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="text-[11px] text-slate-300 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                  />
                </div>

                <input type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" />
              </div>
              <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all">Salvar Produto</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 flex gap-4 items-center">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-slate-950" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{p.category}</span>
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <span className="text-xs font-black text-slate-300">{formatBRL(p.price)}</span>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO: PEDIDOS & CRM + RECUPERAÇÃO */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-white">Gerenciamento de Pedidos</h3>
                  <p className="text-xs text-slate-400">Acompanhe e atualize o status das vendas realizadas na sua vitrine.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold">
                  {orders.length} Pedido(s)
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Nenhum pedido recente</h3>
                  <p className="text-xs text-slate-400">Os pedidos feitos pelos clientes na sua vitrine aparecerão aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-400">{order.id}</span>
                          <span className="text-[10px] text-slate-500">• {order.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Cliente: {order.customer}</h4>
                        <p className="text-xs font-black text-slate-300">Total: {formatBRL(order.total)}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                        <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-cyan-400 font-bold text-xs rounded-xl">
                          {order.status}
                        </span>
                        
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Pago / Separando')}
                            title="Marcar como Pago"
                            className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Enviado')}
                            title="Marcar como Enviado"
                            className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          
                          {/* Botão de Disparo Automático via WhatsApp */}
                          <a 
                            href={gerarLinkWhatsAppNotificacao(order.whatsapp, order.customer, order.id, order.status)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enviar status via WhatsApp"
                            className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloco de Carrinhos Abandonados */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Carrinhos Abandonados (Recuperação)
                  </h3>
                  <p className="text-xs text-slate-400">Clientes que preencheram dados no checkout mas saíram antes de fechar.</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold">
                  {abandonedLeads.length} Lead(s)
                </span>
              </div>

              {abandonedLeads.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center text-xs text-slate-500">
                  Nenhum carrinho abandonado capturado recentemente.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {abandonedLeads.map((lead, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">Lead Capturado</span>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" /> {lead.name}
                        </h4>
                        <p className="text-xs font-mono text-slate-300">WhatsApp: {lead.whatsapp}</p>
                      </div>

                      <a 
                        href={`https://wa.me/${lead.whatsapp}?text=Olá%20${encodeURIComponent(lead.name)},%20notamos%20que%20você%20quase%20finalizou%20sua%20compra%20na%20${encodeURIComponent(storeName)}!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2"
                      >
                        Chamar no WhatsApp ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTEÚDO: RELATÓRIOS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Faturamento Total</span>
                <h3 className="text-2xl font-black text-emerald-400">{formatBRL(totalRevenue)}</h3>
                <p className="text-[11px] text-slate-500">Calculado sobre os pedidos registrados.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Total de Pedidos</span>
                <h3 className="text-2xl font-black text-white">{orders.length}</h3>
                <p className="text-[11px] text-slate-500">Vendas geradas na sua vitrine mobile.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Produtos no Catálogo</span>
                <h3 className="text-2xl font-black text-cyan-400">{products.length}</h3>
                <p className="text-[11px] text-slate-500">Itens ativos para venda imediata.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Saúde do Sistema e Conversão
              </h3>
              <p className="text-xs text-slate-400">
                Sua vitrine está otimizada para conversões diretas via WhatsApp com emissão de Pix instantâneo e automação de mensagens de status.
              </p>
            </div>
          </div>
        )}

        {/* CONTEÚDO: CONFIGURAÇÕES & VISUAL */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-black text-white">Personalização da Loja</h3>
              <p className="text-xs text-slate-400">Altere o nome, descrição e cores da sua vitrine pública.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Nome da Loja</label>
                <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" required />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Texto de Boas-Vindas / Sobre</label>
                <textarea rows={3} value={storeAbout} onChange={e => setStoreAbout(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">WhatsApp para Pedidos (com DDI e DDD)</label>
                <input type="text" value={storeWhatsapp} onChange={e => setStoreWhatsapp(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500" placeholder="5567999999999" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Cor de Destaque da Marca</label>
                <div className="flex items-center gap-3 mt-1">
                  <input type="color" value={storeColor} onChange={e => setStoreColor(e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer" />
                  <span className="text-xs font-mono text-slate-300">{storeColor}</span>
                </div>
              </div>
            </div>

            {saveSuccess && (
              <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
                Alterações salvas com sucesso! Atualize a página da sua vitrine para ver a mudança.
              </p>
            )}

            <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <Save className="w-4 h-4" /> Salvar Alterações da Vitrine
            </button>
          </form>
        )}

        {/* OUTRAS ABAS */}
        {activeTab === 'coupons' && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
            <Tag className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Nenhum cupom ativo</h3>
            <p className="text-xs text-slate-400">Crie descontos personalizados para impulsionar suas vendas.</p>
          </div>
        )}

      </div>
    </div>
  );
}
