import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ExternalLink, Eye, EyeOff, ImagePlus, Monitor, Plus, Smartphone, Trash2, X } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, cx } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { compressImage } from '../../lib/image';
import { safeColor } from '../../lib/color';
import { formatBRL } from '../../lib/format';
import {
  FONTS, ICON_KEYS, ICON_LABELS, PRESETS, SECTION_LABELS, ensureFont, normalizeCustom, themeStyle, type FontKey, type RadiusKey, type StoreCustom,
} from '../../lib/custom';
import { shippingConfig } from '../../lib/shipping';
import { AnnouncementBar, BenefitsRow, StoreHero, StoreLogo, defaultBenefits } from '../../components/StoreParts';
import { useSaveCustom } from './useSaveCustom';
import type { StoreData } from './useStoreData';

const SWATCHES = ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#2563eb', '#0891b2', '#0E6B4F', '#16a34a', '#111827', '#a16207'];
const BG_SWATCHES = ['', '#faf6f0', '#f4f7fb', '#fff7fb', '#f3f4f6', '#0f1115', '#0b0b0c', '#14110f'];

type Tab = 'tema' | 'marca' | 'banner' | 'catalogo' | 'secoes' | 'rodape';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tema', label: 'Tema' },
  { id: 'marca', label: 'Marca' },
  { id: 'banner', label: 'Banner' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'secoes', label: 'Seções' },
  { id: 'rodape', label: 'Rodapé' },
];

export default function Appearance({ data, tenantId, storeUrl }: { data: StoreData; tenantId: string; storeUrl: string }) {
  const toast = useToast();
  const { tenant, products } = data;
  const { save, saving } = useSaveCustom(data, tenantId);
  const initial = useMemo(() => normalizeCustom(tenant?.custom), [tenant?.custom]);
  const [custom, setCustom] = useState<StoreCustom>(initial);
  const [color, setColor] = useState(safeColor(tenant?.color));
  const [tab, setTab] = useState<Tab>('tema');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [dirty, setDirty] = useState(false);

  const update = (fn: (c: StoreCustom) => StoreCustom) => {
    setCustom((c) => fn(c));
    setDirty(true);
  };
  const set = <K extends keyof StoreCustom>(key: K, value: StoreCustom[K]) => update((c) => ({ ...c, [key]: value }));
  const setHero = (patch: Partial<StoreCustom['hero']>) => update((c) => ({ ...c, hero: { ...c.hero, ...patch } }));
  const setLayout = (patch: Partial<StoreCustom['layout']>) => update((c) => ({ ...c, layout: { ...c.layout, ...patch } }));
  const setFooter = (patch: Partial<StoreCustom['footer']>) => update((c) => ({ ...c, footer: { ...c.footer, ...patch } }));

  const name = tenant?.name ?? 'Sua loja';
  const about = tenant?.about ?? '';
  const ship = shippingConfig({ ...(tenant ?? { id: tenantId, name }), custom });
  ensureFont(custom.font);

  const upload = async (file: File | undefined, apply: (url: string) => void, opts: { maxSide: number; format?: 'jpeg' | 'png' }) => {
    if (!file) return;
    try {
      apply(await compressImage(file, opts.maxSide, 0.8, opts.format ?? 'jpeg'));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível usar esta imagem.', true);
    }
  };

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setColor(p.color);
    update((c) => ({ ...c, mode: p.patch.mode ?? c.mode, bg: p.patch.bg ?? '', font: p.patch.font ?? c.font, radius: p.patch.radius ?? c.radius, hero: { ...c.hero, style: c.hero.style === 'image' && c.hero.image ? 'image' : p.patch.heroStyle } }));
  };

  // Tira linhas em branco antes de mostrar/salvar
  const clean: StoreCustom = {
    ...custom,
    announcement: { ...custom.announcement, messages: custom.announcement.messages.filter((m) => m.trim()) },
    benefits: custom.benefits.filter((b) => b.title.trim()),
    faq: custom.faq.filter((f) => f.q.trim() && f.a.trim()),
  };

  const onSave = async () => {
    const ok = await save(clean, { color });
    if (ok) setDirty(false);
  };

  const sectionMove = (i: number, dir: -1 | 1) =>
    update((c) => {
      const next = [...c.sections];
      const j = i + dir;
      if (j < 0 || j >= next.length) return c;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...c, sections: next };
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Aparência da loja</h1>
          <p className="text-ink-muted mt-1">Deixe a vitrine com a sua cara: cores, fontes, banner, seções e rodapé. A pré-visualização muda na hora.</p>
        </div>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"><ExternalLink className="w-4 h-4" /> Abrir vitrine real</a>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_440px] gap-5 items-start">
        <div className="space-y-4 min-w-0">
          <div className="flex gap-1 overflow-x-auto scrollbar-none rounded-2xl bg-black/[0.04] p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cx('h-9 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition', tab === t.id ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink')}>{t.label}</button>
            ))}
          </div>

          {tab === 'tema' && (
            <>
              <Card className="p-5 space-y-3">
                <div>
                  <h2 className="font-semibold">Temas prontos</h2>
                  <p className="text-sm text-ink-muted">Um clique muda cor, fonte, cantos e modo. Depois ajuste o que quiser.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.id} onClick={() => applyPreset(p.id)} className="text-left rounded-xl border border-black/10 hover:border-black/30 p-2.5 transition">
                      <span className="flex h-12 rounded-lg overflow-hidden border border-black/5" style={{ background: p.patch.bg || (p.patch.mode === 'dark' ? '#0f1115' : '#fff') }}>
                        <span className="w-1/2" style={{ background: p.color }} />
                        <span className="flex-1 p-1.5 space-y-1"><span className="block h-1.5 rounded bg-black/20" style={p.patch.mode === 'dark' ? { background: 'rgba(255,255,255,.35)' } : undefined} /><span className="block h-1.5 w-2/3 rounded bg-black/10" /></span>
                      </span>
                      <span className="mt-1.5 block text-sm font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-5 space-y-5">
                <h2 className="font-semibold">Cores</h2>
                <div>
                  <span className="text-[13px] font-medium">Cor da marca</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {SWATCHES.map((c) => (
                      <button key={c} type="button" onClick={() => { setColor(c); setDirty(true); }} className={cx('w-9 h-9 rounded-full flex items-center justify-center ring-offset-2 transition', color.toLowerCase() === c.toLowerCase() && 'ring-2 ring-ink')} style={{ background: c }} aria-label={`Cor ${c}`}>
                        {color.toLowerCase() === c.toLowerCase() && <Check className="w-4 h-4 text-white mix-blend-difference" />}
                      </button>
                    ))}
                    <label className="h-9 px-3 rounded-full border border-black/10 flex items-center gap-2 text-sm cursor-pointer">
                      <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setDirty(true); }} className="w-5 h-5 rounded-full border-0 p-0 bg-transparent cursor-pointer" /> Personalizada
                    </label>
                  </div>
                </div>
                <div>
                  <span className="text-[13px] font-medium">Modo</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 max-w-xs">
                    {(['light', 'dark'] as const).map((m) => (
                      <button key={m} onClick={() => update((c) => ({ ...c, mode: m, bg: '' }))} className={cx('h-11 rounded-xl border text-sm font-medium', custom.mode === m ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600' : 'border-black/10')}>{m === 'light' ? '☀️ Claro' : '🌙 Escuro'}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[13px] font-medium">Cor de fundo</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {BG_SWATCHES.map((c) => {
                      const shown = c || (custom.mode === 'dark' ? '#0f1115' : '#ffffff');
                      return (
                        <button key={c || 'auto'} type="button" onClick={() => set('bg', c)} className={cx('w-9 h-9 rounded-full border border-black/15 flex items-center justify-center ring-offset-2', custom.bg === c && 'ring-2 ring-ink')} style={{ background: shown }} aria-label={c ? `Fundo ${c}` : 'Fundo padrão'} title={c || 'Padrão'}>
                          {custom.bg === c && <Check className={cx('w-4 h-4', (c && c.startsWith('#0')) || (!c && custom.mode === 'dark') || c === '#14110f' ? 'text-white' : 'text-ink')} />}
                        </button>
                      );
                    })}
                    <label className="h-9 px-3 rounded-full border border-black/10 flex items-center gap-2 text-sm cursor-pointer">
                      <input type="color" value={custom.bg || (custom.mode === 'dark' ? '#0f1115' : '#ffffff')} onChange={(e) => set('bg', e.target.value)} className="w-5 h-5 rounded-full border-0 p-0 bg-transparent cursor-pointer" /> Outra
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-5 space-y-5">
                <h2 className="font-semibold">Tipografia e formas</h2>
                <div>
                  <span className="text-[13px] font-medium">Fonte</span>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(FONTS) as FontKey[]).map((f) => {
                      ensureFont(f);
                      return (
                        <button key={f} onClick={() => set('font', f)} className={cx('rounded-xl border p-3 text-left transition', custom.font === f ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-black/10 hover:border-black/30')}>
                          <span className="block text-xl leading-none" style={{ fontFamily: FONTS[f].display }}>Aa</span>
                          <span className="mt-1.5 block text-sm font-medium">{FONTS[f].label}</span>
                          <span className="block text-[11px] text-ink-soft">{FONTS[f].sample}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-[13px] font-medium">Cantos dos botões e cartões</span>
                  <div className="mt-2 grid grid-cols-3 gap-2 max-w-md">
                    {([['square', 'Retos', '4px'], ['soft', 'Suaves', '14px'], ['round', 'Redondos', '24px']] as [RadiusKey, string, string][]).map(([r, label, px]) => (
                      <button key={r} onClick={() => set('radius', r)} className={cx('rounded-xl border p-3 text-sm font-medium transition flex flex-col items-center gap-2', custom.radius === r ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-black/10 hover:border-black/30')}>
                        <span className="w-10 h-7 border-2 border-current" style={{ borderRadius: px }} />{label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {tab === 'marca' && (
            <Card className="p-5 space-y-5">
              <h2 className="font-semibold">Logo</h2>
              <ImageField
                label="Sua logo"
                hint="PNG com fundo transparente fica melhor. Será reduzida automaticamente."
                value={custom.logo}
                onPick={(f) => upload(f, (url) => update((c) => ({ ...c, logo: url, logoMode: c.logoMode === 'name' ? 'logo-name' : c.logoMode })), { maxSide: 400, format: 'png' })}
                onClear={() => update((c) => ({ ...c, logo: '', logoMode: 'name' }))}
                square
              />
              {custom.logo && (
                <div>
                  <span className="text-[13px] font-medium">Como aparece no topo</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 max-w-sm">
                    {([['logo-name', 'Logo + nome'], ['logo', 'Só a logo']] as const).map(([m, label]) => (
                      <button key={m} onClick={() => set('logoMode', m)} className={cx('h-11 rounded-xl border text-sm font-medium', custom.logoMode === m ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600' : 'border-black/10')}>{label}</button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-ink-soft">O nome e a descrição da loja ficam em Configurações.</p>
            </Card>
          )}

          {tab === 'banner' && (
            <>
              <Card className="p-5 space-y-4">
                <h2 className="font-semibold">Estilo do banner</h2>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  {([['solid', 'Cor lisa'], ['gradient', 'Degradê'], ['image', 'Foto']] as const).map(([s, label]) => (
                    <button key={s} onClick={() => setHero({ style: s })} className={cx('h-11 rounded-xl border text-sm font-medium', custom.hero.style === s ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600' : 'border-black/10')}>{label}</button>
                  ))}
                </div>
                {custom.hero.style === 'image' && (
                  <>
                    <ImageField label="Foto do banner" hint="Use uma imagem horizontal (ex.: 1600×700)." value={custom.hero.image} onPick={(f) => upload(f, (url) => setHero({ image: url }), { maxSide: 1600 })} onClear={() => setHero({ image: '' })} />
                    <Field label={`Escurecer a foto (${custom.hero.overlay}%)`} hint="Ajuda o texto a ficar legível.">
                      <input type="range" min={0} max={80} value={custom.hero.overlay} onChange={(e) => setHero({ overlay: +e.target.value })} className="w-full accent-brand-600" />
                    </Field>
                  </>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[13px] font-medium">Alinhamento</span>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {([['left', 'Esquerda'], ['center', 'Centro']] as const).map(([a, label]) => (
                        <button key={a} onClick={() => setHero({ align: a })} className={cx('h-10 rounded-xl border text-sm font-medium', custom.hero.align === a ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-black/10')}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[13px] font-medium">Altura</span>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {([['compact', 'Baixa'], ['normal', 'Média'], ['tall', 'Alta']] as const).map(([a, label]) => (
                        <button key={a} onClick={() => setHero({ size: a })} className={cx('h-10 rounded-xl border text-sm font-medium', custom.hero.size === a ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-black/10')}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-5 space-y-4">
                <h2 className="font-semibold">Textos do banner</h2>
                <Field label="Chamada pequena" hint="Deixe em branco para esconder."><Input value={custom.hero.eyebrow} maxLength={60} onChange={(e) => setHero({ eyebrow: e.target.value })} /></Field>
                <Field label="Título" hint="Em branco, usa o nome da loja."><Input value={custom.hero.title} maxLength={90} placeholder={name} onChange={(e) => setHero({ title: e.target.value })} /></Field>
                <Field label="Subtítulo" hint="Em branco, usa a descrição da loja."><Textarea rows={2} maxLength={220} value={custom.hero.subtitle} placeholder={about} onChange={(e) => setHero({ subtitle: e.target.value })} /></Field>
                <div className="grid sm:grid-cols-2 gap-3 items-end">
                  <Field label="Texto do botão principal" hint="Em branco, o botão some."><Input value={custom.hero.cta} maxLength={30} onChange={(e) => setHero({ cta: e.target.value })} /></Field>
                  <Toggle checked={custom.hero.showWhatsapp} onChange={(v) => setHero({ showWhatsapp: v })} label="Botão “Falar com a loja”" />
                </div>
              </Card>
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Faixa de avisos (topo)</h2>
                  <Toggle checked={custom.announcement.enabled} onChange={(v) => update((c) => ({ ...c, announcement: { ...c.announcement, enabled: v } }))} label="Mostrar" compact />
                </div>
                {custom.announcement.enabled && (
                  <>
                    <div className="grid grid-cols-3 gap-2 max-w-md">
                      {([['brand', 'Cor da marca'], ['dark', 'Escura'], ['light', 'Clara']] as const).map(([s, label]) => (
                        <button key={s} onClick={() => update((c) => ({ ...c, announcement: { ...c.announcement, style: s } }))} className={cx('h-10 rounded-xl border text-sm font-medium', custom.announcement.style === s ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-black/10')}>{label}</button>
                      ))}
                    </div>
                    <ListEditor
                      title="Mensagens"
                      hint="Até 4 avisos. Em branco, a loja mostra avisos automáticos (WhatsApp, Pix, frete)."
                      items={custom.announcement.messages}
                      max={4}
                      placeholder="Ex: 🔥 Frete grátis neste fim de semana"
                      onChange={(messages) => update((c) => ({ ...c, announcement: { ...c.announcement, messages } }))}
                    />
                  </>
                )}
              </Card>
            </>
          )}

          {tab === 'catalogo' && (
            <>
              <Card className="p-5 space-y-5">
                <h2 className="font-semibold">Grade de produtos</h2>
                <Field label="Título da seção"><Input value={custom.layout.productsTitle} maxLength={40} onChange={(e) => setLayout({ productsTitle: e.target.value })} /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Choice label="Colunas no computador" value={custom.layout.columns} options={[[3, '3 colunas'], [4, '4 colunas']]} onChange={(v) => setLayout({ columns: v as 3 | 4 })} />
                  <Choice label="Colunas no celular" value={custom.layout.mobileColumns} options={[[2, '2 colunas'], [1, '1 coluna']]} onChange={(v) => setLayout({ mobileColumns: v as 1 | 2 })} />
                  <Choice label="Formato da foto" value={custom.layout.aspect} options={[['portrait', 'Retrato'], ['tall', '3:4'], ['square', 'Quadrada']]} onChange={(v) => setLayout({ aspect: v as StoreCustom['layout']['aspect'] })} />
                  <Choice label="Estilo do cartão" value={custom.layout.cardStyle} options={[['clean', 'Limpo'], ['boxed', 'Com moldura']]} onChange={(v) => setLayout({ cardStyle: v as StoreCustom['layout']['cardStyle'] })} />
                </div>
              </Card>
              <Card className="p-5 space-y-3">
                <h2 className="font-semibold">O que mostrar</h2>
                <Toggle checked={custom.layout.showSearch} onChange={(v) => setLayout({ showSearch: v })} label="Barra de busca" />
                <Toggle checked={custom.layout.showCategories} onChange={(v) => setLayout({ showCategories: v })} label="Filtro de categorias" />
                <Toggle checked={custom.layout.showCategory} onChange={(v) => setLayout({ showCategory: v })} label="Categoria no cartão" />
                <Toggle checked={custom.layout.showRating} onChange={(v) => setLayout({ showRating: v })} label="Estrelas de avaliação" />
                <Toggle checked={custom.layout.showQuickAdd} onChange={(v) => setLayout({ showQuickAdd: v })} label="Botão + de adicionar rápido" />
              </Card>
            </>
          )}

          {tab === 'secoes' && (
            <>
              <Card className="p-5 space-y-3">
                <div>
                  <h2 className="font-semibold">Ordem das seções</h2>
                  <p className="text-sm text-ink-muted">Ligue, desligue e mude a ordem do que aparece abaixo do banner.</p>
                </div>
                <ul className="space-y-2">
                  {custom.sections.map((sec, i) => (
                    <li key={sec.id} className={cx('flex items-center gap-2 rounded-xl border p-3', sec.enabled ? 'border-black/10 bg-white' : 'border-dashed border-black/10 bg-black/[0.02]')}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{SECTION_LABELS[sec.id].label}</p>
                        <p className="text-xs text-ink-soft truncate">{SECTION_LABELS[sec.id].hint}</p>
                      </div>
                      <button onClick={() => sectionMove(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5 disabled:opacity-30" aria-label="Subir"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => sectionMove(i, 1)} disabled={i === custom.sections.length - 1} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5 disabled:opacity-30" aria-label="Descer"><ArrowDown className="w-4 h-4" /></button>
                      <button
                        onClick={() => update((c) => ({ ...c, sections: c.sections.map((s) => (s.id === sec.id ? { ...s, enabled: !s.enabled } : s)) }))}
                        className={cx('p-1.5 rounded-lg', sec.enabled ? 'text-brand-700 hover:bg-brand-50' : 'text-ink-soft hover:bg-black/5')}
                        aria-label={sec.enabled ? 'Ocultar' : 'Mostrar'}
                      >
                        {sec.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink-soft">Para destacar produtos, marque “Destaque na vitrine” no cadastro de cada produto ({products.filter((p) => p.featured).length} marcado{products.filter((p) => p.featured).length === 1 ? '' : 's'}).</p>
              </Card>

              <Card className="p-5 space-y-4">
                <div>
                  <h2 className="font-semibold">Destaques da loja</h2>
                  <p className="text-sm text-ink-muted">Até 4 diferenciais. Em branco, a vitrine mostra atendimento, pagamento e entrega automaticamente.</p>
                </div>
                {custom.benefits.map((b, i) => (
                  <div key={i} className="grid grid-cols-[110px_1fr_auto] gap-2 items-start">
                    <Select value={b.icon} onChange={(e) => update((c) => ({ ...c, benefits: c.benefits.map((x, j) => (j === i ? { ...x, icon: e.target.value as typeof b.icon } : x)) }))} aria-label="Ícone">
                      {ICON_KEYS.map((k) => <option key={k} value={k}>{ICON_LABELS[k]}</option>)}
                    </Select>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input placeholder="Título" maxLength={30} value={b.title} onChange={(e) => update((c) => ({ ...c, benefits: c.benefits.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) }))} />
                      <Input placeholder="Detalhe" maxLength={50} value={b.text} onChange={(e) => update((c) => ({ ...c, benefits: c.benefits.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) }))} />
                    </div>
                    <button onClick={() => update((c) => ({ ...c, benefits: c.benefits.filter((_, j) => j !== i) }))} className="h-11 w-9 flex items-center justify-center text-ink-soft hover:text-red-600" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {custom.benefits.length < 4 && (
                  <Button variant="secondary" size="sm" onClick={() => update((c) => ({ ...c, benefits: [...c.benefits, { icon: 'star', title: '', text: '' }] }))}><Plus className="w-3.5 h-3.5" /> Adicionar destaque</Button>
                )}
              </Card>

              <Card className="p-5 space-y-4">
                <h2 className="font-semibold">Sobre a loja</h2>
                <Field label="Título"><Input value={custom.about.title} maxLength={60} onChange={(e) => update((c) => ({ ...c, about: { ...c.about, title: e.target.value } }))} /></Field>
                <Field label="Texto" hint="Conte sua história, seu diferencial, como trabalha."><Textarea rows={5} maxLength={1500} value={custom.about.text} onChange={(e) => update((c) => ({ ...c, about: { ...c.about, text: e.target.value } }))} /></Field>
                <ImageField label="Foto (opcional)" value={custom.about.image} onPick={(f) => upload(f, (url) => update((c) => ({ ...c, about: { ...c.about, image: url } })), { maxSide: 1000 })} onClear={() => update((c) => ({ ...c, about: { ...c.about, image: '' } }))} />
                {!custom.sections.find((s) => s.id === 'about')?.enabled && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Esta seção está oculta. Ative em “Ordem das seções” acima.</p>}
              </Card>

              <Card className="p-5 space-y-4">
                <h2 className="font-semibold">Perguntas frequentes</h2>
                {custom.faq.map((f, i) => (
                  <div key={i} className="rounded-xl border border-black/10 p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Pergunta" maxLength={120} value={f.q} onChange={(e) => update((c) => ({ ...c, faq: c.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) }))} />
                      <button onClick={() => update((c) => ({ ...c, faq: c.faq.filter((_, j) => j !== i) }))} className="w-9 shrink-0 flex items-center justify-center text-ink-soft hover:text-red-600" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <Textarea rows={2} placeholder="Resposta" maxLength={600} value={f.a} onChange={(e) => update((c) => ({ ...c, faq: c.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) }))} />
                  </div>
                ))}
                {custom.faq.length < 12 && (
                  <Button variant="secondary" size="sm" onClick={() => update((c) => ({ ...c, faq: [...c.faq, { q: '', a: '' }] }))}><Plus className="w-3.5 h-3.5" /> Adicionar pergunta</Button>
                )}
                {!custom.sections.find((s) => s.id === 'faq')?.enabled && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Esta seção está oculta. Ative em “Ordem das seções” acima.</p>}
              </Card>
            </>
          )}

          {tab === 'rodape' && (
            <>
              <Card className="p-5 space-y-4">
                <h2 className="font-semibold">Rodapé e contato</h2>
                <Field label="Texto do rodapé" hint="Em branco, usa a descrição da loja."><Textarea rows={2} maxLength={300} value={custom.footer.text} onChange={(e) => setFooter({ text: e.target.value })} /></Field>
                <Field label="Endereço da loja física" hint="Opcional."><Input value={custom.footer.address} maxLength={160} onChange={(e) => setFooter({ address: e.target.value })} placeholder="Rua das Flores, 120 - Centro" /></Field>
              </Card>
              <Card className="p-5 space-y-4">
                <h2 className="font-semibold">Redes sociais</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Instagram"><Input value={custom.footer.instagram} onChange={(e) => setFooter({ instagram: e.target.value })} placeholder="@sualoja" /></Field>
                  <Field label="Facebook"><Input value={custom.footer.facebook} onChange={(e) => setFooter({ facebook: e.target.value })} placeholder="facebook.com/sualoja" /></Field>
                  <Field label="TikTok"><Input value={custom.footer.tiktok} onChange={(e) => setFooter({ tiktok: e.target.value })} placeholder="@sualoja" /></Field>
                  <Field label="YouTube"><Input value={custom.footer.youtube} onChange={(e) => setFooter({ youtube: e.target.value })} placeholder="youtube.com/@sualoja" /></Field>
                  <Field label="Site" className="sm:col-span-2"><Input value={custom.footer.site} onChange={(e) => setFooter({ site: e.target.value })} placeholder="www.sualoja.com.br" /></Field>
                </div>
              </Card>
              <Card className="p-5 space-y-3">
                <Toggle checked={custom.footer.showBrand} onChange={(v) => setFooter({ showBrand: v })} label="Mostrar “Loja criada com STCK Company”" />
                <p className="text-xs text-ink-soft">Horário de funcionamento, formas de pagamento e bairros atendidos ficam em Configurações e aparecem no rodapé automaticamente.</p>
              </Card>
            </>
          )}
        </div>

        {/* Pré-visualização */}
        <div className="xl:sticky xl:top-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink-muted">Pré-visualização</p>
            <div className="inline-flex rounded-lg bg-black/[0.05] p-0.5">
              {([['mobile', Smartphone], ['desktop', Monitor]] as const).map(([d, Icon]) => (
                <button key={d} onClick={() => setDevice(d)} className={cx('w-9 h-7 rounded-md flex items-center justify-center', device === d ? 'bg-white shadow-sm' : 'text-ink-soft')} aria-label={d === 'mobile' ? 'Celular' : 'Computador'}><Icon className="w-4 h-4" /></button>
              ))}
            </div>
          </div>
          <Preview name={name} about={about} custom={clean} color={color} ship={ship} desktop={device === 'desktop'} />
        </div>
      </div>

      <div className="sticky bottom-20 lg:bottom-4 flex items-center justify-end gap-3">
        {dirty && <span className="text-sm text-amber-700 bg-amber-50 rounded-full px-3 py-1.5 shadow-sm">Alterações não salvas</span>}
        <Button size="lg" loading={saving} disabled={!dirty} onClick={onSave} className="shadow-lift">Salvar aparência</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Preview({ name, about, custom, color, ship, desktop }: { name: string; about: string; custom: StoreCustom; color: string; ship: ReturnType<typeof shippingConfig>; desktop: boolean }) {
  const cols = desktop ? custom.layout.columns : custom.layout.mobileColumns === 1 ? 1 : 2;
  const aspect = { portrait: '4/5', square: '1/1', tall: '3/4' }[custom.layout.aspect];
  const mock = [
    { n: 'Produto exemplo', p: 89.9, c: 'Categoria' },
    { n: 'Outro produto', p: 129.9, c: 'Categoria' },
    { n: 'Mais um item', p: 59.9, c: 'Categoria' },
    { n: 'Item especial', p: 199, c: 'Categoria' },
  ].slice(0, Math.max(2, cols));
  return (
    <div className="rounded-3xl border border-black/[0.1] overflow-hidden shadow-soft bg-black/[0.04] p-2">
      <div style={themeStyle(color, custom)} className={cx('store-themed overflow-hidden rounded-2xl mx-auto', custom.mode === 'dark' && 'store-dark', desktop ? 'w-full' : 'max-w-[340px]')}>
        <div className="pointer-events-none select-none max-h-[640px] overflow-hidden">
          <AnnouncementBar custom={custom} ship={ship} />
          <div className="flex items-center gap-2 px-4 h-14 border-b border-black/[0.06] bg-white/90">
            <StoreLogo name={name} custom={custom} />
            <span className="ml-auto flex gap-2 text-ink-muted"><span className="w-5 h-5 rounded-full bg-black/10" /><span className="w-5 h-5 rounded-full bg-black/10" /></span>
          </div>
          <div className="p-3 space-y-3 text-[0.85em]">
            <StoreHero name={name} about={about} custom={custom} contactLink={custom.hero.showWhatsapp ? '#' : null} onCta={() => undefined} />
            {custom.sections.find((s) => s.id === 'benefits')?.enabled && <BenefitsRow items={(custom.benefits.length > 0 ? custom.benefits : defaultBenefits(ship, custom)).map((b) => ({ ...b }))} />}
            <p className="font-display text-lg font-semibold pt-1">{custom.layout.productsTitle}</p>
            {custom.layout.showSearch && <div className="h-9 rounded-xl bg-black/[0.04]" />}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {mock.map((m) => (
                <div key={m.n} className={cx(custom.layout.cardStyle === 'boxed' && 'p-2 rounded-2xl border border-black/[0.08] bg-white')}>
                  <div className="rounded-2xl bg-[var(--store-soft)] relative" style={{ aspectRatio: aspect }}>
                    {custom.layout.showQuickAdd && <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[var(--store)] text-[var(--store-ink)] flex items-center justify-center"><Plus className="w-4 h-4" /></span>}
                  </div>
                  {custom.layout.showCategory && <p className="mt-2 text-[10px] uppercase tracking-wide text-ink-soft">{m.c}</p>}
                  <p className="text-sm font-medium">{m.n}</p>
                  {custom.layout.showRating && <p className="text-xs text-ink-muted">★ 4,9 (12)</p>}
                  <p className="font-semibold text-sm">{formatBRL(m.p)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageField({ label, hint, value, onPick, onClear, square }: { label: string; hint?: string; value: string; onPick: (f: File | undefined) => void; onClear: () => void; square?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="text-[13px] font-medium">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        <button type="button" onClick={() => ref.current?.click()} className={cx('border border-dashed border-black/20 hover:border-brand-500 bg-black/[0.02] flex items-center justify-center overflow-hidden rounded-xl shrink-0', square ? 'w-20 h-20' : 'w-40 h-20')}>
          {value ? <img src={value} alt="" className={cx('w-full h-full', square ? 'object-contain p-1' : 'object-cover')} /> : <ImagePlus className="w-5 h-5 text-ink-soft" />}
        </button>
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => ref.current?.click()}>{value ? 'Trocar' : 'Enviar imagem'}</Button>
            {value && <Button type="button" variant="ghost" size="sm" onClick={onClear}><X className="w-3.5 h-3.5" /> Remover</Button>}
          </div>
          {hint && <p className="text-xs text-ink-soft">{hint}</p>}
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}

function Choice<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div>
      <span className="text-[13px] font-medium">{label}</span>
      <div className="mt-1.5 flex gap-2">
        {options.map(([v, text]) => (
          <button key={String(v)} onClick={() => onChange(v)} className={cx('h-10 flex-1 rounded-xl border text-sm font-medium', value === v ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600' : 'border-black/10 hover:border-black/30')}>{text}</button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, compact }: { checked: boolean; onChange: (v: boolean) => void; label: string; compact?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx('flex items-center gap-3 text-left', !compact && 'w-full')}>
      {!compact && <span className="flex-1 text-sm font-medium">{label}</span>}
      <span className={cx('w-11 h-6 rounded-full p-0.5 transition shrink-0', checked ? 'bg-brand-600' : 'bg-black/15')}>
        <span className={cx('block w-5 h-5 rounded-full bg-white shadow transition', checked && 'translate-x-5')} />
      </span>
      {compact && <span className="text-sm text-ink-muted">{label}</span>}
    </button>
  );
}

function ListEditor({ title, hint, items, max, placeholder, onChange }: { title: string; hint?: string; items: string[]; max: number; placeholder?: string; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-2">
      <span className="text-[13px] font-medium">{title}</span>
      {items.map((m, i) => (
        <div key={i} className="flex gap-2">
          <Input value={m} maxLength={90} placeholder={placeholder} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="w-9 shrink-0 flex items-center justify-center text-ink-soft hover:text-red-600" aria-label="Remover"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      {items.length < max && <Button variant="secondary" size="sm" onClick={() => onChange([...items, ''])}><Plus className="w-3.5 h-3.5" /> Adicionar mensagem</Button>}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

