import { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateScript, formatCurrency } from '../data';
import { 
  Package, Settings, Sparkles, Check, Copy, Layers, LogOut, 
  ArrowRight, ShieldCheck, Plus, Trash2, Edit2, Eye, MessageCircle, 
  DollarSign, Star, Ticket, ShoppingBag, Save
} from 'lucide-react';

export default function AdminDashboard(props: any) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');

  // Estados dos Dados Persistidos no Navegador
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : (props.products || []);
  });

  const [config, setConfig] = useState<any>(() => {
    const saved = localStorage.getItem('store_config');
    return saved ? JSON.parse(saved) : (props.config || {
      name: 'Minha Loja Digital',
      about: 'Os melhores produtos com entrega rápida.',
      whatsapp: '5567999999999',
      pixKey: '00000000000',
      bannerUrl: '',
      logoUrl: '',
      fixedFreight: 10,
      freeFreightThreshold: 150,
    });
  });

  const [coupons, setCoupons] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_coupons');
    return saved ? JSON.parse(saved) : [
      { id: '1', code: 'PROMO10', discount: 10, type: 'percent' },
      { id: '2', code: 'FRETEGRATIS', discount: 10, type: 'fixed' }
    ];
  });

  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_orders');
    return saved ? JSON.parse(saved) : [
      { id: '1001', customer: 'João Silva', total: 149.90, status: 'Pendente', date: 'Hoje' },
      { id: '1002', customer: 'Maria Oliveira', total: 299.90, status: 'Pago', date: 'Ontem' }
    ];
  });

  const [testimonials, setTestimonials] = useState<any[]>(() => {
    const saved = localStorage.getItem('store_testimonials');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Lucas Andrade', stars: 5, comment: 'Atendimento nota 10, entregaram super rápido!' },
      { id: '2', name: 'Carla Dias', stars: 5, comment: 'Produto de altíssima qualidade. Recomendo demais!' }
    ];
  });

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'testimonials' | 'config' | 'ia'>('products');
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Modais de Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCategory, setProdCategory] = useState('Eletrônicos');
  const [prodVariants, setProdVariants] = useState('P, M, G');

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [cupCode, setCupCode] = useState('');
  const [cupDiscount, setCupDiscount] = useState('');
  const [cupType, setCupType] = useState<'percent' | 'fixed'>('percent');

  // Gerador de Roteiros IA
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('Persuasivo');
  const [selectedDuration, setSelectedDuration] = useState<string>('15s');
  const [generatedScript, setGeneratedScript] = useState<any>(null);

  useEffect(() => { localStorage.setItem('store_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('store_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('store_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('store_testimonials', JSON.stringify(testimonials)); }, [testimonials]);

  const handleSaveConfig = () => {
    localStorage.setItem('store_config', JSON.stringify(config));
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 3000);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && storeNameInput) setConfig((prev: any) => ({ ...prev, name: storeNameInput }));
    setIsAuthenticated(true);
    localStorage.setItem('is_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_logged_in');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    const priceNum = parseFloat(prodPrice);
    const promoNum = prodPromoPrice ? parseFloat(prodPromoPrice) : undefined;
    const variantsArr = prodVariants.split(',').map(v => v.trim()).filter(Boolean);

    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? {
        ...p, name: prodName, price: priceNum, promoPrice: promoNum, image: prodImg || p.image, 
        category: prodCategory, variants: variantsArr
      } : p));
    } else {
      const newProduct: any = {
        id: Date.now().toString(),
        name: prodName,
        price: priceNum,
        promoPrice: promoNum,
        image: prodImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        category: prodCategory,
        variants: variantsArr,
        active: true,
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cupCode || !cupDiscount) return;
    setCoupons([...coupons, { id: Date.now().toString(), code: cupCode.toUpperCase(), discount: parseFloat(cupDiscount), type: cupType }]);
    setCupCode('');
    setCupDiscount('');
    setIsCouponModalOpen(false);
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleGenerateScript = () => {
    const product = products.find((p) => p.id === selectedProductId) || products[0];
    if (!product) return;
    const scriptBase = generateScript(product, selectedTone);
    const caption = `🔥 ${product.name} disponível na loja!\n\nGaranta o seu com desconto e entrega rápida.\n\n👉 Clique no link para pedir no WhatsApp!`;
    const hashtags = `#${product.category?.replace(/\s+/g, '') || 'loja'} #promocao`;
    setGeneratedScript({ ...scriptBase, duration: selectedDuration, caption, hashtags });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">{isRegistering ? 'Criar Minha Loja' : 'Acessar Painel Admin'}</h2>
            <p className="text-xs text-slate-400">Gerencie produtos, cupons e vendas da sua vitrine</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Loja</label>
                <input type="text" required value={storeNameInput} onChange={(e) => setStoreNameInput(e.target.value)} placeholder="Ex: Trendbox Virtual" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">E-mail do Lojista</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500" />
            </div>
            <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2">
              {isRegistering ? 'Criar Loja Agora' : 'Entrar no Painel'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-xs font-bold text-emerald-400 hover:underline">
              {isRegistering ? 'Já tem conta? Faça Login' : 'Não tem conta? Cadastre sua loja'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 pt-4">
        
        {/* TOPO DO PAINEL */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white">{config.name}</h1>
              <p className="text-[11px] text-slate-400">Painel de Gestão Comercial</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'products' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Package className="w-3.5 h-3.5" /> Produtos
            </button>
            <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'orders' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <ShoppingBag className="w-3.5 h-3.5" /> Pedidos
            </button>
            <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'coupons' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Ticket className="w-3.5 h-3.5" /> Cupons
            </button>
            <button onClick={() => setActiveTab('testimonials')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'testimonials' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Star className="w-3.5 h-3.5" /> Depoimentos
            </button>
            <button onClick={() => setActiveTab('ia')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'ia' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Sparkles className="w-3.5 h-3.5" /> Roteiros IA
            </button>
            <button onClick={() => setActiveTab('config')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'config' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Settings className="w-3.5 h-3.5" /> Config
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 ml-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* METRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Eye className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Visitas na Vitrine</p>
              <h3 className="text-xl font-black text-white">312</h3>
            </div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><MessageCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Cliques WhatsApp</p>
              <h3 className="text-xl font-black text-white">54</h3>
            </div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Volume em Vendas</p>
              <h3 className="text-xl font-black text-emerald-400">R$ 3.820,00</h3>
            </div>
          </div>
        </div>

        {/* 📦 ABA PRODUTOS */}
        {activeTab === 'products' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Gestão de Estoque ({products.length})</h2>
                <p className="text-xs text-slate-400">Adicione variações (P/M/G ou Cores) e preços promocionais.</p>
              </div>
              <button onClick={() => { setEditingId(null); setProdName(''); setProdPrice(''); setProdPromoPrice(''); setProdImg(''); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl">
                <Plus className="w-4 h-4" /> Cadastrar Produto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">Opções: {p.variants?.join(', ') || 'Nenhuma'}</p>
                    <p className="text-xs text-emerald-400 font-bold mt-0.5">
                      {p.promoPrice ? (
                        <>
                          <span className="line-through text-slate-500 mr-1.5 text-[10px]">R$ {p.price.toFixed(2)}</span>
                          R$ {p.promoPrice.toFixed(2)}
                        </>
                      ) : `R$ ${p.price.toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(p.id); setProdName(p.name); setProdPrice(p.price.toString()); setProdPromoPrice(p.promoPrice ? p.promoPrice.toString() : ''); setProdImg(p.image); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📋 ABA PEDIDOS (CRM) */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Gerenciador de Pedidos</h2>
            <p className="text-xs text-slate-400">Acompanhe as vendas iniciadas pelos seus clientes no WhatsApp.</p>
            <div className="space-y-3 pt-2">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-white">Pedido #{o.id} - {o.customer}</span>
                    <span className="block text-slate-50
