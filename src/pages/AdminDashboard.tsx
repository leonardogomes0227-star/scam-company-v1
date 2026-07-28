import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, Tag, Settings, Save, Trash2, Plus, TrendingUp, CheckCircle2, BarChart3, DollarSign, HelpCircle, ChevronDown, Download, Eye, MapPin, CreditCard, AlertTriangle, Edit3, Copy, Video, Play, Square, RefreshCcw, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'coupons' | 'orders' | 'analytics' | 'help' | 'videos' | 'settings'>('products');

  const { user, loading: authLoading } = useAuth();
  const tenantId = user?.tenantId;

  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeColor, setStoreColor] = useState('#f59e0b');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active'); // 'active' ou 'pending'
  
  const [toastMessage, setToastMessage] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Geral');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedOrderModal, setSelectedOrderModal] = useState<any>(null);
  // Vídeos & Teleprompter
  const [selectedProductId, setSelectedProductId] = useState('');
  const [videoGoal, setVideoGoal] = useState<'urgencia' | 'desejo' | 'dor'>('urgencia');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };
  // Carregar dados da Nuvem (Supabase)
  useEffect(() => {
    if (!tenantId) return;

    async function loadTenantData() {
      // 1. Buscar dados da loja e status da assinatura
      let { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      if (tenant) {
        setStoreName(tenant.name);
        setStoreAbout(tenant.about || '');
        setStoreWhatsapp(tenant.whatsapp || '');
        setStoreColor(tenant.color || '#f59e0b');
        setSubscriptionStatus(tenant.subscription_status || 'active');
      } else {
        // Criar loja padrão se não existir na nuvem
        await supabase.from('tenants').insert([
          { id: tenantId, name: 'STCK Company', subscription_status: 'active', color: '#f59e0b' }
        ]);
      }
      // 2. Buscar produtos da nuvem
      let { data: cloudProducts } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId);
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
        setSelectedProductId(cloudProducts[0].id);
      } else {
        // Produtos iniciais
        const initial = [
          { id: '1', tenant_id: tenantId, name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, stock: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' },
          { id: '2', tenant_id: tenantId, name: 'Smartwatch 4K', price: 299.90, stock: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Eletrônicos' }
        ];
        await supabase.from('products').insert(initial);
        setProducts(initial);
        setSelectedProductId(initial[0].id);
      }
      // 3. Buscar pedidos da nuvem
      let { data: cloudOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId);
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      } else {
        const initialOrders = [
          { 
            id: 'ORD-101', 
            tenant_id: tenantId,
            customer: 'Mariana Souza', 
            whatsapp: '67999887766',
            address: 'Rua Principal, 150 - Centro',
            payment: 'Pix',
            total: 149.90, 
            status: 'Aguardando Pagamento', 
            date: '2026-07-22' 
          }
        ];
        await supabase.from('orders').insert(initialOrders);
        setOrders(initialOrders);
      }
    }
    loadTenantData();
  }, [tenantId]);
  // Rolagem do Teleprompter
  useEffect(() => {
    let interval: any;
    if (isScrolling && isTeleprompterOpen) {
      interval = setInterval(() => {
        if (teleprompterRef.current) {
          teleprompterRef.current.scrollTop += teleprompterSpeed * 1.5;
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isScrolling, isTeleprompterOpen, teleprompterSpeed]);
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('tenants')
      .update({ name: storeName, about: storeAbout, whatsapp: storeWhatsapp, color: storeColor })
      .eq('id', tenantId);
    if (!error) showToast('Configurações salvas na nuvem com sucesso!');
  };
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    const newProd = {
      id: Date.now().toString(),
      tenant_id: tenantId,
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
      category
    };
    const { error } = await supabase.from('products').insert([newProd]);
    if (!error) {
      setProducts([newProd, ...products]);
      setName('');
      setPrice('');
      setStock('');
      setImage('');
      showToast('Produto cadastrado na nuvem!');
    }
  };
  const handleDeleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
    showToast('Produto removido!');
  };
  const handleOpenEditModal = (prod: any) => {
    setEditingProduct(prod);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
  };
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const newPrice = parseFloat(editPrice) || editingProduct.price;
    const newStock = parseInt(editStock) || 0;
    await supabase
      .from('products')
      .update({ price: newPrice, stock: newStock })
      .eq('id', editingProduct.id);
    setProducts(products.map(p => p.id === editingProduct.id ? { ...p, price: newPrice, stock: newStock } : p));
    setEditingProduct(null);
    showToast('Produto atualizado na nuvem!');
  };
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setOrders(orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
    showToast(`Status atualizado!`);
  };
  const handleCopyStoreLink = () => {
    const storeUrl = `${window.location.origin}/#/loja/${tenantId}`;
    navigator.clipboard.writeText(storeUrl);
    showToast('Link da vitrine copiado!');
  };
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 3);

  // ESTADOS DE CARREGAMENTO / SEM SESSÃO
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400 text-xs">Carregando...</p>
      </div>
    );
  }

  if (!tenantId) {
    window.location.hash = '#/login';
    return null;
  }

  // TELA DE BLOQUEIO CASO A ASSINATURA ESTEJA PENDENTE (CACTUS PAY)
  if (subscriptionStatus !== 'active') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-black">Assinatura Pendente</h1>
          <p className="text-xs text-zinc-400">Para liberar o acesso ao painel gerencial, à vitrine online e à fábrica de vídeos, conclua o pagamento da sua assinatura.</p>
        </div>
        <a 
          href="https://pay.cactupay.com/seu-link-de-checkout" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-2xl shadow-xl transition-all"
        >
          Regularizar Assinatura via Cactus Pay
        </a>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-amber-500 selection:text-black" style={{ '--store-color': storeColor } as any}>
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 text-black px-4 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2" style={{ backgroundColor: storeColor }}>
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}
      {/* TELEPROMPTER FULLSCREEN */}
      {isTeleprompterOpen && generatedScript && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col p-6 sm:p-12">
          <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black" style={{ color: storeColor }}>TELEPROMPTER ATIVO</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Velocidade:</span>
                <input 
                  type="range" min="1" max="5" value={teleprompterSpeed} 
                  onChange={e => setTeleprompterSpeed(Number(e.target.value))}
                  className="cursor-pointer" style={{ accentColor: storeColor }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsScrolling(!isScrolling)} 
                className="px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 text-black transition-all"
                style={{ backgroundColor: isScrolling ? '#ef4444' : storeColor }}
              >
                {isScrolling ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isScrolling ? 'Pausar' : 'Iniciar'}
              </button>
              <button onClick={() => { setIsTeleprompterOpen(false); setIsScrolling(false); }} className="px-4 py-2 bg-zinc-800 text-white font-bold text-xs rounded-xl">✕ Fechar</button>
            </div>
          </div>
          <div ref={teleprompterRef} className="flex-1 overflow-y-auto max-w-4xl mx-auto text-center space-y-12 px-6 py-20">
            <h2 className="text-3xl sm:text-5xl font-black" style={{ color: storeColor }}>{generatedScript.title}</h2>
            <div className="text-2xl sm:text-4xl font-bold text-white leading-relaxed space-y-8">
              <p><span className="text-lg block mb-2 uppercase tracking-widest font-black" style={{ color: storeColor }}>[ GANCHO ]</span> {generatedScript.hook}</p>
              <p><span className="text-lg block mb-2 uppercase tracking-widest font-black" style={{ color: storeColor }}>[ CORPO ]</span> {generatedScript.body}</p>
              <p><span className="text-lg block mb-2 uppercase tracking-widest font-black" style={{ color: storeColor }}>[ CTA ]</span> {generatedScript.cta}</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white">Painel da Loja ({storeName})</h1>
            <p className="text-xs text-zinc-400">Banco de Dados em Nuvem Ativo. <span className="italic" style={{ color: storeColor }}>"The World Is Yours"</span></p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleCopyStoreLink} className="flex-1 sm:flex-none px-4 py-2.5 bg-black border border-zinc-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5">
              <Copy className="w-3.5 h-3.5" style={{ color: storeColor }} /> Copiar Link
            </button>
            <a href={`#/loja/${tenantId}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-4 py-2.5 font-black text-xs rounded-xl text-center" style={{ backgroundColor: `${storeColor}15`, color: storeColor, border: `1px solid ${storeColor}30` }}>
              Ver Vitrine ↗
            </a>
          </div>
        </div>
        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          {[
            { id: 'products', label: 'Produtos', icon: Package },
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
            { id: 'analytics', label: 'Relatórios & Estoque', icon: BarChart3 },
            { id: 'videos', label: 'Fábrica de Vídeos', icon: Video },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                style={isActive ? { backgroundColor: storeColor, color: '#000' } : { backgroundColor: '#18181b', color: '#a1a1aa' }}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
        {/* PRODUTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4" style={{ color: storeColor }} /> Cadastrar Produto na Nuvem</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none" required />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none" required />
                <input type="number" placeholder="Estoque" value={stock} onChange={e => setStock(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} className="text-[11px] text-zinc-400 bg-black border border-zinc-800 rounded-xl px-2 py-2 cursor-pointer" />
                <input type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
              </div>
              <button type="submit" className="px-6 py-3 text-black font-black text-xs rounded-xl shadow-lg" style={{ backgroundColor: storeColor }}>Salvar Produto</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-4 flex gap-4 items-center justify-between">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-black shrink-0 border border-zinc-800" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <span className="text-xs font-black" style={{ color: storeColor }}>{formatBRL(p.price)} | Estoque: {p.stock}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEditModal(p)} className="p-2 text-zinc-400 hover:text-white" title="Editar"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-zinc-500 hover:text-red-400" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Pedidos em Nuvem</h3>
                <p className="text-xs text-zinc-400">Gerencie os pedidos que chegam da sua vitrine.</p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{ backgroundColor: `${storeColor}15`, color: storeColor }}>{orders.length} Pedido(s)</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black" style={{ color: storeColor }}>{order.id} - {order.date}</span>
                    <h4 className="text-sm font-bold text-white">Cliente: {order.customer}</h4>
                    <span className="text-xs text-zinc-300 font-bold">Total: {formatBRL(order.total)}</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                    style={{ color: storeColor }}
                  >
                    <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                    <option value="Pago / Separando">Pago / Separando</option>
                    <option value="Enviado / A Caminho">Enviado / A Caminho</option>
                    <option value="Entregue com Sucesso">Entregue com Sucesso</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* FÁBRICA DE VÍDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Video className="w-5 h-5" style={{ color: storeColor }} /> Fábrica de Vídeos & Teleprompter</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.price)})</option>)}
                </select>
                <select value={videoGoal} onChange={e => setVideoGoal(e.target.value as any)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none">
                  <option value="urgencia">🔥 Queima de Estoque</option>
                  <option value="desejo">✨ Lançamento / Desejo</option>
                  <option value="dor">💡 Resolução de Dor</option>
                </select>
              </div>
              <button onClick={() => {
                const prod = products.find(p => p.id === selectedProductId);
                if (!prod) return;
                const priceFormatted = formatBRL(prod.price);
                setGeneratedScript({
                  title: `🔥 Vídeo para ${prod.name}`,
                  hook: `Se você precisa de ${prod.name}, olha isso aqui!`,
                  body: `Produto de alta qualidade saindo por apenas ${priceFormatted}.`,
                  cta: `Clica no link da vitrine e me chama no WhatsApp!`
                });
              }} className="w-full py-3.5 text-black font-black text-xs rounded-xl shadow-lg" style={{ backgroundColor: storeColor }}>
                Gerar Roteiro Personalizado
              </button>
            </div>
            {generatedScript && (
              <div className="bg-zinc-900 border p-8 rounded-3xl space-y-4" style={{ borderColor: `${storeColor}40` }}>
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <h4 className="text-sm font-black" style={{ color: storeColor }}>{generatedScript.title}</h4>
                  <button onClick={() => setIsTeleprompterOpen(true)} className="px-4 py-2 text-black font-black text-xs rounded-xl shadow-lg" style={{ backgroundColor: storeColor }}>
                    <Play className="w-3.5 h-3.5 fill-black inline mr-1" /> Abrir Teleprompter
                  </button>
                </div>
                <p className="text-xs text-white">{generatedScript.hook}</p>
                <p className="text-xs text-white">{generatedScript.body}</p>
                <p className="text-xs text-white">{generatedScript.cta}</p>
              </div>
            )}
          </div>
        )}
        {/* CONFIGURAÇÕES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-2xl space-y-4">
            <h3 className="text-base font-black text-white">Configurações da Nuvem</h3>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-300 uppercase">Nome da Loja</label>
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-300 uppercase">Cor da Loja</label>
              <input type="color" value={storeColor} onChange={e => setStoreColor(e.target.value)} className="w-12 h-10 bg-black border border-zinc-800 rounded-xl cursor-pointer" />
            </div>
            <button type="submit" className="w-full py-3.5 text-black font-black text-xs rounded-xl shadow-lg" style={{ backgroundColor: storeColor }}>Salvar Configurações</button>
          </form>
        )}
      </div>
    </div>
  );
}
