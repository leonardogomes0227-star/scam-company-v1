import { useState } from 'react';
import { Bike, Check, ExternalLink, MapPin, MessageCircle, ShoppingBag, Store as StoreIcon, Truck } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, cx } from '../../components/ui';
import { formatCep, lookupCep, UFS } from '../../lib/cep';
import { MIGRATION_HINT, writeWithFallback } from '../../lib/db';
import { useToast } from '../../components/Toast';
import { supabase } from '../../supabaseClient';
import { brandVars, safeColor } from '../../lib/color';
import { formatBRL } from '../../lib/format';
import type { StoreData } from './useStoreData';

const PRESETS = ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#2563eb', '#0891b2', '#0E6B4F', '#16a34a', '#111827', '#a16207'];

export default function Settings({ data, tenantId, storeUrl }: { data: StoreData; tenantId: string; storeUrl: string }) {
  const toast = useToast();
  const { tenant, setTenant } = data;
  const [name, setName] = useState(tenant?.name ?? '');
  const [about, setAbout] = useState(tenant?.about ?? '');
  const [whatsapp, setWhatsapp] = useState(tenant?.whatsapp ?? '');
  const [pixKey, setPixKey] = useState(tenant?.pix_key ?? '');
  const [color, setColor] = useState(safeColor(tenant?.color));
  const [shippingLocal, setShippingLocal] = useState(String(tenant?.shipping_local ?? 10));
  const [shippingFar, setShippingFar] = useState(String(tenant?.shipping_far ?? 18));
  const [city, setCity] = useState(tenant?.city ?? '');
  const [uf, setUf] = useState(tenant?.state ?? '');
  const [storeCep, setStoreCep] = useState('');
  const [pickupEnabled, setPickupEnabled] = useState(tenant?.pickup_enabled ?? false);
  const [pickupAddress, setPickupAddress] = useState(tenant?.pickup_address ?? '');
  const [shipNationwide, setShipNationwide] = useState(tenant?.ship_nationwide ?? true);
  const [shippingNational, setShippingNational] = useState(tenant?.shipping_national != null ? String(tenant.shipping_national) : '');
  const [freeShippingMin, setFreeShippingMin] = useState(tenant?.free_shipping_min != null ? String(tenant.free_shipping_min) : '');

  const fillFromCep = async (value: string) => {
    const cep = formatCep(value);
    setStoreCep(cep);
    if (cep.replace(/\D/g, '').length !== 8) return;
    try {
      const found = await lookupCep(cep);
      if (!found) return toast('CEP não encontrado.', true);
      setCity(found.city);
      setUf(found.state);
      if (!pickupAddress) setPickupAddress([found.street, found.district].filter(Boolean).join(', '));
    } catch {
      toast('Não foi possível consultar o CEP agora. Preencha a cidade manualmente.', true);
    }
  };
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast('O nome da loja é obrigatório.', true);
    const digits = whatsapp.replace(/\D/g, '');
    if (digits && digits.length < 10) return toast('WhatsApp inválido: informe DDD + número.', true);

    const money = (v: string) => Math.max(0, parseFloat(v.replace(',', '.')) || 0);
    const optionalMoney = (v: string) => (v.trim() === '' ? null : money(v));
    const patch = {
      name: name.trim(),
      about: about.trim(),
      whatsapp: digits,
      pix_key: pixKey.trim(),
      color,
      shipping_local: money(shippingLocal),
      shipping_far: money(shippingFar),
      city: city.trim() || null,
      state: uf || null,
      pickup_enabled: pickupEnabled,
      pickup_address: pickupAddress.trim() || null,
      ship_nationwide: shipNationwide,
      shipping_national: optionalMoney(shippingNational),
      free_shipping_min: optionalMoney(freeShippingMin),
    };
    const optional: (keyof typeof patch)[] = ['city', 'state', 'pickup_enabled', 'pickup_address', 'ship_nationwide', 'shipping_national', 'free_shipping_min'];
    setSaving(true);
    const { error, degraded } = await writeWithFallback((data) => supabase.from('tenants').update(data).eq('id', tenantId), patch, optional);
    setSaving(false);
    if (error) return toast('Erro ao salvar: ' + error.message, true);
    setTenant((t) => (t ? { ...t, ...patch } : t));
    toast(degraded ? MIGRATION_HINT : 'Configurações salvas!', degraded);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Configurações</h1>
        <p className="text-ink-muted mt-1">Personalize sua loja. A pré-visualização ao lado mostra como fica.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <form onSubmit={save} className="space-y-5">
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold">Identidade</h2>
            <Field label="Nome da loja"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Descrição curta" hint="Aparece no topo da vitrine.">
              <Textarea value={about} onChange={(e) => setAbout(e.target.value)} maxLength={160} rows={2} placeholder="Ex: Moda feminina com entrega na cidade toda" />
            </Field>
            <div>
              <span className="text-[13px] font-medium">Cor da marca</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {PRESETS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={cx('w-9 h-9 rounded-full flex items-center justify-center ring-offset-2 transition', color.toLowerCase() === c.toLowerCase() && 'ring-2 ring-ink')} style={{ background: c }} aria-label={`Cor ${c}`}>
                    {color.toLowerCase() === c.toLowerCase() && <Check className="w-4 h-4 text-white mix-blend-difference" />}
                  </button>
                ))}
                <label className="h-9 px-3 rounded-full border border-black/10 flex items-center gap-2 text-sm cursor-pointer">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-5 h-5 rounded-full border-0 p-0 bg-transparent cursor-pointer" />
                  Personalizada
                </label>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-semibold">Pedidos e pagamento</h2>
            <Field label="WhatsApp que recebe os pedidos" hint="Com DDD. Ex: 67 99999-8888">
              <Input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="67999998888" />
            </Field>
            <Field label="Chave Pix" hint="CPF, CNPJ, e-mail, telefone (+55...) ou chave aleatória. O código Pix de cada pedido usa esta chave.">
              <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
            </Field>
          </Card>

          <Card className="p-5 space-y-5">
            <div>
              <h2 className="font-semibold">Entregas</h2>
              <p className="text-sm text-ink-muted mt-0.5">O cliente informa o CEP e a vitrine mostra só as opções que valem para ele.</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-600" /> Cidade da loja</p>
              <div className="grid sm:grid-cols-[140px_1fr_90px] gap-2">
                <Input inputMode="numeric" placeholder="CEP da loja" value={storeCep} onChange={(e) => fillFromCep(e.target.value)} />
                <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                <Select value={uf} onChange={(e) => setUf(e.target.value)} aria-label="Estado">
                  <option value="">UF</option>
                  {UFS.map((u) => <option key={u}>{u}</option>)}
                </Select>
              </div>
              <p className="text-xs text-ink-soft">Clientes desta cidade veem a entrega local; de outras cidades, o envio.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/[0.06]">
              <p className="text-sm font-semibold flex items-center gap-2"><Bike className="w-4 h-4 text-brand-600" /> Entrega na cidade</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Centro (R$)" hint="Use 0 para grátis."><Input inputMode="decimal" value={shippingLocal} onChange={(e) => setShippingLocal(e.target.value)} /></Field>
                <Field label="Bairros afastados (R$)"><Input inputMode="decimal" value={shippingFar} onChange={(e) => setShippingFar(e.target.value)} /></Field>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-black/[0.06]">
              <Toggle checked={shipNationwide} onChange={setShipNationwide} icon={<Truck className="w-4 h-4 text-brand-600" />} title="Enviar para outras cidades" description="Correios ou transportadora, para todo o Brasil." />
              {shipNationwide && (
                <Field label="Valor fixo do envio (R$)" hint="Deixe em branco para combinar o frete com cada cliente pelo WhatsApp.">
                  <Input inputMode="decimal" value={shippingNational} onChange={(e) => setShippingNational(e.target.value)} placeholder="A combinar" />
                </Field>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-black/[0.06]">
              <Toggle checked={pickupEnabled} onChange={setPickupEnabled} icon={<StoreIcon className="w-4 h-4 text-brand-600" />} title="Retirada na loja" description="O cliente busca o pedido sem pagar frete." />
              {pickupEnabled && (
                <Field label="Endereço / ponto de retirada">
                  <Input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Ex: Rua das Flores, 120 - Centro (seg a sáb, 9h às 18h)" />
                </Field>
              )}
            </div>

            <div className="pt-4 border-t border-black/[0.06]">
              <Field label="Frete grátis acima de (R$)" hint="Vale para a entrega na cidade e o envio com valor fixo. Deixe em branco para desativar.">
                <Input inputMode="decimal" value={freeShippingMin} onChange={(e) => setFreeShippingMin(e.target.value)} placeholder="Ex: 199" />
              </Field>
            </div>
          </Card>

          <div className="sticky bottom-4 flex justify-end">
            <Button type="submit" size="lg" loading={saving} className="shadow-lift">Salvar alterações</Button>
          </div>
        </form>

        {/* Pré-visualização */}
        <div className="lg:sticky lg:top-6 space-y-3">
          <p className="text-sm font-medium text-ink-muted">Pré-visualização</p>
          <div style={brandVars(color)} className="rounded-3xl border border-black/[0.08] bg-white overflow-hidden shadow-soft">
            <div className="bg-[var(--store)] text-[var(--store-ink)] text-[10px] font-medium text-center py-1.5">Pedido direto pelo WhatsApp · Pix na hora</div>
            <div className="flex items-center gap-2 px-4 h-12 border-b border-black/[0.06]">
              <span className="w-7 h-7 rounded-lg bg-[var(--store)] text-[var(--store-ink)] text-sm font-semibold flex items-center justify-center">{(name || 'L').charAt(0).toUpperCase()}</span>
              <span className="font-display font-semibold text-sm truncate">{name || 'Sua loja'}</span>
              <ShoppingBag className="w-4 h-4 ml-auto" />
            </div>
            <div className="p-3">
              <div className="rounded-2xl bg-[var(--store)] text-[var(--store-ink)] p-5">
                <p className="text-[9px] uppercase tracking-widest opacity-70">Bem-vindo(a) à</p>
                <p className="font-display text-xl font-semibold leading-tight">{name || 'Sua loja'}</p>
                <p className="text-xs opacity-85 mt-1 line-clamp-2">{about || 'Sua descrição aparece aqui.'}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div key={i}>
                    <div className="aspect-[4/5] rounded-xl bg-[var(--store-soft)]" />
                    <div className="mt-1.5 h-2 w-3/4 rounded bg-black/10" />
                    <div className="mt-1 h-2 w-1/3 rounded bg-black/20" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2 text-[10px] text-ink-muted">
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {whatsapp ? 'WhatsApp ok' : 'Sem WhatsApp'}</span>
                <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {shipNationwide ? 'Todo o Brasil' : `desde ${formatBRL(Math.min(parseFloat(shippingLocal) || 0, parseFloat(shippingFar) || 0))}`}</span>
              </div>
            </div>
          </div>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm font-medium text-brand-700 hover:underline"><ExternalLink className="w-4 h-4" /> Abrir vitrine real</a>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, icon, title, description }: { checked: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; title: string; description: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center gap-3 text-left">
      <span className="flex-1">
        <span className="text-sm font-semibold flex items-center gap-2">{icon} {title}</span>
        <span className="block text-xs text-ink-muted mt-0.5">{description}</span>
      </span>
      <span className={cx('w-11 h-6 rounded-full p-0.5 transition shrink-0', checked ? 'bg-brand-600' : 'bg-black/15')}>
        <span className={cx('block w-5 h-5 rounded-full bg-white shadow transition', checked && 'translate-x-5')} />
      </span>
    </button>
  );
}
