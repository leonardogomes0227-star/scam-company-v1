import { useState } from 'react';
import { ShieldCheck, Store, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<any[]>(() => {
    const saved = localStorage.getItem('saas_tenants');
    return saved ? JSON.parse(saved) : [
      { id: 'lkd-imports', name: 'LKD Imports', ownerEmail: 'contato@lkd.com', plan: 'PRO', active: true },
      { id: 'carbura-ms', name: 'Carbura MS', ownerEmail: 'vendas@carbura.com', plan: 'BASIC', active: true }
    ];
  });

  const toggleTenantStatus = (id: string) => {
    const updated = tenants.map((t) => (t.id === id ? { ...t, active: !t.active } : t));
    setTenants(updated);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Painel do Super Administrador
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gerencie as assinaturas e lojas do seu SaaS Multi-Tenant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-2"><Store className="w-4 h-4 text-emerald-400" /> Lojas Ativas</span>
            <p className="text-2xl font-black text-white">{tenants.filter(t => t.active).length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Lojistas Cadastrados</span>
            <p className="text-2xl font-black text-white">{tenants.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-400" /> MRR (Recorrência)</span>
            <p className="text-2xl font-black text-white">R$ 590,00</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white">Lojas Cadastradas na Plataforma</h3>
          <div className="grid grid-cols-1 gap-3">
            {tenants.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">{t.name} <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md ml-2 border border-emerald-500/20">{t.plan}</span></h4>
                  <p className="text-xs text-slate-400">Responsável: {t.ownerEmail}</p>
                </div>
                <button
                  onClick={() => toggleTenantStatus(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    t.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {t.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {t.active ? 'Loja Ativa' : 'Loja Bloqueada'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
