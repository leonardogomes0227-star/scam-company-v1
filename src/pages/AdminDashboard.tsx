import { useState, useEffect } from 'react';
import { Product, StoreConfig } from '../types';
import { generateScript } from '../data';
import { 
  Package, Settings, Sparkles, Check, Copy, Layers, Clock, Music, FileText, 
  Lock, Mail, User, LogOut, ArrowRight, ShieldCheck, Plus, Trash2 
} from 'lucide-react';

interface AdminDashboardProps {
  products?: Product[];
  config?: StoreConfig;
  onUpdateProducts?: (products: Product[]) => void;
  onUpdateConfig?: (config: StoreConfig) => void;
}

export default function AdminDashboard(props: AdminDashboardProps) {
  // Autenticação Simples / Persistência
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');

  // Estados dos Produtos e Config
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

  // Modal de Novo Produto
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Eletrônicos');

  // Estado do Gerador de Roteiros
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('Persuasivo');
  const [selectedDuration, setSelectedDuration] = useState<string>('15s');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Salvar no LocalStorage
  useEffect(() => {
    localStorage.setItem('store_products', JSON.stringify(products));
    if (props.onUpdateProducts) props.onUpdateProducts(products);
  }, [products]);

  useEffect(() => {
    localStorage.setItem('store_config', JSON.stringify(config));
    if (props.onUpdateConfig) props.onUpdateConfig(config);
  }, [config]);

  // Handlers de Login / Cadastro
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isRegistering && storeNameInput) {
      setConfig((prev) => ({ ...prev, name: storeNameInput }));
    }

    setIsAuthenticated(true);
    localStorage.setItem('is_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_logged_in');
  };

  // Adicionar e Deletar Produtos
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: newProdName,
      price: parseFloat(newProdPrice),
      image: newProdImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
      category: newProdCategory,
      active: true,
      description: 'Produto de alta qualidade disponível na loja.',
    };

    setProducts([...products, newProduct]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdImg('');
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // Gerar Roteiro IA
  const handleGenerateScript = () => {
    const product = products.find((p) => p.id === selectedProductId) || products[0];
    if (!product) return;
    
    const scriptBase = generateScript(product, selectedTone);
    
    let audioSuggestion = 'Música em alta do Reels / Eletrônica suave';
    if (selectedTone === 'Persuasivo') audioSuggestion = 'Trilha de suspense/impacto rápido em alta no TikTok';
    if (selectedTone === 'Vendedor') audioSuggestion = 'Beat ritmado e animado para vendas';

    const caption = `🔥 ${product.name} disponível na loja!\n\n${product.description || 'Garanta o seu com desconto exclusivo e entrega rápida.'}\n\n👉 Clique no link da bio para pedir no WhatsApp!`;
    const hashtags = `#${product.category?.replace(/\s+/g, '') || 'loja'} #oferta #promocao #${config.name.replace(/\s+/g, '').toLowerCase()} #compras`;

    setGeneratedScript({
      ...scriptBase,
      duration: selectedDuration,
      audioSuggestion,
      caption,
      hashtags
    });
  };

  // 🔑 TELA DE LOGIN / CADASTRO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 pt-20">
        <div className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {isRegistering ? 'Criar Minha Loja' : 'Acessar Painel Admin'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegistering ? 'Preencha os dados abaixo para começar a vender' : 'Entre com sua conta para gerenciar seus produtos e pedidos'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Sua Loja</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={storeNameInput}
                    onChange={(e) => setStoreNameInput(e.target.value)}
                    placeholder="Ex: Minha Loja Virtual"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">E-mail do Lojista</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isRegistering ? 'Criar Loja Agora' : 'Entrar no Painel'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              {isRegistering ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre sua loja'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 PAINEL DO LOJISTA PROTEGIDO
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Topo / Barra de Navegação */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white">{config.name}</h1>
              <p className="text-[11px] text-slate-400">Painel do Lojista Protegido</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Produtos
            </button>

            <button
              onClick={() => setActiveTab('ia')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ia' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Roteiros IA
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'config' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" /> Config
            </button>

            <button
              onClick={handleLogout}
              title="Sair da Conta"
              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 📦 ABA PRODUTOS */}
        {activeTab === 'products' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Seus Produtos ({products.length})</h2>
                <p className="text-xs text-slate-400">Gerencie o estoque e valores exibidos na sua vitrine.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Adicionar Produto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-xs text-emerald-400 font-bold">R$ {Number(p.price || 0).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚙️ ABA CONFIGURAÇÕES EDITÁVEIS */}
        {activeTab === 'config' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Configurações da Sua Loja</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nome da Loja</label>
                <input
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">WhatsApp de Vendas (com DDD)</label>
                <input
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Chave Pix</label>
                <input
                  value={config.pixKey}
                  onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 🎬 ABA GERADOR DE ROTEIROS IA */}
        {activeTab === 'ia' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Estúdio de Criativos para Reels & TikTok
              </h2>
              <p className="text-xs text-slate-400 mt-1">Gere roteiros em segundos adaptados para vender seus produtos em vídeos curtos.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Produto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Selecione um produto...</option>
                  {(products || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tom de Voz</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-emerald-500"
                >
                  <option value="Persuasivo">Urgente/Persuasivo (Promoção)</option>
                  <option value="Vendedor">Vendedor (Foco em Benefícios)</option>
                  <option value="Casual">Casual / Curiosidade</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Duração</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-emerald-500"
                >
                  <option value="15s">15 Segundos (Viral)</option>
                  <option value="30s">30 Segundos (Detalhado)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={!selectedProductId && products.length === 0}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Gerar Roteiro + Legenda
            </button>

            {generatedScript && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Roteiro Gerado ({generatedScript.duration})
                  </span>

                  <button
                    onClick={() => {
                      const fullText = `🎬 ROTEIRO DE VÍDEO (${generatedScript.duration})\n\n🎵 Áudio: ${generatedScript.audioSuggestion}\n\n1. GANCHO:\n${generatedScript.hook}\nVisual: ${generatedScript.visualHook}\n\n2. DEMONSTRAÇÃO:\n${generatedScript.demo}\nVisual: ${generatedScript.visualDemo}\n\n3. CTA:\n${generatedScript.cta}\nVisual: ${generatedScript.visualCta}\n\n📝 LEGENDA:\n${generatedScript.caption}\n\n${generatedScript.hashtags}`;
                      navigator.clipboard.writeText(fullText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 hover:bg-slate-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar Roteiro Completo'}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <Music className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Áudio Sugerido:</strong> {generatedScript.audioSuggestion}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">1. Gancho (Hook):</strong>
                    <p className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-200">{generatedScript.hook}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">2. Demonstração:</strong>
                    <p className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-200">{generatedScript.demo}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">3. Chamada para Ação (CTA):</strong>
                    <p className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-200">{generatedScript.cta}</p>
                  </div>
                  <div>
                    <strong className="text-emerald-400 block mb-0.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Legenda do Post:
                    </strong>
                    <p className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-line font-mono text-[11px]">{generatedScript.caption}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL CADASTRAR NOVO PRODUTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-white text-base">Cadastrar Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nome do Produto</label>
                <input required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="Ex: Fone Bluetooth Pro" />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Preço (R$)</label>
                <input required type="number" step="0.01" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="149.90" />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">URL da Imagem</label>
                <input value={newProdImg} onChange={(e) => setNewProdImg(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500" placeholder="https://..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-extrabold rounded-xl">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
