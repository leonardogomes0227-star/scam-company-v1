import { useState } from 'react';
import { Copy, Plus, Tag, Trash2 } from 'lucide-react';
import { Button, Card, EmptyState, Field, Input } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { supabase } from '../../supabaseClient';
import { generateId } from '../../lib/format';
import type { Coupon } from '../../types';
import type { StoreData } from './useStoreData';

const SUGGESTIONS = [
  { code: 'BEMVINDO10', discount: 10 },
  { code: 'VOLTEI15', discount: 15 },
  { code: 'AMIGO5', discount: 5 },
];

export default function Coupons({ data, tenantId }: { data: StoreData; tenantId: string }) {
  const toast = useToast();
  const { coupons, setCoupons, orders } = data;
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  const usage = (c: Coupon) => orders.filter((o) => (o.coupon || '').toUpperCase() === c.code.toUpperCase()).length;

  const create = async (e?: React.FormEvent, preset?: { code: string; discount: number }) => {
    e?.preventDefault();
    const finalCode = (preset?.code ?? code).trim().toUpperCase().replace(/\s+/g, '');
    const value = preset?.discount ?? parseFloat(discount.replace(',', '.'));
    if (!finalCode || !(value > 0 && value <= 100)) return toast('Informe um código e um desconto entre 1% e 100%.', true);
    if (coupons.some((c) => c.code === finalCode)) return toast('Já existe um cupom com esse código.', true);

    const coupon: Coupon = { id: generateId(), tenant_id: tenantId, code: finalCode, discount: value };
    setSaving(true);
    const { error } = await supabase.from('coupons').insert([coupon]);
    setSaving(false);
    if (error) return toast('Erro ao criar cupom: ' + error.message, true);
    setCoupons((prev) => [coupon, ...prev]);
    setCode('');
    setDiscount('');
    toast(`Cupom ${finalCode} criado!`);
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Excluir o cupom ${c.code}?`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', c.id);
    if (error) return toast('Erro ao remover: ' + error.message, true);
    setCoupons((prev) => prev.filter((x) => x.id !== c.id));
    toast('Cupom removido.');
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`"${text}" copiado!`);
    } catch {
      /* sem permissão de área de transferência */
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Cupons</h1>
        <p className="text-ink-muted mt-1">Descontos percentuais aplicados no subtotal do carrinho.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={create} className="grid sm:grid-cols-[1fr_160px_auto] gap-3 items-end">
          <Field label="Código">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ex: BEMVINDO10" className="uppercase font-mono" />
          </Field>
          <Field label="Desconto (%)">
            <Input inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="10" />
          </Field>
          <Button type="submit" loading={saving} className="h-11"><Plus className="w-4 h-4" /> Criar cupom</Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-muted">Sugestões:</span>
          {SUGGESTIONS.filter((s) => !coupons.some((c) => c.code === s.code)).map((s) => (
            <button key={s.code} onClick={() => create(undefined, s)} className="h-8 px-3 rounded-lg border border-dashed border-black/15 hover:border-brand-500 hover:text-brand-700 font-mono text-xs">
              {s.code} · {s.discount}%
            </button>
          ))}
        </div>
      </Card>

      {coupons.length === 0 ? (
        <Card><EmptyState icon={<Tag className="w-6 h-6" />} title="Nenhum cupom ativo" description="Crie um cupom e divulgue nas redes para atrair clientes." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {coupons.map((c) => (
            <Card key={c.id} className="p-0 overflow-hidden flex">
              <div className="w-24 shrink-0 bg-brand-600 text-white flex flex-col items-center justify-center relative">
                <span className="font-display text-2xl font-semibold">{c.discount}%</span>
                <span className="text-[10px] uppercase tracking-wider text-white/70">OFF</span>
                <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-canvas" />
              </div>
              <div className="flex-1 p-4 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="font-mono font-semibold truncate">{c.code}</p>
                  <p className="text-xs text-ink-soft mt-0.5">Usado em {usage(c)} {usage(c) === 1 ? 'pedido' : 'pedidos'}</p>
                </div>
                <div className="flex">
                  <button onClick={() => copy(c.code)} className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-black/[0.04]" aria-label="Copiar código"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => remove(c)} className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:text-red-600 hover:bg-red-50" aria-label="Excluir cupom"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
