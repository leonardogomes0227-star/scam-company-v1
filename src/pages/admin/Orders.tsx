import { useMemo, useState } from 'react';
import { ClipboardCopy, Download, MapPin, MessageCircle, Phone, Search, ShoppingBag, Wallet } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input, Modal, Select, cx } from '../../components/ui';
import { csvNumber, downloadCsv } from '../../lib/csv';
import { useToast } from '../../components/Toast';
import { supabase } from '../../supabaseClient';
import { formatBRL, formatDate, whatsappLink } from '../../lib/format';
import { ORDER_STATUSES, type Order } from '../../types';
import { orderDay, PAID_STATUSES, STATUS_TONE, type StoreData } from './useStoreData';

type Period = 'all' | 'today' | '7' | '30';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'all', label: 'Todo o período' },
  { id: 'today', label: 'Hoje' },
  { id: '7', label: 'Últimos 7 dias' },
  { id: '30', label: 'Últimos 30 dias' },
];

function periodStart(period: Period): string | null {
  if (period === 'all') return null;
  const d = new Date();
  if (period !== 'today') d.setDate(d.getDate() - (Number(period) - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function orderSummary(o: Order): string {
  const lines = [
    `Pedido ${o.id} — ${formatDate(orderDay(o))}`,
    `Cliente: ${o.customer}${o.whatsapp ? ` (${o.whatsapp})` : ''}`,
    o.address ? `Endereço: ${o.address}` : '',
    '',
    ...(o.items || []).map((i) => `${i.quantity}x ${i.name} — ${formatBRL(i.price * i.quantity)}`),
    '',
    o.discount ? `Desconto${o.coupon ? ` (${o.coupon})` : ''}: -${formatBRL(o.discount)}` : '',
    o.shipping != null ? `Frete: ${formatBRL(o.shipping)}` : '',
    `Total: ${formatBRL(o.total)}${o.payment ? ` · ${o.payment}` : ''}`,
    `Status: ${o.status}`,
  ];
  return lines.filter((l, i, arr) => l !== '' || (arr[i - 1] !== '' && i > 0)).join('\n').trim();
}

const CUSTOMER_MESSAGES: Record<string, string> = {
  'Aguardando Pagamento': 'recebemos seu pedido e estamos aguardando o pagamento.',
  'Pago / Separando': 'pagamento confirmado! Já estamos separando seus produtos.',
  'Enviado / A Caminho': 'seu pedido saiu para entrega e já está a caminho!',
  'Entregue com Sucesso': 'seu pedido foi entregue. Obrigado pela compra! 💚',
  Cancelado: 'seu pedido foi cancelado. Qualquer dúvida, estamos à disposição.',
};

export default function Orders({ data }: { data: StoreData }) {
  const toast = useToast();
  const { orders, setOrders, products, setProducts, tenant } = data;
  const [tab, setTab] = useState<string>('Todos');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const inPeriod = useMemo(() => {
    const start = periodStart(period);
    return start ? orders.filter((o) => orderDay(o) >= start) : orders;
  }, [orders, period]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { Todos: inPeriod.length };
    for (const s of ORDER_STATUSES) map[s] = inPeriod.filter((o) => o.status === s).length;
    return map;
  }, [inPeriod]);

  const filtered = inPeriod.filter((o) => {
    if (tab !== 'Todos' && o.status !== tab) return false;
    const q = search.trim().toLowerCase();
    return !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || (o.whatsapp || '').includes(q);
  });

  const filteredTotal = filtered.filter((o) => o.status !== 'Cancelado').reduce((acc, o) => acc + o.total, 0);

  const exportCsv = () => {
    downloadCsv(
      `pedidos-${tenant?.id ?? 'loja'}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Pedido', 'Data', 'Cliente', 'WhatsApp', 'Endereço', 'Itens', 'Pagamento', 'Cupom', 'Desconto', 'Frete', 'Total', 'Status'],
      filtered.map((o) => [
        o.id,
        formatDate(orderDay(o)),
        o.customer,
        o.whatsapp || '',
        o.address || '',
        (o.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', '),
        o.payment || '',
        o.coupon || '',
        csvNumber(o.discount ?? 0),
        csvNumber(o.shipping ?? 0),
        csvNumber(o.total),
        o.status,
      ]),
    );
    toast(`${filtered.length} pedido(s) exportado(s).`);
  };

  const copySummary = async (o: Order) => {
    try {
      await navigator.clipboard.writeText(orderSummary(o));
      toast('Resumo do pedido copiado!');
    } catch {
      prompt('Copie o resumo:', orderSummary(o));
    }
  };

  const selected = orders.find((o) => o.id === selectedId) || null;

  /** Dá baixa no estoque quando o pedido passa a pago, e devolve se sair de pago. */
  const adjustStock = async (order: Order, direction: -1 | 1) => {
    const updates = (order.items || [])
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        return product ? { id: product.id, stock: Math.max(0, product.stock + direction * item.quantity) } : null;
      })
      .filter((u): u is { id: string; stock: number } => !!u);
    if (updates.length === 0) return;
    await Promise.all(updates.map((u) => supabase.from('products').update({ stock: u.stock }).eq('id', u.id)));
    setProducts((prev) => prev.map((p) => updates.find((u) => u.id === p.id) ? { ...p, stock: updates.find((u) => u.id === p.id)!.stock } : p));
  };

  const updateStatus = async (order: Order, status: string) => {
    if (status === order.status) return;
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    if (error) {
      setUpdating(false);
      return toast('Erro ao atualizar: ' + error.message, true);
    }
    const wasPaid = PAID_STATUSES.includes(order.status);
    const isPaid = PAID_STATUSES.includes(status);
    if (!wasPaid && isPaid) await adjustStock(order, -1);
    if (wasPaid && !isPaid) await adjustStock(order, 1);
    setUpdating(false);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    toast(!wasPaid && isPaid ? 'Pagamento confirmado — estoque atualizado.' : 'Status atualizado!');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Pedidos</h1>
          <p className="text-ink-muted mt-1">Confirme pagamentos, atualize o status e avise o cliente pelo WhatsApp.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}><Download className="w-4 h-4" /> Exportar planilha</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {['Todos', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={cx('h-9 px-3.5 rounded-full text-sm font-medium shrink-0 border transition flex items-center gap-2', tab === s ? 'bg-ink text-white border-ink' : 'bg-white border-black/10 text-ink-muted hover:text-ink')}
          >
            {s === 'Todos' ? 'Todos' : s.split(' / ')[0]}
            <span className={cx('text-xs tabular-nums', tab === s ? 'text-white/70' : 'text-ink-soft')}>{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por código, cliente ou telefone" className="pl-10" />
        </div>
        <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="sm:w-52">
          {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </Select>
      </div>

      {filtered.length > 0 && (
        <p className="text-sm text-ink-muted">
          {filtered.length} {filtered.length === 1 ? 'pedido' : 'pedidos'} · <span className="font-semibold text-ink tabular-nums">{formatBRL(filteredTotal)}</span> <span className="text-ink-soft">(sem cancelados)</span>
        </p>
      )}

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="w-6 h-6" />} title={orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum pedido aqui'} description={orders.length === 0 ? 'Quando um cliente finalizar uma compra na vitrine, o pedido aparece aqui.' : 'Tente outro filtro ou busca.'} />
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {filtered.map((o) => (
              <li key={o.id}>
                <button onClick={() => setSelectedId(o.id)} className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-black/[0.015]">
                  <span className="hidden sm:flex w-10 h-10 rounded-xl bg-black/[0.04] items-center justify-center text-sm font-semibold text-ink-muted shrink-0">
                    {o.customer.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.customer}</p>
                    <p className="text-xs text-ink-soft truncate">{o.id} · {formatDate(orderDay(o))} · {(o.items || []).reduce((a, i) => a + i.quantity, 0) || '—'} itens{o.payment ? ` · ${o.payment}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-semibold tabular-nums">{formatBRL(o.total)}</p>
                    <Badge tone={STATUS_TONE[o.status] ?? 'neutral'}>{o.status}</Badge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selected && (
        <Modal title={<span className="font-mono">{selected.id}</span>} onClose={() => setSelectedId(null)}>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Badge tone={STATUS_TONE[selected.status] ?? 'neutral'} className="text-xs">{selected.status}</Badge>
              <span className="text-sm text-ink-muted">{formatDate(orderDay(selected))}</span>
            </div>

            <div className="rounded-2xl bg-black/[0.025] p-4 space-y-2 text-sm">
              <p className="font-semibold">{selected.customer}</p>
              {selected.whatsapp && <p className="flex items-center gap-2 text-ink-muted"><Phone className="w-4 h-4" /> {selected.whatsapp}</p>}
              {selected.address && <p className="flex items-start gap-2 text-ink-muted"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {selected.address}</p>}
              {selected.payment && <p className="flex items-center gap-2 text-ink-muted"><Wallet className="w-4 h-4" /> {selected.payment}</p>}
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Itens</p>
              <ul className="text-sm divide-y divide-black/[0.06] border-y border-black/[0.06]">
                {(selected.items || []).length === 0 && <li className="py-2.5 text-ink-muted">Sem detalhes de itens.</li>}
                {(selected.items || []).map((item) => (
                  <li key={item.id} className="py-2.5 flex justify-between gap-3">
                    <span><span className="text-ink-muted">{item.quantity}×</span> {item.name}</span>
                    <span className="tabular-nums">{formatBRL(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 text-sm">
                {!!selected.discount && <div className="flex justify-between text-emerald-700"><span>Desconto {selected.coupon ? `(${selected.coupon})` : ''}</span><span>-{formatBRL(selected.discount)}</span></div>}
                {selected.shipping != null && <div className="flex justify-between text-ink-muted"><span>Frete</span><span>{formatBRL(selected.shipping)}</span></div>}
                <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span className="tabular-nums">{formatBRL(selected.total)}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Atualizar status</p>
              <Select value={selected.status} onChange={(e) => updateStatus(selected, e.target.value)} disabled={updating}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <p className="text-xs text-ink-soft">Ao marcar como pago, o estoque dos produtos é descontado automaticamente.</p>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => copySummary(selected)}><ClipboardCopy className="w-4 h-4" /> Copiar resumo do pedido</Button>

            {selected.whatsapp && (
              <a
                href={whatsappLink(selected.whatsapp, `Olá, ${selected.customer.split(' ')[0]}! Aqui é da ${tenant?.name}. Sobre o pedido ${selected.id}: ${CUSTOMER_MESSAGES[selected.status] ?? selected.status}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-[#25D366] hover:brightness-95 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Avisar cliente no WhatsApp
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
