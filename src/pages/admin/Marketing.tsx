import { useEffect, useRef, useState } from 'react';
import { Clapperboard, Copy, Megaphone, Play, Sparkles, Square, X } from 'lucide-react';
import { Button, Card, EmptyState, Field, Select, cx } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { formatBRL } from '../../lib/format';
import type { Product } from '../../types';
import type { StoreData } from './useStoreData';

type Goal = 'urgencia' | 'desejo' | 'dor' | 'review';

interface Script {
  title: string;
  hook: string;
  body: string;
  cta: string;
}

const GOALS: { id: Goal; label: string; emoji: string }[] = [
  { id: 'urgencia', label: 'Queima de estoque', emoji: '🔥' },
  { id: 'desejo', label: 'Lançamento', emoji: '✨' },
  { id: 'dor', label: 'Resolver um problema', emoji: '💡' },
  { id: 'review', label: 'Mostrar na prática', emoji: '🎥' },
];

function buildScript(product: Product, goal: Goal): Script {
  const price = formatBRL(product.price);
  const desc = product.description?.trim();
  const scripts: Record<Goal, Omit<Script, 'title'>> = {
    urgencia: {
      hook: `Últimas unidades de ${product.name}! Olha só isso.`,
      body: `Separei as últimas peças pra quem estava esperando: ${product.name} por ${price}. Quando acabar, não sei quando volta.`,
      cta: 'Clica no link da bio, coloca no carrinho e me chama no WhatsApp pra garantir o seu.',
    },
    desejo: {
      hook: `Chegou novidade: ${product.name}!`,
      body: `${desc || 'Acabou de chegar e já é um dos mais procurados da loja.'} E sai por apenas ${price}.`,
      cta: 'Corre no link da vitrine e garante o seu antes de todo mundo.',
    },
    dor: {
      hook: 'Cansado de procurar algo que funcione de verdade?',
      body: `O ${product.name} resolve isso no seu dia a dia. ${desc || ''} Tudo por ${price}.`.replace(/\s+/g, ' '),
      cta: 'O link tá na bio: escolhe, finaliza pelo WhatsApp e recebe rapidinho.',
    },
    review: {
      hook: `Deixa eu te mostrar o ${product.name} de pertinho.`,
      body: `Olha o acabamento, olha os detalhes. ${desc || 'É exatamente o que aparece na foto.'} Por ${price}, vale cada centavo.`,
      cta: 'Gostou? Link da loja na bio — o pedido cai direto no meu WhatsApp.',
    },
  };
  return { title: product.name, ...scripts[goal] };
}

export default function Marketing({ data, storeUrl }: { data: StoreData; storeUrl: string }) {
  const toast = useToast();
  const { products, coupons, tenant } = data;
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [goal, setGoal] = useState<Goal>('urgencia');
  const [script, setScript] = useState<Script | null>(null);
  const [prompter, setPrompter] = useState(false);

  const product = products.find((p) => p.id === productId);
  const coupon = coupons[0];

  const statusText = product
    ? `✨ ${product.name}\n💰 ${formatBRL(product.price)}${coupon ? `\n🎟 Use o cupom ${coupon.code} e ganhe ${coupon.discount}% OFF` : ''}\n\n🛒 Peça pelo link: ${storeUrl}`
    : '';

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copiado!`);
    } catch {
      prompt('Copie o texto:', text);
    }
  };

  if (products.length === 0) {
    return (
      <div className="space-y-5">
        <Header />
        <Card><EmptyState icon={<Clapperboard className="w-6 h-6" />} title="Cadastre um produto primeiro" description="Os roteiros e textos de divulgação são gerados a partir dos seus produtos." /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <Header />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Clapperboard className="w-4 h-4 text-brand-600" /> Roteiro de vídeo</h2>
          <Field label="Produto">
            <Select value={productId} onChange={(e) => { setProductId(e.target.value); setScript(null); }}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatBRL(p.price)}</option>)}
            </Select>
          </Field>
          <div>
            <span className="text-[13px] font-medium">Objetivo do vídeo</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => { setGoal(g.id); setScript(null); }} className={cx('h-11 rounded-xl border text-sm font-medium transition', goal === g.id ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600' : 'border-black/10 hover:border-black/20')}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => product && setScript(buildScript(product, goal))} className="w-full"><Sparkles className="w-4 h-4" /> Gerar roteiro</Button>

          {script && (
            <div className="rounded-2xl bg-black/[0.025] p-4 space-y-3 text-sm animate-fade-up">
              {[['Gancho (0–3s)', script.hook], ['Corpo (3–12s)', script.body], ['Chamada (12–15s)', script.cta]].map(([label, text]) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">{label}</p>
                  <p className="mt-0.5">{text}</p>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="dark" onClick={() => setPrompter(true)}><Play className="w-3.5 h-3.5" /> Abrir teleprompter</Button>
                <Button size="sm" variant="secondary" onClick={() => copy(`${script.hook}\n\n${script.body}\n\n${script.cta}`, 'Roteiro')}><Copy className="w-3.5 h-3.5" /> Copiar</Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Megaphone className="w-4 h-4 text-brand-600" /> Texto para status e grupos</h2>
          <p className="text-sm text-ink-muted">Pronto para colar no status do WhatsApp, grupos e direct{tenant?.name ? ` da ${tenant.name}` : ''}.</p>
          <pre className="whitespace-pre-wrap font-sans text-sm rounded-2xl bg-[#E7FFDB] text-[#111B21] p-4 border border-[#d1f4c0]">{statusText}</pre>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => copy(statusText, 'Texto')}><Copy className="w-3.5 h-3.5" /> Copiar texto</Button>
            <a href={`https://wa.me/?text=${encodeURIComponent(statusText)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 px-3 items-center gap-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold">Enviar no WhatsApp</a>
          </div>
        </Card>
      </div>

      {prompter && script && <Teleprompter script={script} onClose={() => setPrompter(false)} />}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">Marketing</h1>
      <p className="text-ink-muted mt-1">Roteiros de vídeo com teleprompter e textos prontos para divulgar.</p>
    </div>
  );
}

function Teleprompter({ script, onClose }: { script: Script; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(40);
  const [mirror, setMirror] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el) return;
      el.scrollTop += speed * 1.2;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) setRunning(false);
    }, 30);
    return () => window.clearInterval(id);
  }, [running, speed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = () => {
    const el = ref.current;
    if (!running && el && el.scrollTop + el.clientHeight >= el.scrollHeight - 1) el.scrollTop = 0;
    setRunning(!running);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      <div className="flex flex-wrap items-center gap-3 justify-between px-4 py-3 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-white/70">Velocidade <input type="range" min={1} max={6} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="accent-brand-400" /></label>
          <label className="flex items-center gap-2 text-white/70">Fonte <input type="range" min={24} max={72} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="accent-brand-400" /></label>
          <label className="flex items-center gap-2 text-white/70"><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Espelhar</label>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} className={cx('h-10 px-4 rounded-xl font-semibold text-sm flex items-center gap-2', running ? 'bg-red-500' : 'bg-brand-500')}>
            {running ? <><Square className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Iniciar</>}
          </button>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center" aria-label="Fechar"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="absolute left-0 right-0 top-1/2 h-px bg-brand-400/40 pointer-events-none" />
      <div ref={ref} className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-4xl mx-auto px-6 py-[45vh] text-center font-semibold leading-snug space-y-10" style={{ fontSize, transform: mirror ? 'scaleX(-1)' : undefined }}>
          <p>{script.hook}</p>
          <p>{script.body}</p>
          <p>{script.cta}</p>
        </div>
      </div>
      <p className="text-center text-xs text-white/40 py-2">Espaço: iniciar/pausar · Esc: fechar</p>
    </div>
  );
}
