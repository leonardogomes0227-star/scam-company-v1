import { useMemo, useRef, useState } from 'react';
import { Copy, Edit3, ImagePlus, Link2, Loader2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Select, Textarea, cx } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { supabase } from '../../supabaseClient';
import { formatBRL, generateId, parseVariants } from '../../lib/format';
import { MIGRATION_HINT, writeWithFallback } from '../../lib/db';
import { compressImage, dataUrlKB } from '../../lib/image';
import type { Product } from '../../types';
import type { StoreData } from './useStoreData';


type Draft = { id?: string; name: string; price: string; comparePrice: string; stock: string; category: string; description: string; image: string; variants: string; featured: boolean };
const emptyDraft: Draft = { name: '', price: '', comparePrice: '', stock: '', category: '', description: '', image: '', variants: '', featured: false };

const toDraft = (p: Product): Draft => ({
  name: p.name,
  price: String(p.price),
  comparePrice: p.compare_price ? String(p.compare_price) : '',
  stock: String(p.stock),
  category: p.category || '',
  description: p.description || '',
  image: p.image || '',
  variants: p.variants || '',
  featured: !!p.featured,
});

export default function Products({ data, tenantId }: { data: StoreData; tenantId: string }) {
  const toast = useToast();
  const { products, setProducts } = data;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category || 'Geral'))).sort(), [products]);

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (category !== 'Todas' && (p.category || 'Geral') !== category) return false;
    if (stockFilter === 'low' && !(p.stock > 0 && p.stock <= 3)) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    return true;
  });

  const openNew = () => setDraft({ ...emptyDraft, category: categories[0] || '' });
  const openEdit = (p: Product) => setDraft({ id: p.id, ...toDraft(p) });
  const duplicate = (p: Product) => setDraft({ ...toDraft(p), name: `${p.name} (cópia)` });

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft) return;
    setProcessingImage(true);
    try {
      const image = await compressImage(file);
      setDraft((d) => (d ? { ...d, image } : d));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível usar esta imagem.', true);
    } finally {
      setProcessingImage(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const price = parseFloat(draft.price.replace(',', '.'));
    if (!draft.name.trim() || !(price > 0)) {
      toast('Informe o nome e um preço válido.', true);
      return;
    }
    const comparePrice = parseFloat(draft.comparePrice.replace(',', '.'));
    if (draft.comparePrice.trim() && !(comparePrice > price)) {
      toast('O preço "de" precisa ser maior que o preço atual.', true);
      return;
    }
    const variants = parseVariants(draft.variants).join(', ');
    const payload = {
      name: draft.name.trim(),
      price,
      stock: Math.max(0, parseInt(draft.stock) || 0),
      category: draft.category.trim() || 'Geral',
      description: draft.description.trim() || null,
      image: draft.image.trim() || null,
      variants: variants || null,
      compare_price: comparePrice > price ? comparePrice : null,
      featured: draft.featured,
    };
    const optional: (keyof typeof payload)[] = ['variants', 'compare_price', 'featured'];

    setSaving(true);
    if (draft.id) {
      const id = draft.id;
      const { error, degraded } = await writeWithFallback((data) => supabase.from('products').update(data).eq('id', id), payload, optional);
      setSaving(false);
      if (error) return toast('Erro ao salvar: ' + error.message, true);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...payload } : p)));
      toast(degraded ? MIGRATION_HINT : 'Produto atualizado!', degraded);
    } else {
      const newProduct = { id: generateId(), tenant_id: tenantId, ...payload };
      const { error, degraded } = await writeWithFallback((data) => supabase.from('products').insert([data]), newProduct, optional);
      setSaving(false);
      if (error) return toast('Erro ao cadastrar: ' + error.message, true);
      setProducts((prev) => [{ ...newProduct, created_at: new Date().toISOString() }, ...prev]);
      toast(degraded ? MIGRATION_HINT : 'Produto cadastrado!', degraded);
    }
    setDraft(null);
  };

  const copyProductLink = async (p: Product) => {
    const url = `${window.location.origin}${window.location.pathname}#/loja/${encodeURIComponent(tenantId)}/p/${encodeURIComponent(p.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link do produto copiado! Cole no Instagram ou WhatsApp.');
    } catch {
      prompt('Copie o link do produto:', url);
    }
  };

  const quickStock = async (p: Product, delta: number) => {
    const stock = Math.max(0, p.stock + delta);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock } : x)));
    const { error } = await supabase.from('products').update({ stock }).eq('id', p.id);
    if (error) {
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: p.stock } : x)));
      toast('Erro ao atualizar estoque: ' + error.message, true);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', toDelete.id);
    if (error) return toast('Erro ao remover: ' + error.message, true);
    setProducts((prev) => prev.filter((p) => p.id !== toDelete.id));
    toast('Produto removido.');
    setToDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Produtos</h1>
          <p className="text-ink-muted mt-1">{products.length} cadastrados · {products.filter((p) => p.stock <= 0).length} esgotados</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Novo produto</Button>
      </div>

      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto" className="pl-10" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
            <option>Todas</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)} className="sm:w-44">
            <option value="all">Todo estoque</option>
            <option value="low">Estoque baixo</option>
            <option value="out">Esgotados</option>
          </Select>
        </div>
      )}

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="Cadastre seu primeiro produto" description="Adicione foto, preço e estoque. Ele aparece na vitrine na hora." action={<Button onClick={openNew}><Plus className="w-4 h-4" /> Novo produto</Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Search className="w-6 h-6" />} title="Nenhum produto encontrado" description="Ajuste a busca ou os filtros." />
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {filtered.map((p) => (
              <li key={p.id} className="flex items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-black/[0.015]">
                {p.image ? (
                  <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-black/[0.04] shrink-0" />
                ) : (
                  <span className="w-14 h-14 rounded-xl bg-black/[0.04] text-ink-soft flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></span>
                )}
                <button onClick={() => openEdit(p)} className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{p.category || 'Geral'}</p>
                  <p className="sm:hidden text-sm font-semibold mt-1">{formatBRL(p.price)}</p>
                </button>
                <span className="hidden sm:block w-28 text-right text-sm font-semibold tabular-nums">{formatBRL(p.price)}</span>
                <div className="hidden md:flex items-center gap-1 w-36 justify-center">
                  <button onClick={() => quickStock(p, -1)} disabled={p.stock <= 0} className="w-7 h-7 rounded-lg border border-black/10 text-ink-muted hover:text-ink disabled:opacity-30" aria-label="Diminuir estoque">−</button>
                  <span className="w-16 text-center">
                    <Badge tone={p.stock <= 0 ? 'red' : p.stock <= 3 ? 'amber' : 'green'}>{p.stock <= 0 ? 'Esgotado' : `${p.stock} un.`}</Badge>
                  </span>
                  <button onClick={() => quickStock(p, 1)} className="w-7 h-7 rounded-lg border border-black/10 text-ink-muted hover:text-ink" aria-label="Aumentar estoque">+</button>
                </div>
                <span className="md:hidden"><Badge tone={p.stock <= 0 ? 'red' : p.stock <= 3 ? 'amber' : 'green'}>{p.stock <= 0 ? 'Esgotado' : p.stock}</Badge></span>
                <div className="flex items-center">
                  <IconAction label="Copiar link do produto" onClick={() => copyProductLink(p)}><Link2 className="w-4 h-4" /></IconAction>
                  <IconAction label="Editar" onClick={() => openEdit(p)}><Edit3 className="w-4 h-4" /></IconAction>
                  <span className="hidden sm:inline-flex"><IconAction label="Duplicar" onClick={() => duplicate(p)}><Copy className="w-4 h-4" /></IconAction></span>
                  <IconAction label="Excluir" danger onClick={() => setToDelete(p)}><Trash2 className="w-4 h-4" /></IconAction>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {draft && (
        <Modal
          title={draft.id ? 'Editar produto' : 'Novo produto'}
          onClose={() => setDraft(null)}
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDraft(null)}>Cancelar</Button>
              <Button type="submit" form="product-form" loading={saving} disabled={processingImage}>{draft.id ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
            </div>
          }
        >
          <form id="product-form" onSubmit={save} className="grid md:grid-cols-[220px_1fr] gap-6">
            <div className="space-y-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full aspect-square rounded-2xl border-2 border-dashed border-black/10 hover:border-brand-400 bg-black/[0.02] overflow-hidden flex flex-col items-center justify-center gap-2 text-ink-muted text-sm">
                {processingImage ? <><Loader2 className="w-6 h-6 animate-spin" /> Otimizando foto...</> : draft.image ? <img src={draft.image} alt="Prévia" className="w-full h-full object-cover" /> : <><ImagePlus className="w-7 h-7" /> Enviar foto<span className="text-xs text-ink-soft">Qualquer tamanho — otimizamos para você</span></>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <Input placeholder="...ou cole o link da imagem" value={draft.image.startsWith('data:') ? '' : draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="h-9 text-xs" />
              {draft.image && (
                <div className="flex items-center justify-between text-xs">
                  {draft.image.startsWith('data:') ? <span className="text-ink-soft">Foto otimizada · {dataUrlKB(draft.image)} KB</span> : <span />}
                  <button type="button" onClick={() => setDraft({ ...draft, image: '' })} className="text-red-600 hover:underline">Remover</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Field label="Nome do produto">
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: Vestido Midi Azul" required autoFocus />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Preço (R$)">
                  <Input inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="0,00" required />
                </Field>
                <Field label="Preço “de” (opcional)">
                  <Input inputMode="decimal" value={draft.comparePrice} onChange={(e) => setDraft({ ...draft, comparePrice: e.target.value })} placeholder="Promoção" />
                </Field>
                <Field label="Estoque">
                  <Input type="number" min={0} value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} placeholder="0" />
                </Field>
              </div>
              <Field label="Categoria">
                <Input list="category-options" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Ex: Vestidos" />
                <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field label="Tamanhos / cores (opcional)" hint="Separe por vírgula. O cliente escolhe uma opção antes de comprar. Ex: P, M, G, GG">
                <Input value={draft.variants} onChange={(e) => setDraft({ ...draft, variants: e.target.value })} placeholder="P, M, G" />
              </Field>
              <label className="flex items-center gap-3 rounded-xl border border-black/10 px-3.5 py-3 cursor-pointer">
                <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm"><b className="font-semibold">Destaque na vitrine</b> <span className="text-ink-muted">— aparece na seção “Em destaque”, logo abaixo do banner.</span></span>
              </label>
              <Field label="Descrição" hint="Material, medidas, cuidados... Aparece na página do produto.">
                <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} />
              </Field>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title="Excluir produto?"
          onClose={() => setToDelete(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setToDelete(null)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
            </div>
          }
        >
          <p className="text-sm text-ink-muted">O produto <b className="text-ink">{toDelete.name}</b> será removido da vitrine. Pedidos antigos não são afetados.</p>
        </Modal>
      )}
    </div>
  );
}

function IconAction({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={cx('w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft transition', danger ? 'hover:text-red-600 hover:bg-red-50' : 'hover:text-ink hover:bg-black/[0.04]')}>
      {children}
    </button>
  );
}
