import { useState, useMemo } from 'react';
import { Product, StoreConfig, AdminTab } from '@/types';
import { formatCurrency, CATEGORIES, generateScript } from '@/data';

import {
  Package, BrainCircuit, Settings, Plus, Pencil, Trash2, Check, X,
  Search, Copy, Sparkles, MessageCircle, Save, Store, Power, Video, Music, Type
} from 'lucide-react';

interface AdminProps {
  products: Product[];
  config: StoreConfig;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onToggleProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateConfig: (c: StoreConfig) => void;
}

const TABS: { id: AdminTab; label: string; icon: typeof Package }[] = [
  { id: 'produtos', label: 'Gestão de Produtos', icon: Package },
  { id: 'ia', label: 'Estúdio de IA', icon: BrainCircuit },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminDashboard(props: AdminProps) {
  const [tab, setTab] = useState<AdminTab>('produtos');

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-gray-100 p-4">
        <div className="px-2 mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Painel do Lojista</h2>
        </div>
        <nav className="space-y-1 flex-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">
          <p className="font-semibold mb-0.5">Plano Demonstração</p>
          <p className="opacity-80">Todos os recursos ativos</p>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed top-16 inset-x-0 z-30 bg-white border-b border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-emerald-600 text-white' : 'text-gray-600 bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-8">
        {tab === 'produtos' && <ProductsTab {...props} />}
        {tab === 'ia' && <IATab products={props.products} />}
        {tab === 'configuracoes' && <ConfigTab config={props.config} onUpdateConfig={props.onUpdateConfig} />}
      </main>
    </div>
  );
}

/* ============ PRODUCTS TAB ============ */

function ProductsTab({
  products, onAddProduct, onUpdateProduct, onToggleProduct, onDeleteProduct,
}: AdminProps) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setShowForm(true);
  };
  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500">{products.length} itens no catálogo</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-40 sm:w-56"
            />
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <span className="font-medium text-sm text-gray-900 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm text-gray-900">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500">{p.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleProduct(p.id)}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {p.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onToggleProduct(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition-colors">
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onClose={closeForm}
          onSave={(p) => {
            if (editing) onUpdateProduct(p);
            else onAddProduct(p);
            closeForm();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product, onClose, onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<Product>(
    product ?? {
      id: String(Date.now()),
      name: '',
      description: '',
      price: 0,
      category: CATEGORIES[1],
      image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
      active: true,
      stock: 0,
    }
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Nome">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Descrição">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$)">
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="input" />
            </Field>
            <Field label="Estoque">
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.active ? 'true' : 'false'} onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })} className="input">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </Field>
          </div>
          <Field label="URL da Imagem">
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
          </Field>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

/* ============ IA TAB ============ */

function IATab({ products }: { products: Product[] }) {
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? '');
  const [tone, setTone] = useState<ToneOfVoice>('urgencia');
  const [scriptResult, setScriptResult] = useState<GeneratedScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = products.find((p) => p.id === selectedId);

  const TONES: { id: ToneOfVoice; label: string }[] = [
    { id: 'direto', label: '🎯 Direto' },
    { id: 'urgencia', label: '🔥 Urgência' },
    { id: 'humor', label: '😂 Humor' },
    { id: 'autoridade', label: '⭐ Autoridade' },
    { id: 'provocador', label: '😈 Provocador' },
  ];

  const handleGenerate = () => {
    if (!selected) return;
    setLoading(true);
    setScriptResult(null);
    setTimeout(() => {
      setScriptResult(generateScript(selected, tone));
      setLoading(false);
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estúdio de IA</h1>
        <p className="text-sm text-gray-500">Gere roteiros completos para Reels e TikTok com instruções de câmera e áudio.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">1. Selecione um produto</label>
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setScriptResult(null); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">2. Escolha o Tom de Voz</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tone === t.id
                    ? 'bg-emerald-600 text-white shadow-sm scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selected || loading}
          className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Criando Roteiro Perfeito...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar Roteiro Completo
            </>
          )}
        </button>
      </div>

      {/* Output */}
      {scriptResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-600" />
              Roteiro Gerado
            </h3>
            <button
              onClick={() => handleCopy(scriptResult.caption)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Legenda'}
            </button>
          </div>

          {/* Timeline Blocks */}
          <div className="grid md:grid-cols-3 gap-4">
            {scriptResult.blocks.map((block, i) => {
              const styles = [
                { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
                { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
              ];
              const s = styles[i] || styles[0];
              return (
                <div key={i} className={`p-5 rounded-2xl border-2 ${s.border} ${s.bg} flex flex-col justify-between space-y-3`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold tracking-wider uppercase ${s.text}`}>{block.label}</span>
                      <span className="text-xs text-gray-400 font-mono">{block.time}</span>
                    </div>

                    {/* Camera Instruction */}
                    <div className="flex items-start gap-1.5 text-xs text-gray-500 bg-white/70 p-2 rounded-lg mb-2 border border-gray-100">
                      <Video className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span>{block.visualInstruction}</span>
                    </div>

                    {/* Audio Fala */}
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                      "{block.text}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caption & Music Suggestions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-900">
                <Type className="w-4 h-4 text-emerald-600" />
                Legenda Pronta para Postar
              </div>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {scriptResult.caption}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-900">
                <Music className="w-4 h-4 text-emerald-600" />
                Sugestão de Áudio
              </div>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {scriptResult.audioSuggestion}
              </p>
            </div>
          </div>
        </div>
      )}

      {!scriptResult && !loading && (
        <div className="text-center py-16 text-gray-400">
          <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Selecione um produto, um tom de voz e clique para gerar o roteiro completo.</p>
        </div>
      )}
    </div>
  );
}

/* ============ CONFIG TAB ============ */

function ConfigTab({
  config, onUpdateConfig,
}: {
  config: StoreConfig;
  onUpdateConfig: (c: StoreConfig) => void;
}) {
  const [form, setForm] = useState<StoreConfig>(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Detalhes da loja, contato e pagamento.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Store */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Detalhes da Loja</h3>
          </div>
          <div className="space-y-4">
            <Field label="Nome da loja">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </Field>
            <Field label="Sobre / Descrição">
              <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={2} className="input" />
            </Field>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">WhatsApp</h3>
          </div>
          <Field label="Número (com DDI e DDD, ex: 5511999999999)">
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" />
          </Field>
        </div>

        {/* Pix */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">P</span>
            <h3 className="font-semibold text-gray-900">Pix</h3>
          </div>
          <div className="space-y-4">
            <Field label="Tipo da chave">
              <select
                value={form.pixKeyType}
                onChange={(e) => setForm({ ...form, pixKeyType: e.target.value as StoreConfig['pixKeyType'] })}
                className="input"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Aleatória</option>
              </select>
            </Field>
            <Field label="Chave Pix">
              <input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} className="input" />
            </Field>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar Configurações
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <Check className="w-4 h-4" />
              Salvo com sucesso!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
