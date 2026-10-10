import { useState, useEffect, useCallback } from 'react';
import { DollarSign, ExternalLink, Lock, LogOut, RefreshCcw, Search, Store, Trash2, Unlock, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Badge, Button, Card, EmptyState, Input, Modal, Spinner, cx } from '../components/ui';
import { useToast } from '../components/Toast';
import { formatBRL, formatDate } from '../lib/format';
import { safeColor } from '../lib/color';
import type { Tenant } from '../types';

// Mesmos valores da página de preços (LandingPage).
const PLAN_PRICES: Record<string, number> = { BASIC: 49, PRO: 97 };
const PLAN_LABEL: Record<string, string> = { BASIC: 'Iniciante', PRO: 'Profissional' };

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [toDelete, setToDelete] = useState<Tenant | null>(null);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (error) toast('Não foi possível carregar as lojas: ' + error.message, true);
    setTenants((data as Tenant[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const isActive = (t: Tenant) => (t.subscription_status || 'active') === 'active';

  const updateTenant = async (id: string, patch: Partial<Tenant>, message: string) => {
    const { error } = await supabase.from('tenants').update(patch).eq('id', id);
    if (error) return toast('Falha ao atualizar: ' + error.message, true);
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    toast(message);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('tenants').delete().eq('id', toDelete.id);
    if (error) return toast('Falha ao remover: ' + error.message, true);
    setTenants((prev) => prev.filter((t) => t.id !== toDelete.id));
    toast('Loja removida.');
    setToDelete(null);
  };

  const active = tenants.filter(isActive);
  const mrr = active.reduce((acc, t) => acc + (PLAN_PRICES[t.plan || 'PRO'] ?? 0), 0);
  const q = search.trim().toLowerCase();
  const visible = tenants.filter((t) => {
    if (filter === 'active' && !isActive(t)) return false;
    if (filter === 'blocked' && isActive(t)) return false;
    return !q || t.name.toLowerCase().includes(q) || t.id.includes(q);
  });

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo compact />
            <span className="font-display font-semibold">Painel global</span>
            <Badge tone="amber">Super Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            {user?.tenantId && <a href="#/admin" className="hidden sm:inline-flex h-9 px-3 items-center text-sm font-medium rounded-lg hover:bg-black/[0.04]">Minha loja</a>}
            <button onClick={logout} className="h-9 px-3 rounded-lg text-sm font-medium text-ink-muted hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5"><LogOut className="w-4 h-4" /> Sair</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Lojas da plataforma</h1>
          <p className="text-ink-muted mt-1">Gerencie assinaturas, planos e o acesso de cada lojista.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat icon={Store} label="Lojas ativas" value={`${active.length}`} hint={`de ${tenants.length} cadastradas`} />
          <Stat icon={Users} label="Bloqueadas / pendentes" value={`${tenants.length - active.length}`} hint="sem acesso ao painel" />
          <Stat icon={DollarSign} label="MRR estimado" value={formatBRL(mrr)} hint="soma dos planos ativos" />
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row gap-2 border-b border-black/[0.06]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou ID" className="pl-10" />
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-black/[0.04]">
              {([['all', 'Todas'], ['active', 'Ativas'], ['blocked', 'Bloqueadas']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)} className={cx('h-9 px-3 rounded-lg text-sm font-medium', filter === id ? 'bg-white shadow-sm' : 'text-ink-muted')}>{label}</button>
              ))}
            </div>
            <Button variant="secondary" onClick={loadTenants} aria-label="Recarregar"><RefreshCcw className={cx('w-4 h-4', loading && 'animate-spin')} /></Button>
          </div>

          {loading && tenants.length === 0 ? (
            <Spinner />
          ) : visible.length === 0 ? (
            <EmptyState icon={<Store className="w-6 h-6" />} title="Nenhuma loja encontrada" />
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {visible.map((t) => (
                <li key={t.id} className="px-4 py-3.5 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-10 h-10 rounded-xl text-white font-semibold flex items-center justify-center shrink-0" style={{ background: safeColor(t.color) }}>{t.name.charAt(0).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.name}</p>
                      <p className="text-xs text-ink-soft truncate">/{t.id} · criada em {formatDate(t.created_at)}{t.whatsapp ? ` · WhatsApp ${t.whatsapp}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => updateTenant(t.id, { plan: t.plan === 'BASIC' ? 'PRO' : 'BASIC' }, 'Plano alterado.')}
                      title="Clique para alternar o plano"
                      className="h-8 px-2.5 rounded-lg border border-black/10 text-xs font-semibold hover:border-black/25"
                    >
                      {PLAN_LABEL[t.plan || 'PRO'] ?? t.plan} · {formatBRL(PLAN_PRICES[t.plan || 'PRO'] ?? 0)}
                    </button>
                    <Badge tone={isActive(t) ? 'green' : 'red'}>{isActive(t) ? 'Ativa' : t.subscription_status === 'pending' ? 'Pendente' : 'Bloqueada'}</Badge>
                    <Button size="sm" variant="secondary" onClick={() => updateTenant(t.id, { subscription_status: isActive(t) ? 'blocked' : 'active' }, isActive(t) ? 'Loja bloqueada.' : 'Loja liberada.')}>
                      {isActive(t) ? <><Lock className="w-3.5 h-3.5" /> Bloquear</> : <><Unlock className="w-3.5 h-3.5" /> Liberar</>}
                    </Button>
                    <a href={`#/loja/${t.id}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-black/[0.04]" aria-label="Ver vitrine"><ExternalLink className="w-4 h-4" /></a>
                    <button onClick={() => setToDelete(t)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-red-600 hover:bg-red-50" aria-label="Excluir loja"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>

      {toDelete && (
        <Modal
          title="Excluir loja?"
          onClose={() => setToDelete(null)}
          footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setToDelete(null)}>Cancelar</Button><Button variant="danger" onClick={confirmDelete}>Excluir permanentemente</Button></div>}
        >
          <p className="text-sm text-ink-muted">A loja <b className="text-ink">{toDelete.name}</b> será removida da plataforma. Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Store; label: string; value: string; hint: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-ink-muted">
        <span className="text-[13px] font-medium">{label}</span>
        <Icon className="w-4 h-4 text-brand-600" />
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-ink-soft mt-0.5">{hint}</p>
    </Card>
  );
}
