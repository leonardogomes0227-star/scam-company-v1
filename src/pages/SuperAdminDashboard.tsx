import { useState, useEffect } from 'react';
import { Store, Users, DollarSign, ShieldAlert, CheckCircle2, Lock, Unlock, Trash2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = () => {
    const saved = JSON.parse(localStorage.getItem('saas_tenants') || '[]');
    if (saved.length === 0) {
      // Lojas iniciais padrão se não houver nenhuma
      const initialTenants = [
        { id: 'lkd-imports', name: 'LKD Imports', ownerEmail: 'contato@lkd.com', plan: 'PRO', active: true, createdAt: '2026-01-10' },
        { id: 'carbura-ms', name: 'Carbura MS', ownerEmail: 'vendas@carbura.com', plan: 'BASIC', active: true, createdAt: '2026-02-15' }
      ];
      localStorage.setItem('saas_tenants', JSON.stringify(initialTenants));
      setTenants(initialTenants);
    } else {
      setTenants(saved);
    }
  };

  const toggleTenantStatus = (id: string) => {
    const updated = tenants.map(t => {
      if (t.id === id) {
        return { ...t, active: !t.active };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta loja permanentemente da plataforma?')) {
      const updated = tenants.filter(t => t.id !== id);
      setTenants(updated);
      localStorage.setItem('saas_tenants', JSON.stringify(updated));
    }
  };

  // Cálculo Dinâmico do MRR com base nos planos (PRO = R$ 349, BASIC = R$ 149, por exemplo)
  const calculateMRR = () => {
    return tenants
      .filter(t => t.active)
      .reduce((acc, t) => {
        const price = t.plan === 'PRO' ? 349 : 199;
        return acc + price;
      }, 0);
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const activeStoresCount = tenants.filter(t => t.active).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header do Super Admin */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold mb-2">
              👑 Master Control Level
            </div>
            <h1 className="text-2xl font-black text-white">Painel do Super Administrador</h1>
            <p className="text-xs text-slate-400">Gerencie assinaturas, status de lojas e o faturamento do seu SaaS.</p>
          </div>
        </div>

        {/* Cards de Métricas Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Lojas Ativas</span>
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{activeStoresCount} <span className="text-xs text-slate-500 font-normal">/ {tenants.length} total</span></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Lojistas Cadastrados</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{tenants.length}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">MRR (Recorrência Mensal)</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{formatBRL(calculateMRR())}</div>
          </div>
        </div>

        {/* Lista de Lojas / Inquilinos do SaaS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-white">Lojas Cadastradas na Plataforma</h3>
            <p className="text-xs text-slate-400">Controle o acesso e o status de assinatura de cada cliente lojista.</p>
          </div>

          <div className="space-y-3">
            {tenants.map(tenant => (
              <div key={tenant.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-white">{tenant.name}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${tenant.plan === 'PRO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'}`}>
                      {tenant.plan || 'BASIC'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${tenant.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {tenant.active ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {tenant.active ? 'Loja Ativa' : 'Assinatura Bloqueada'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Responsável: <span className="text-slate-200">{tenant.ownerEmail}</span> • ID: <code className="text-slate-500 font-mono">{tenant.id}</code></p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => toggleTenantStatus(tenant.id)} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${tenant.active ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                  >
                    {tenant.active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {tenant.active ? 'Bloquear Acesso' : 'Liberar Acesso'}
                  </button>

                  <a 
                    href={`#/loja/${tenant.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Ver Vitrine ↗
                  </a>

                  <button 
                    onClick={() => handleDeleteTenant(tenant.id)} 
                    className="p-2 bg-slate-900 border border-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all"
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
