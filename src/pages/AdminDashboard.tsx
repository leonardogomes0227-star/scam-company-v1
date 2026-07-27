import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, Tag, Settings, Save, Trash2, Plus, TrendingUp, CheckCircle2, BarChart3, DollarSign, HelpCircle, ChevronDown, Download, Eye, MapPin, CreditCard, AlertTriangle, Edit3, Copy, Video, Play, Square, RefreshCcw } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'coupons' | 'orders' | 'analytics' | 'help' | 'videos' | 'settings'>('products');
  
  const currentUser = JSON.parse(localStorage.getItem('saas_auth_user') || '{}');
  const tenantId = currentUser.tenantId || 'lkd-imports';

  const [storeName, setStoreName] = useState('');
  const [storeAbout, setStoreAbout] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeColor, setStoreColor] = useState('#f59e0b');
  
  const [toastMessage, setToastMessage] = useState('');

  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Geral');

  // Estados para Edição de Produto
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [abandonedLeads, setAbandonedLeads] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [selectedOrderModal, setSelectedOrderModal] = useState<any>(null);

  // Estados para a Fábrica de Vídeos & Teleprompter
  const [selectedProductId, setSelectedProductId] = useState('');
  const [videoGoal, setVideoGoal] = useState<'urgencia' | 'desejo' | 'dor'>('urgencia');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2); // 1 a 5
  const [isScrolling, setIsScrolling] = useState(false);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem(`store_config_${tenantId}`) || '{}');
    if (savedConfig.name) setStoreName(savedConfig.name);
    else setStoreName('STCK Company');

    if (savedConfig.about) setStoreAbout(savedConfig.about);
    else setStoreAbout('Encontre os melhores produtos com entrega garantida. The World Is Yours.');

    if (savedConfig.whatsapp) setStoreWhatsapp(savedConfig.whatsapp);
    else setStoreWhatsapp('5567999999999');

    if (savedConfig.color) setStoreColor(savedConfig.color);

    const savedProducts = JSON.parse(localStorage.getItem(`store_products_${tenantId}`) || '[]');
    if (savedProducts.length > 0) {
      setProducts(savedProducts);
      setSelectedProductId(savedProducts[0].id);
    } else {
      const initial = [
        { id: '1', name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, stock: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' },
        { id: '2', name: 'Smartwatch 4K', price: 299.90, stock: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Eletrônicos' }
      ];
      setProducts(initial);
      setSelectedProductId(initial[0].id);
      localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(initial));
    }

    const savedCoupons = JSON.parse(localStorage.getItem(`store_coupons_${tenantId}`) || '[]');
    if (savedCoupons.length > 0) {
      setCoupons(savedCoupons);
    } else {
      const initialCoupons = [{ id: '1', code: 'STCK10', discount: 10 }];
      setCoupons(initialCoupons);
      localStorage.setItem(`store_coupons_${tenantId}`, JSON.stringify(initialCoupons));
    }

    const savedOrders = JSON.parse(localStorage.getItem(`store_orders_${tenantId}`) || '[]');
    if (savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      const initialOrders = [
        { 
          id: 'ORD-101', 
          customer: 'Mariana Souza', 
          whatsapp: '67999887766',
          address: 'Rua Principal, 150 - Centro',
          payment: 'Pix',
          items: [{ name: 'Fone de Ouvido Bluetooth Pro', price: 149.90 }],
          total: 149.90, 
          status: 'Aguardando Pagamento', 
          date: '2026-07-22' 
        }
      ];
      setOrders(initialOrders);
      localStorage.setItem(`store_orders_${tenantId}`, JSON.stringify(initialOrders));
    }

    const leadCart = JSON.parse(localStorage.getItem('scam_abandoned_lead') || 'null');
    if (leadCart) setAbandonedLeads([leadCart]);
  }, [tenantId]);

  // Lógica de Rolagem Automática do Teleprompter
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const configData = { name: storeName, about: storeAbout, whatsapp: storeWhatsapp, color: storeColor };
    localStorage.setItem(`store_config_${tenantId}`, JSON.stringify(configData));
    showToast('Configurações da loja salvas com sucesso!');
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
    setStock('');
    setImage('');
    showToast('Produto cadastrado com sucesso!');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(updated));
    showToast('Produto removido!');
  };

  const handleOpenEditModal = (prod: any) => {
    setEditingProduct(prod);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProducts = products.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          price: parseFloat(editPrice) || p.price,
          stock: parseInt(editStock) || 0
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem(`store_products_${tenantId}`, JSON.stringify(updatedProducts));
    setEditingProduct(null);
    showToast('Produto atualizado com sucesso!');
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount) return;
    const newCoupon = {
      id: Date.now().toString(),
      code: couponCode.toUpperCase().trim(),
      discount: parseFloat(couponDiscount)
    };
    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem(`store_coupons_${tenantId}`, JSON.stringify(updated));
    setCouponCode('');
    setCouponDiscount('');
    showToast('Cupom criado com sucesso!');
  };

  const handleDeleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    localStorage.setItem(`store_coupons_${tenantId}`, JSON.stringify(updated));
    showToast('Cupom removido!');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord);
    setOrders(updatedOrders);
    localStorage.setItem(`store_orders_${tenantId}`, JSON.stringify(updatedOrders));
    showToast(`Status do pedido ${orderId} atualizado para: ${newStatus}`);
  };

  const handleCopyStoreLink = () => {
    const storeUrl = `${window.location.origin}/#/loja/${tenantId}`;
    navigator.clipboard.writeText(storeUrl);
    showToast('Link da vitrine copiado para a área de transferência!');
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast('Nenhum pedido para exportar.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID do Pedido,Cliente,Data,Status,Total (R$)\n";
    orders.forEach(ord => {
      csvContent += `${ord.id},"${ord.customer}",${ord.date},"${ord.status}",${ord.total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_vendas_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório CSV exportado com sucesso!');
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 3);

  // Gerador dinâmico de roteiro baseado no produto escolhido
  const handleGenerateScript = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) {
      showToast('Selecione um produto válido.');
      return;
    }

    const priceFormatted = formatBRL(prod.price);
    let scriptData = { title: '', hook: '', body: '', cta: '' };

    if (videoGoal === 'urgencia') {
      scriptData = {
        title: `🔥 Queima de Estoque: ${prod.name}`,
        hook: `Se você estava esperando o momento certo para garantir o seu ${prod.name}, o momento é agora porque restam poucas unidades!`,
        body: `Olha a qualidade disso aqui. Ele resolve o seu problema no dia a dia, é super durável e está saindo por apenas ${priceFormatted}.`,
        cta: `Clica no link da minha bio ou vitrine, me chama no WhatsApp e garante o seu antes que acabe!`
      };
    } else if (videoGoal === 'desejo') {
      scriptData = {
        title: `✨ Lançamento / Desejo: ${prod.name}`,
        hook: `Olha a lindeza que acabou de chegar reposição aqui na ${storeName}!`,
        body: `Muita gente me pediu e ele voltou. O ${prod.name} tem acabamento impecável, tecnologia de ponta e vai transformar sua rotina por ${priceFormatted}.`,
        cta: `Quer garantir o seu? Clica no botão de comprar da vitrine e fala comigo direto no WhatsApp.`
      };
    } else {
      scriptData = {
        title: `💡 Resolução de Dor: ${prod.name}`,
        hook: `Cansado de passar perrengue com produtos ruins que quebram rápido?`,
        body: `O ${prod.name} veio para resolver exatamente isso. Por apenas ${priceFormatted}, você leva máxima eficiência, garantia e praticidade.`,
        cta: `Não perde tempo, clica no link da vitrine e pede o seu pelo WhatsApp agora mesmo!`
      };
    }

    setGeneratedScript(scriptData);
    showToast('Roteiro gerado com sucesso!');
  };

  const faqList = [
    { 
      q: 'Como faço para divulgar minha vitrine?', 
      a: 'Basta copiar o link da sua vitrine utilizando o botão "Copiar Link" ao lado e colar na bio do seu Instagram ou status do WhatsApp.' 
    },
    { 
      q: 'Como editar um produto existente?', 
      a: 'Na aba Produtos, clique no ícone de edição (lápis) no card do produto para alterar preço e estoque instantaneamente.' 
    }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 sm:p-8 relative selection:bg-amber-500 selection:text-black">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* TELA DO TELEPROMPTER FULLSCREEN */}
      {isTeleprompterOpen && generatedScript && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col p-6 sm:p-12">
          {/* Controles do Teleprompter */}
          <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-amber-400">TELEPROMPTER ATIVO</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Velocidade:</span>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={teleprompterSpeed} 
                  onChange={e => setTeleprompterSpeed(Number(e.target.value))}
                  className="accent-amber-500 cursor-pointer" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsScrolling(!isScrolling)} 
                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${isScrolling ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}
              >
                {isScrolling ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isScrolling ? 'Pausar Rolagem' : 'Iniciar Rolagem'}
              </button>
              <button 
                onClick={() => { setIsTeleprompterOpen(false); setIsScrolling(false); }} 
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl"
              >
                ✕ Fechar
              </button>
            </div>
          </div>

          {/* Texto Rolável Gigante */}
          <div 
            ref={teleprompterRef} 
            className="flex-1 overflow-y-auto max-w-4xl mx-auto text-center space-y-12 px-6 py-20 scrollbar-none"
          >
            <h2 className="text-3xl sm:text-5xl font-black text-amber-400">{generatedScript.title}</h2>
            <div className="text-2xl sm:text-4xl font-bold text-white leading-relaxed space-y-8">
              <p><span className="text-amber-400 text-lg block mb-2 uppercase tracking-widest">[ GANCHO ]</span> {generatedScript.hook}</p>
              <p><span className="text-amber-400 text-lg block mb-2 uppercase tracking-widest">[ CORPO ]</span> {generatedScript.body}</p>
              <p><span className="text-amber-400 text-lg block mb-2 uppercase tracking-widest">[ CHAMADA PARA AÇÃO ]</span> {generatedScript.cta}</p>
            </div>
            <div className="py-20 text-zinc-600 text-sm font-mono">Fim do Roteiro - Posicione o celular e grave!</div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white">Painel da Loja ({storeName})</h1>
            <p className="text-xs text-zinc-400">Gestão gerencial avançada, catálogo e controle de estoque. <span className="text-amber-400 italic">"The World Is Yours"</span></p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleCopyStoreLink}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-black border border-zinc-800 hover:border-amber-500 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" /> Copiar Link
            </button>
            <a href={`#/loja/${tenantId}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-black text-xs rounded-xl transition-all text-center">
              Ver Vitrine ↗
            </a>
          </div>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'coupons' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <Tag className="w-4 h-4" /> Cupons
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'orders' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <ShoppingBag className="w-4 h-4" /> Pedidos
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <BarChart3 className="w-4 h-4" /> Relatórios & Estoque
          </button>
          <button onClick={() => setActiveTab('videos')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'videos' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <Video className="w-4 h-4" /> Fábrica de Vídeos
          </button>
          <button onClick={() => setActiveTab('help')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'help' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <HelpCircle className="w-4 h-4" /> Ajuda
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </div>

        {/* PRODUTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-amber-400" /> Cadastrar Produto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500" required />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500" required />
                <input type="number" placeholder="Estoque" value={stock} onChange={e => setStock(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500" />
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} className="text-[11px] text-zinc-400 bg-black border border-zinc-800 rounded-xl px-2 py-2 cursor-pointer" />
                <input type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10">Salvar Produto</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-4 flex gap-4 items-center justify-between">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-black shrink-0 border border-zinc-800" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                    <span className="text-xs font-black text-amber-400">{formatBRL(p.price)} | Estoque: {p.stock}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEditModal(p)} className="p-2 text-zinc-400 hover:text-amber-400" title="Editar Produto"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-zinc-500 hover:text-red-400" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Edição de Produto */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleSaveEditProduct} className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
              <button type="button" onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xs bg-black px-3 py-1.5 rounded-xl border border-zinc-800">✕</button>
              <h3 className="text-base font-black text-white">Editar Produto</h3>
              <p className="text-xs text-zinc-400 truncate">{editingProduct.name}</p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Preço (R$)</label>
                  <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 mt-1" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Estoque</label>
                  <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 mt-1" required />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg">Salvar Alterações</button>
            </form>
          </div>
        )}

        {/* CUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCoupon} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Tag className="w-4 h-4 text-amber-400" /> Criar Cupom</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Código (ex: PROMO10)" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white uppercase outline-none focus:border-amber-500" required />
                <input type="number" placeholder="Desconto %" value={couponDiscount} onChange={e => setCouponDiscount(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500" required />
              </div>
              <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl">Salvar Cupom</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-black text-white">{coupon.code}</h4>
                    <p className="text-xs text-amber-400 font-bold">{coupon.discount}% de desconto</p>
                  </div>
                  <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
                <h3 className="text-base font-black text-white">Pedidos Recebidos da Vitrine</h3>
                <p className="text-xs text-zinc-400">Inspecione os itens do pedido e altere o status de entrega.</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold">{orders.length} Pedido(s)</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-black text-amber-400">{order.id} - {order.date}</span>
                    <h4 className="text-sm font-bold text-white">Cliente: {order.customer}</h4>
                    <span className="text-xs text-zinc-300 font-bold">Total: {formatBRL(order.total)}</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setSelectedOrderModal(order)}
                      className="px-3 py-2 bg-black border border-zinc-800 hover:border-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> Detalhes
                    </button>

                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 outline-none cursor-pointer"
                    >
                      <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                      <option value="Pago / Separando">Pago / Separando</option>
                      <option value="Enviado / A Caminho">Enviado / A Caminho</option>
                      <option value="Entregue com Sucesso">Entregue com Sucesso</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Detalhes Pedido */}
        {selectedOrderModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <button onClick={() => setSelectedOrderModal(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xs bg-black px-3 py-1.5 rounded-xl border border-zinc-800">✕ Fechar</button>
              <div className="space-y-1 border-b border-zinc-800 pb-3">
                <span className="text-xs font-black text-amber-400">{selectedOrderModal.id}</span>
                <h3 className="text-base font-black text-white">Pedido de {selectedOrderModal.customer}</h3>
                <p className="text-xs text-zinc-400 font-mono">WhatsApp: {selectedOrderModal.whatsapp || 'Não informado'}</p>
              </div>
              <div className="space-y-2 text-xs text-zinc-300">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400 shrink-0" /> <span className="text-white font-bold">Endereço:</span> {selectedOrderModal.address || 'Retirada na loja'}</p>
                <p className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-400 shrink-0" /> <span className="text-white font-bold">Pagamento:</span> {selectedOrderModal.payment || 'Pix'}</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-white uppercase">Itens do Pedido</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedOrderModal.items && selectedOrderModal.items.length > 0 ? (
                    selectedOrderModal.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-black border border-zinc-800 p-2.5 rounded-xl text-xs">
                        <span className="text-white font-bold">{it.name}</span>
                        <span className="text-amber-400 font-black">{formatBRL(it.price)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 bg-black p-3 rounded-xl">Itens registrados no WhatsApp.</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-zinc-800 text-sm font-black">
                <span className="text-zinc-400">Total:</span>
                <span className="text-amber-400">{formatBRL(selectedOrderModal.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* RELATÓRIOS & ESTOQUE */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
              <div>
                <h3 className="text-base font-black text-white">Relatórios e Faturamento</h3>
                <p className="text-xs text-zinc-400">Acompanhe as métricas e o estoque crítico da loja.</p>
              </div>
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
              >
                <Download className="w-4 h-4" /> Exportar Vendas (CSV)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1"><DollarSign className="w-4 h-4 text-amber-400" /> Faturamento Total</span>
                <h3 className="text-2xl font-black text-amber-400">{formatBRL(totalRevenue)}</h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1"><ShoppingBag className="w-4 h-4 text-amber-400" /> Total de Pedidos</span>
                <h3 className="text-2xl font-black text-white">{orders.length}</h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1"><TrendingUp className="w-4 h-4 text-amber-400" /> Ticket Médio</span>
                <h3 className="text-2xl font-black text-white">{formatBRL(averageTicket)}</h3>
              </div>
            </div>

            {/* Alerta de Estoque Crítico */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Alerta de Estoque Crítico ({lowStockProducts.length} itens)
              </h3>
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-zinc-400">Todos os produtos possuem estoque adequado no momento.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lowStockProducts.map(lp => (
                    <div key={lp.id} className="bg-black border border-amber-500/20 p-3 rounded-2xl flex justify-between items-center text-xs">
                      <span className="text-white font-bold truncate">{lp.name}</span>
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 font-bold rounded-xl border border-amber-500/20">
                        Apenas {lp.stock} un.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FÁBRICA DE VÍDEOS & TELEPROMPTER */}
        {activeTab === 'videos' && (
          <div className="space-y-6 max-w-3xl">
            <form onSubmit={handleGenerateScript} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-400" /> Fábrica de Roteiros & Teleprompter
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Selecione um produto do seu catálogo e o objetivo para gerar um roteiro de vídeo pronto para conversão no WhatsApp.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Escolha o Produto</label>
                  <select 
                    value={selectedProductId} 
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.price)})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Objetivo do Vídeo</label>
                  <select 
                    value={videoGoal} 
                    onChange={e => setVideoGoal(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="urgencia">🔥 Queima de Estoque (Urgência)</option>
                    <option value="desejo">✨ Lançamento / Desejo (Novidade)</option>
                    <option value="dor">💡 Resolução de Dor (Utilidade)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Gerar Roteiro Personalizado
              </button>
            </form>

            {/* Exibição do Roteiro Gerado */}
            {generatedScript && (
              <div className="bg-zinc-900 border border-amber-500/30 p-8 rounded-3xl space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <h4 className="text-sm font-black text-amber-400">{generatedScript.title}</h4>
                  <button 
                    onClick={() => setIsTeleprompterOpen(true)}
                    className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" /> Abrir Teleprompter (Gravador)
                  </button>
                </div>

                <div className="space-y-4 text-xs text-zinc-300">
                  <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
                    <span className="text-amber-400 font-bold block uppercase text-[10px]">1. Gancho (0 a 3 segundos)</span>
                    <p className="text-white font-medium">{generatedScript.hook}</p>
                  </div>
                  <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
                    <span className="text-amber-400 font-bold block uppercase text-[10px]">2. Corpo / Argumento de Venda</span>
                    <p className="text-white font-medium">{generatedScript.body}</p>
                  </div>
                  <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
                    <span className="text-amber-400 font-bold block uppercase text-[10px]">3. Chamada para Ação (CTA para o WhatsApp)</span>
                    <p className="text-white font-medium">{generatedScript.cta}</p>
                  </div>
                </div>

                <div className="bg-black/50 border border-zinc-800 p-4 rounded-2xl text-[11px] text-zinc-400">
                  💡 <strong className="text-white">Dica de Edição:</strong> Grave o vídeo utilizando o botão <strong>Teleprompter</strong> acima. Depois, jogue no aplicativo <em>CapCut</em> e ative as <strong>Legendas Automáticas</strong> para estourar de vender no WhatsApp!
                </div>
              </div>
            )}
          </div>
        )}

        {/* AJUDA */}
        {activeTab === 'help' && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-3xl space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2"><HelpCircle className="w-5 h-5 text-amber-400" /> Central de Ajuda & Tutoriais</h3>
            <div className="space-y-3">
              {faqList.map((item, idx) => (
                <div key={idx} className="bg-black border border-zinc-800 rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-4 text-left flex justify-between items-center text-xs font-bold text-white">
                    <span>{item.q}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>
                  {openFaq === idx && <div className="p-4 pt-0 text-xs text-zinc-400 border-t border-zinc-900">{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIGURAÇÕES */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-2xl space-y-4">
            <h3 className="text-base font-black text-white">Configurações da Loja</h3>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500" />
            <button type="submit" className="w-full py-3.5 bg-amber-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10">
              <Save className="w-4 h-4" /> Salvar Configurações
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
