import { useMemo, useState } from 'react';
import { Download, MessageCircle, Search, Trophy, Users } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input } from '../../components/ui';
import { csvNumber, downloadCsv } from '../../lib/csv';
import { formatBRL, formatDate, whatsappLink } from '../../lib/format';
import { orderDay, PAID_STATUSES, type StoreData } from './useStoreData';

interface Customer {
  key: string;
  name: string;
  whatsapp: string;
  orders: number;
  spent: number;
  last: string;
}

const daysAgo = (day: string) => Math.floor((Date.now() - new Date(`${day}T12:00:00`).getTime()) / 86_400_000);

export default function Customers({ data }: { data: StoreData }) {
  const { orders, tenant } = data;
  const [query, setQuery] = useState('');

  const { customers, top } = useMemo(() => {
    const map = new Map<string, Customer>();
    const sold = new Map<string, { qty: number; revenue: number }>();
    for (const o of orders) {
      if (o.status === 'Cancelado') continue;
      const digits = (o.whatsapp || '').replace(/\D/g, '');
      const key = digits.length >= 10 ? digits.slice(-11) : o.customer.trim().toLowerCase();
      const day = orderDay(o);
      const cur = map.get(key) ?? { key, name: o.customer, whatsapp: o.whatsapp || '', orders: 0, spent: 0, last: '' };
      cur.orders += 1;
      if (PAID_STATUSES.includes(o.status)) cur.spent += o.total;
      if (day >= cur.last) {
        cur.last = day;
        cur.name = o.customer;
        cur.whatsapp = o.whatsapp || cur.whatsapp;
      }
      map.set(key, cur);
      if (PAID_STATUSES.includes(o.status)) {
        for (const it of o.items ?? []) {
          const name = it.name.replace(/\s\([^)]*\)$/, '');
          const t = sold.get(name) ?? { qty: 0, revenue: 0 };
          t.qty += it.quantity;
          t.revenue += it.price * it.quantity;
          sold.set(name, t);
        }
      }
    }
    return {
      customers: [...map.values()].sort((a, b) => b.spent - a.spent || b.orders - a.orders),
      top: [...sold.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5),
    };
  }, [orders]);

  const q = query.trim().toLowerCase();
  const list = customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.whatsapp.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§'));
  const repeat = customers.filter((c) => c.orders > 1).length;
  const totalSpent = customers.reduce((a, c) => a + c.spent, 0);

  const exportCsv = () =>
    downloadCsv('clientes.csv', ['Nome', 'WhatsApp', 'Pedidos', 'Total pago (R$)', 'Último pedido'], list.map((c) => [c.name, c.whatsapp, c.orders, csvNumber(c.spent), formatDate(c.last)]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Clientes</h1>
          <p className="text-ink-muted mt-1">Quem compra de você, quanto gasta e quem vale chamar de volta.</p>
        </div>
        {customers.length > 0 && <Button variant="secondary" onClick={exportCsv}><Download className="w-4 h-4" /> Exportar CSV</Button>}
      </div>

      {customers.length === 0 ? (
        <Card><EmptyState icon={<Users className="w-6 h-6" />} title="Nenhum cliente ainda" description="Assim que os primeiros pedidos chegarem, seus clientes aparecem aqui automaticamente." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Clientes', String(customers.length)],
              ['Compraram mais de uma vez', `${repeat} (${Math.round((repeat / customers.length) * 100)}%)`],
              ['Gasto médio por cliente', formatBRL(totalSpent / customers.length)],
              ['Total pago', formatBRL(totalSpent)],
            ].map(([label, value]) => (
              <Card key={label} className="p-4"><p className="text-xs text-ink-muted">{label}</p><p className="mt-1 text-xl font-semibold font-display">{value}</p></Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-black/[0.06]">
                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input className="pl-10" placeholder="Buscar por nome ou WhatsApp" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
              </div>
              <ul className="divide-y divide-black/[0.06]">
                {list.map((c) => {
                  const idle = c.last ? daysAgo(c.last) : 0;
                  const msg = idle >= 30
                    ? `Oi ${c.name.split(' ')[0]}! Faz um tempinho que você não passa na ${tenant?.name ?? 'nossa loja'}. Chegaram novidades, quer dar uma olhada? 😊`
                    : `Oi ${c.name.split(' ')[0]}! Obrigado pela compra na ${tenant?.name ?? 'nossa loja'}. Qualquer coisa é só chamar! 💚`;
                  return (
                    <li key={c.key} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center shrink-0">{c.name.charAt(0).toUpperCase()}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate flex items-center gap-2">
                          {c.name}
                          {c.orders > 2 ? <Badge tone="green">Fiel</Badge> : c.orders === 2 ? <Badge tone="blue">Recorrente</Badge> : idle <= 7 ? <Badge tone="violet">Novo</Badge> : null}
                          {idle >= 30 && <Badge tone="amber">Sumido</Badge>}
                        </p>
                        <p className="text-xs text-ink-muted">{c.orders} {c.orders === 1 ? 'pedido' : 'pedidos'} · último em {formatDate(c.last)}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{formatBRL(c.spent)}</span>
                      {c.whatsapp && (
                        <a href={whatsappLink(c.whatsapp, msg)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/20 flex items-center justify-center" aria-label={`Chamar ${c.name} no WhatsApp`} title="Chamar no WhatsApp"><MessageCircle className="w-4 h-4" /></a>
                      )}
                    </li>
                  );
                })}
                {list.length === 0 && <li className="px-4 py-10 text-center text-sm text-ink-muted">Nenhum cliente encontrado.</li>}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Mais vendidos</h2>
              {top.length === 0 ? (
                <p className="text-sm text-ink-muted mt-3">Aparecem aqui quando houver pedidos pagos.</p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {top.map((t, i) => (
                    <li key={t.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-black/[0.05] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="flex-1 min-w-0"><span className="block text-sm font-medium truncate">{t.name}</span><span className="text-xs text-ink-muted">{t.qty} vendido{t.qty === 1 ? '' : 's'}</span></span>
                      <span className="text-sm font-semibold tabular-nums">{formatBRL(t.revenue)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
