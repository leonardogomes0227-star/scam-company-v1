import { useState } from 'react';
import { Product, StoreConfig } from '../types';
import { CATEGORIES, generateScript } from '../data';
import { 
  Package, Settings, Sparkles, Plus, Trash2, Edit2, 
  Check, Copy, RefreshCw, Layers 
} from 'lucide-react';

interface AdminDashboardProps {
  products?: Product[];
  config?: StoreConfig;
  onUpdateProducts?: (products: Product[]) => void;
  onUpdateConfig?: (config: StoreConfig) => void;
}

export default function AdminDashboard(props: AdminDashboardProps) {
  // Proteção total contra arrays ou objetos undefined
  const products = props.products || [];
  const config = props.config || {
    name: '',
    about: '',
    whatsapp: '',
    pixKey: '',
    pixKeyType: 'cpf',
  };

  const [activeTab, setActiveTab] = useState<'products' | 'config' | 'ia'>('products');

  // Estado da Aba IA / Roteiros
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('Persuasivo');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Manipulação de Geração de Roteiro
  const handleGenerateScript = () => {
    const product = products.find((p) => p.id === selectedProductId) || products[0];
    if (!product) return;
    const script = generateScript(product, selectedTone);
    setGeneratedScript(script);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header / Navegação */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" /> Painel do Lojista
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" /> Produtos
            </button>

            <button
              onClick={() => setActiveTab('ia')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ia' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Gerador de Roteiros IA
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'config' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" /> Configurações
            </button>
          </div>
        </div>

        {/* 🎬 ABA IA / ROTEIROS */}
        {activeTab === 'ia' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" /> Gerador de Roteiros para Reels/TikTok
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Selecione um produto da sua loja para gerar um roteiro de alta conversão.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Selecione o Produto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Selecione um produto...</option>
                  {/* ✅ Protegido com (products || []) para não quebrar no .map */}
                  {(products || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tom de Voz</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Persuasivo">Persuasivo (Foco em Promoção)</option>
                  <option value="Vendedor">Vendedor (Foco em Benefícios)</option>
                  <option value="Casual">Casual / Informativo</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={!selectedProductId && products.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Gerar Roteiro
            </button>

            {/* Resultado do Roteiro */}
            {generatedScript && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                  <span className="text-xs font-bold text-emerald-800">Roteiro Gerado</span>
                  <button
                    onClick={() => {
                      const text = `HOOK: ${generatedScript.hook}\n\nDEMONSTRAÇÃO: ${generatedScript.demo}\n\nCTA: ${generatedScript.cta}`;
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <strong className="text-emerald-900 block font-bold mb-0.5">1. Gancho (Hook):</strong>
                    <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-emerald-100">{generatedScript.hook}</p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Visual: {generatedScript.visualHook}</span>
                  </div>

                  <div>
                    <strong className="text-emerald-900 block font-bold mb-0.5">2. Demonstração:</strong>
                    <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-emerald-100">{generatedScript.demo}</p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Visual: {generatedScript.visualDemo}</span>
                  </div>

                  <div>
                    <strong className="text-emerald-900 block font-bold mb-0.5">3. Chamada para Ação (CTA):</strong>
                    <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-emerald-100">{generatedScript.cta}</p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Visual: {generatedScript.visualCta}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📦 ABA PRODUTOS */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Seus Produtos ({products.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Protegido com (products || []) */}
              {(products || []).map((p) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-emerald-600 font-bold">R$ {p.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚙️ ABA CONFIGURAÇÕES */}
        {activeTab === 'config' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Configurações da Loja</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nome da Loja</label>
                <input value={config.name} readOnly className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">WhatsApp de Vendas</label>
                <input value={config.whatsapp} readOnly className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
