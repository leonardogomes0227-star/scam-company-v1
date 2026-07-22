import { useState, useEffect } from 'react';
import { Product, StoreConfig } from '../types';
import { generateScript, formatCurrency } from '../data';
import { 
  Package, Settings, Sparkles, Check, Copy, Layers, Clock, Music, FileText, 
  Lock, Mail, User, LogOut, ArrowRight, ShieldCheck, Plus, Trash2, Edit2,
  Eye, MessageCircle, DollarSign, TrendingUp
} from 'lucide-react';

interface AdminDashboardProps {
  products?: Product[];
  config?: StoreConfig;
  onUpdateProducts?: (products: Product[]) => void;
  onUpdateConfig?: (config: StoreConfig) => void;
}

export default function AdminDashboard(props: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('store_products');
    return saved ? JSON.parse(saved) : (props.products || []);
  });

  const [config, setConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('store_config');
    return saved ? JSON.parse(saved) : (props.config || {
      name: 'Minha Loja Digital',
      about: 'Os melhores produtos com entrega rápida.',
      whatsapp: '5567999999999',
      pixKey: '00000000000',
      pixKeyType: 'cpf',
    });
  });

  const [activeTab, setActiveTab] = useState<'products' | 'config' | 'ia'>('products');

  // Modal Novo/Editar Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCategory, setProdCategory] = useState('Eletrônicos');

  // Gerador de Roteiros
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('Persuasivo');
  const [selectedDuration, setSelectedDuration] = useState<string>('15s');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('store_products', JSON.stringify(products));
    if (props.onUpdateProducts) props.onUpdateProducts(products);
  }, [products]);

  useEffect(() => {
    localStorage.setItem('store_config', JSON.stringify(config));
    if (props.onUpdateConfig) props.onUpdateConfig(config);
  }, [config]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && storeNameInput) setConfig((prev) => ({ ...prev, name: storeNameInput }));
    setIsAuthenticated(true);
    localStorage.setItem('is_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_logged_in');
  };

  const openAddModal = () => {
    setEditingId(null);
    setProdName('');
    setProdPrice('');
    setProdPromoPrice('');
    setProdImg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdPromoPrice(p.promoPrice ? p.promoPrice.toString() : '');
    setProdImg(p.image);
    setProdCategory(p.category || 'Eletrônicos');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    const priceNum = parseFloat(prodPrice);
    const promoNum = prodPromoPrice ? parseFloat(prodPromoPrice) : undefined;

    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? {
        ...p, name: prodName, price: priceNum, promoPrice: promoNum, image: prodImg || p.image, category: prodCategory
      } : p));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: prodName,
        price: priceNum,
        promoPrice: promoNum,
        image: prodImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        category: prodCategory,
        active: true,
        description: 'Produto de alta qualidade disponível na loja.',
      };
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleGenerateScript = () => {
    const product = products.find((p) => p.id === selectedProductId) || products[0];
    if (!product) return;
    
    const scriptBase = generateScript(product, selectedTone);
    let audioSuggestion = 'Música em alta do Reels / Eletrônica suave';
    if (selectedTone === 'Persuasivo') audioSuggestion = 'Trilha de suspense/impacto rápido em alta no TikTok';
    if (selectedTone === 'Vendedor') audioSuggestion = 'Beat ritmado e animado para vendas';

    const caption = `🔥 ${product.name} disponível na loja!\n\nGaranta o seu com desconto exclusivo e entrega rápida.\n\n👉 Clique no link da bio para pedir no WhatsApp!`;
    const hashtags = `#${product.category?.replace(/\s+/g, '') || 'loja'} #oferta #promocao #${config.name.replace(/\s+/g, '').toLowerCase()}`;

    setGeneratedScript({ ...scriptBase, duration: selectedDuration, audioSuggestion, caption, hashtags });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">{isRegistering ? 'Criar Minha Loja' : 'Acessar Painel Admin'}</h2>
            <p className="text-xs text-slate-400">Entre com sua conta para gerenciar seus produtos e vendas</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Loja</label>
                <input type="text" required value={storeNameInput} onChange={(e) => setStoreNameInput(e.target.value)} placeholder="Ex: Minha Loja Virtual" className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">E-mail</label>
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
              {isRegistering ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre sua loja'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 pt-4">
        
        {/* Topo do Painel */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white">{config.name}</h1>
              <p className="text-[11px] text-slate-400">Painel do Lojista Autônomo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${activeTab === 'products' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Package className="w-4 h-4" /> Produtos
            </button>
            <button onClick={() => setActiveTab('ia')} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${activeTab === 'ia' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Sparkles className="w-4 h-4" /> Roteiros IA
            </button>
            <button onClick={() => setActiveTab('config')} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${activeTab === 'config' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}>
              <Settings className="w-4 h-4" /> Config
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 ml-2">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 📊 CARDS DE MÉTRICAS DO LOJISTA (Requisito V1) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Eye className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Visitas na Loja</p>
              <h3 className="text-xl font-black text-white">142</h3>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><MessageCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Cliques no WhatsApp</p>
              <h3 className="text-xl font-black text-white">28</h3>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold">Pedidos em Negociação</p>
              <h3 className="text-xl font-black text-emerald-400">R$ 1.840,00</h3>
            </div>
          </div>
        </div>

        {/* 📦 ABA PRODUTOS */}
        {activeTab === 'products' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Seus Produtos ({products.length})</h2>
                <p className="text-xs text-slate-400">Cadastre e edite preços promocionais em tempo real.</p>
              </div>
              <button onClick={openAddModal} className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl">
                <Plus className="w-4 h-4" /> Adicionar Produto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-xs text-emerald-400 font-bold">
                      {p.promoPrice ? (
                        <>
                          <span className="line-through text-slate-500 mr-1.5 text-[10px]">R$ {p.price.toFixed(2)}</span>
                          R$ {p.promoPrice.toFixed(2)}
                        </>
                      ) : (
                        `R$ ${p.price.toFixed(2)}`
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚙️ ABA CONFIGURAÇÕES */}
        {activeTab === 'config' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Configurações da Loja</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nome da Loja</label>
                <input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">WhatsApp de Atendimento</label>
                <input value={config.whatsapp} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Chave Pix</label>
                <input value={config.pixKey} onChange={(e) => setConfig({ ...config, pixKey: e.target.value })} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>
        )}

        {/* 🎬 ABA IA ROTEIROS */}
        {activeTab === 'ia' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-400" /> Estúdio de Criativos IA</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Produto</label>
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none">
                  <option value="">Selecione um produto...</option>
                  {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tom de Voz</label>
                <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none">
                  <option value="Persuasivo">Urgente/Persuasivo</option>
                  <option value="Vendedor">Vendedor</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Duração</label>
                <select value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none">
                  <option value="15s">15s (Viral)</option>
                  <option value="30s">30s (Detalhado)</option>
                </select>
              </div>
            </div>

            <button onClick={handleGenerateScript} className="w-full py-3 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl">
              Gerar Roteiro + Legenda
            </button>

            {generatedScript && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div><strong className="text-emerald-400">1. Gancho:</strong> <p>{generatedScript.hook}</p></div>
                <div><strong className="text-emerald-400">2. Demonstração:</strong> <p>{generatedScript.demo}</p></div>
                <div><strong className="text-emerald-400">3. CTA:</strong> <p>{generatedScript.cta}</p></div>
                <div><strong className="text-emerald-400">Legenda:</strong> <p className="font-mono text-[11px]">{generatedScript.caption}</p></div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL CADASTRAR/EDITAR PRODUTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-white text-base">{editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nome do Produto</label>
                <input required value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" placeholder="Ex: Smartwatch Pro" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Preço Original (R$)</label>
                  <input required type="number" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" placeholder="199.90" />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Preço Promo (R$)</label>
                  <input type="number" step="0.01" value={prodPromoPrice} onChange={(e) => setProdPromoPrice(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" placeholder="149.90 (Opção)" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">URL da Imagem</label>
                <input value={prodImg} onChange={(e) => setProdImg(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" placeholder="https://..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-extrabold rounded-xl">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
