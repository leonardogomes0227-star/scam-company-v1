import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

export default function App() {
  const [route, setRoute] = useState<'landing' | 'loja' | 'admin' | 'super-admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#/loja') return 'loja';
    if (hash === '#/admin') return 'admin';
    if (hash === '#/admin-global') return 'super-admin';
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/loja') setRoute('loja');
      else if (hash === '#/admin') setRoute('admin');
      else if (hash === '#/admin-global') setRoute('super-admin');
      else setRoute('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: 'landing' | 'loja' | 'admin' | 'super-admin') => {
    if (page === 'loja') window.location.hash = '#/loja';
    else if (page === 'admin') window.location.hash = '#/admin';
    else if (page === 'super-admin') window.location.hash = '#/admin-global';
    else window.location.hash = '';
    setRoute(page);
  };

  // 1. ÁREA EXCLUSIVA DO SUPER ADMIN (PLATFORM OWNER)
  if (route === 'super-admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-bold">👑 Super Administrador da Plataforma SaaS</span>
          <button onClick={() => navigateTo('admin')} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg hover:text-white">
            Ver Painel de Lojista
          </button>
        </div>
        <SuperAdminDashboard />
      </div>
    );
  }

  // 2. PAINEL DO LOJISTA (STORE OWNER)
  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold">🏪 Painel de Gestão da Loja</span>
          <div className="flex gap-2">
            <button onClick={() => navigateTo('super-admin')} className="px-2.5 py-1 bg-slate-800 text-amber-400 rounded-lg font-bold">
              Ir para Super Admin
            </button>
            <button onClick={() => navigateTo('loja')} className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold">
              Ver Vitrine ↗
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // 3. VITRINE WHITE-LABEL (CUSTOMER)
  if (route === 'loja') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Storefront />
      </div>
    );
  }

  // 4. LANDING PAGE PRINCIPAL (VENDA DO SAAS)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <LandingPage onNavigate={(p: string) => navigateTo(p as any)} />
    </div>
  );
}
