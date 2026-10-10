import { useState, useEffect, useCallback } from 'react';
import { Store, Users, DollarSign, CheckCircle2, Lock, Unlock, Trash2, RefreshCcw, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { formatBRL, formatDate } from '../lib/format';
import type { Tenant } from '../types';

// Mesmos valores exibidos na página de preços (LandingPage).
const PLAN_PRICES: Record<string, number> = { BASIC: 49, PRO: 97 };

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (error) setError('Não foi possível carregar as lojas: ' + error.message);
    setTenants((data as Tenant[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const isActive = (t: Tenant) => (t.subscription_status || 'active') === 'active';

  const updateTenant = async (id: string, patch: Partial<Tenant>) => {
    const { error } = await supabase.from('tenants').update(patch).eq('id', id);
    if (error) {
      setError('Falha ao atualizar a loja: ' + error.message);
      return;
    }
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const toggleTenantStatus = (tenant: Tenant) =>
    updateTenant(tenant.id, { subscription_status: isActive(tenant) ? 'blocked' : 'active' });

  const togglePlan = (tenant: Tenant) => updateTenant(tenant.id, { plan: tenant.plan === 'PRO' ? 'BASIC' : 'PRO' });

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Remover "${tenant.name}" permanentemente? Produtos, pedidos e cupons desta loja também serão apagados.`)) return;
    const { error } = await supabase.from('tenants').delete().eq('id', tenant.id);
    if (error) {
      setError('Falha ao remover a loja: ' + error.message);
      return;
    }
    setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
  };

  const activeTenants = tenants.filter(isActive);
  const mrr = activeTenants.reduce((acc, t) => acc + (PLAN_PRICES[t.plan || 'PRO'] ?? 0), 0);
  const query = search.trim().toLowerCase();
  const visibleTenants = query
    ? tenants.filter((t) => t.name.toLowerCase().includes(query) || t.id.includes(query))
    : tenants;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans p-4 sm:p-8 selection:bg-amber-500 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header do Super Admin */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold mb-2">
              👑 Master Control Level • STCK COMPANY
            </div>
            <h1 className="text-2xl font-black text-white">Painel do Super Administrador</h1>
            <p className="text-xs text-zinc-400">Gerencie assinaturas, status de lojas e o faturamento do seu SaaS. <span className="text-amber-400 italic">"The World Is Yours"</span></p>
          </div>
        </div>

        {/* Cards de Métricas Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Lojas Ativas</span>
              <Store className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{activeTenants.length} <span className="text-xs text-zinc-500 font-normal">/ {tenants.length} total</span></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Lojas Bloqueadas / Pendentes</span>
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{tenants.length - activeTenants.length}</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">MRR (Recorrência Mensal)</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{formatBRL(mrr)}</div>
          </div>
        </div>

        {/* Lista de Lojas / Inquilinos do SaaS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white">Lojas Cadastradas na Plataforma</h3>
              <p className="text-xs text-zinc-400">Controle o acesso e o status de assinatura de cada cliente lojista.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar loja" className="bg-black border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-amber-500" />
              </div>
              <button onClick={loadTenants} className="p-2 bg-black border border-zinc-800 rounded-xl text-zinc-400 hover:text-white" title="Recarregar">
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}

          <div className="space-y-3">
            {!loading && visibleTenants.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-8">Nenhuma loja encontrada.</p>
            )}
            {visibleTenants.map(tenant => (
              <div key={tenant.id} className="bg-black border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{tenant.name}</h4>
                    <button onClick={() => togglePlan(tenant)} title="Alternar plano" className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${tenant.plan === 'PRO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-300'}`}>
                      {tenant.plan || 'PRO'}
                    </button>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${isActive(tenant) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {isActive(tenant) ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {isActive(tenant) ? 'Loja Ativa' : 'Assinatura Bloqueada'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Criada em {formatDate(tenant.created_at)} • ID: <code className="text-zinc-500 font-mono">{tenant.id}</code></p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => toggleTenantStatus(tenant)} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${isActive(tenant) ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
                  >
                    {isActive(tenant) ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {isActive(tenant) ? 'Bloquear Acesso' : 'Liberar Acesso'}
                  </button>

                  <a 
                    href={`#/loja/${tenant.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Ver Vitrine ↗
                  </a>

                  <button 
                    onClick={() => handleDeleteTenant(tenant)} 
                    className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl transition-all"
                    title="Excluir Loja"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
