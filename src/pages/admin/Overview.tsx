import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, Clock, Copy, DollarSign, ExternalLink, MessageCircle, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Badge, Card, cx } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { formatBRL, formatDate } from '../../lib/format';
import SalesChart, { type DayPoint } from './SalesChart';
import { orderDay, PAID_STATUSES, STATUS_TONE, type StoreData } from './useStoreData';
import type { AdminSection } from '../AdminDashboard';

function localDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Overview({ data, storeUrl, goTo }: { data: StoreData; storeUrl: string; goTo: (s: AdminSection) => void }) {
  const toast = useToast();
  const { tenant, products, orders, coupons } = data;
  const [range, setRange] = useState<7 | 14 | 30>(14);

  const stats = useMemo(() => {
    const today = new Date();
    const days: DayPoint[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({ day: localDay(d), revenue: 0, orders: 0 });
    }
    const byDay = new Map(days.map((d) => [d.day, d]));
    const since30 = new Date(today);
    since30.setDate(today.getDate() - 29);
    const since30Key = localDay(since30);

    let revenue30 = 0;
    let paid30 = 0;
    for (const o of orders) {
      if (!PAID_STATUSES.includes(o.status)) continue;
      const day = orderDay(o);
      const point = byDay.get(day);
      if (point) {
        point.revenue += o.total;
        point.orders += 1;
      }
      if (day >= since30Key) {
        revenue30 += o.total;
        paid30 += 1;
      }
    }
    return {
      days,
      revenue30,
      paid30,
      ticket: paid30 ? revenue30 / paid30 : 0,
      pending: orders.filter((o) => o.status === 'Aguardando Pagamento'),
      lowStock: products.filter((p) => p.stock <= 3).sort((a, b) => a.stock - b.stock),
      revenueRange: days.reduce((acc, d) => acc + d.revenue, 0),
    };
  }, [orders, products, range]);

  const checklist = [
    { done: !!tenant?.whatsapp, label: 'Cadastrar o WhatsApp que recebe os pedidos', action: () => goTo('settings') },
    { done: !!tenant?.pix_key, label: 'Cadastrar sua chave Pix', action: () => goTo('settings') },
    { done: !!tenant?.custom && Object.keys(tenant.custom as object).length > 0, label: 'Personalizar a aparência da vitrine', action: () => goTo('appearance') },
    { done: !!tenant?.city, label: 'Configurar entregas (cidade, envio e retirada)', action: () => goTo('settings') },
    { done: products.length > 0, label: 'Cadastrar o primeiro produto', action: () => goTo('products') },
    { done: coupons.length > 0, label: 'Criar um cupom de boas-vindas', action: () => goTo('coupons') },
  ];
  const pendingSteps = checklist.filter((c) => !c.done).length;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast('Link da vitrine copiado!');
    } catch {
      prompt('Copie o link da sua vitrine:', storeUrl);
    }
  };
  const shareText = encodeURIComponent(`Confira a minha loja ${tenant?.name ?? ''}: ${storeUrl}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Olá, {tenant?.name} 👋</h1>
          <p className="text-ink-muted mt-1">Veja como sua loja está indo.</p>
        </div>
      </div>

      {/* Link da loja */}
      <Card className="p-5 flex flex-col lg:flex-row lg:items-center gap-4 bg-gradient-to-br from-brand-700 to-brand-600 border-transparent text-white">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/70">Sua vitrine está no ar</p>
          <p className="font-mono text-sm sm:text-base truncate mt-0.5">{storeUrl}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copyLink} className="h-10 px-4 rounded-xl bg-white text-brand-700 font-semibold text-sm flex items-center gap-2"><Copy className="w-4 h-4" /> Copiar link</button>
          <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/20 font-semibold text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Divulgar</a>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/20 font-semibold text-sm flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Abrir</a>
        </div>
      </Card>

      {/* Checklist de configuração */}
      {pendingSteps > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Deixe sua loja pronta para vender</h2>
            <span className="text-sm text-ink-muted">{checklist.length - pendingSteps}/{checklist.length}</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${((checklist.length - pendingSteps) / checklist.length) * 100}%` }} />
          </div>
          <ul className="mt-4 grid sm:grid-cols-2 gap-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <button onClick={c.action} disabled={c.done} className={cx('w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition', c.done ? 'text-ink-soft' : 'hover:bg-black/[0.03]')}>
                  {c.done ? <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" /> : <Circle className="w-5 h-5 text-ink-soft shrink-0" />}
                  <span className={cx('flex-1', c.done && 'line-through')}>{c.label}</span>
                  {!c.done && <ArrowRight className="w-4 h-4 text-ink-soft" />}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi icon={DollarSign} label="Faturamento (30 dias)" value={formatBRL(stats.revenue30)} hint={`${stats.paid30} pedidos pagos`} />
        <Kpi icon={TrendingUp} label="Ticket médio" value={formatBRL(stats.ticket)} hint="últimos 30 dias" />
        <Kpi icon={Clock} label="Aguardando pagamento" value={String(stats.pending.length)} hint={formatBRL(stats.pending.reduce((a, o) => a + o.total, 0))} onClick={() => goTo('orders')} />
        <Kpi icon={Package} label="Produtos" value={String(products.length)} hint={`${products.filter((p) => p.stock <= 0).length} esgotados`} onClick={() => goTo('products')} />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="font-semibold">Faturamento diário</h2>
              <p className="text-sm text-ink-muted">Pedidos pagos · <span className="font-semibold text-ink tabular-nums">{formatBRL(stats.revenueRange)}</span></p>
            </div>
            <div className="flex p-1 rounded-xl bg-black/[0.04] shrink-0" role="tablist" aria-label="Período do gráfico">
              {([7, 14, 30] as const).map((r) => (
                <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)} className={cx('h-8 px-2.5 rounded-lg text-xs font-semibold', range === r ? 'bg-white shadow-sm text-ink' : 'text-ink-muted')}>
                  {r}d
                </button>
              ))}
            </div>
          </div>
          <SalesChart data={stats.days} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pedidos recentes</h2>
            <button onClick={() => goTo('orders')} className="text-sm font-medium text-brand-700 hover:underline">Ver todos</button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-sm text-ink-muted">
              <ShoppingBag className="w-8 h-8 mx-auto text-ink-soft mb-2" />
              Nenhum pedido ainda. Divulgue o link da sua loja!
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.customer}</p>
                    <p className="text-xs text-ink-soft">{formatDate(orderDay(o))} · {o.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{formatBRL(o.total)}</p>
                    <Badge tone={STATUS_TONE[o.status] ?? 'neutral'}>{o.status.split(' / ')[0]}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {stats.lowStock.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Estoque baixo</h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.lowStock.slice(0, 9).map((p) => (
              <button key={p.id} onClick={() => goTo('products')} className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.025] px-3.5 py-2.5 text-sm text-left hover:bg-black/[0.04]">
                <span className="truncate">{p.name}</span>
                <Badge tone={p.stock <= 0 ? 'red' : 'amber'}>{p.stock <= 0 ? 'Esgotado' : `${p.stock} un.`}</Badge>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, onClick }: { icon: typeof Package; label: string; value: string; hint: string; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={cx('text-left bg-white border border-black/[0.07] rounded-2xl shadow-soft p-4 sm:p-5', onClick && 'hover:border-black/15 transition')}>
      <div className="flex items-center justify-between gap-2 text-ink-muted">
        <span className="text-xs sm:text-[13px] font-medium">{label}</span>
        <Icon className="w-4 h-4 text-brand-600 shrink-0" />
      </div>
      <p className="mt-2 font-display text-xl sm:text-2xl font-semibold tabular-nums truncate">{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>
    </Comp>
  );
}
