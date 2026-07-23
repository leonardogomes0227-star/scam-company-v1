import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  // Controle de Rota por Hash (#)
  const [route, setRoute] = useState<'landing' | 'loja' | 'admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#/loja') return 'loja';
    if (hash === '#/admin') return 'admin';
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/loja') setRoute('loja');
      else if (hash === '#/admin') setRoute('admin');
      else setRoute('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: 'landing' | 'loja' | 'admin') => {
    if (page === 'loja') window.location.hash = '#/loja';
    else if (page === 'admin') window.location.hash = '#/admin';
    else window.location.hash = '';
    setRoute(page);
  };

  // 1. ISOLAMENTO TOTAL DA VITRINE WHITE-LABEL (Sem barra, sem header global)
  if (route === 'loja') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        {/* Botão discreto no topo apenas para você navegar de volta durante o teste */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold">👁️ Modo de Visualização da Vitrine do Cliente</span>
          <button 
            onClick={() => navigateTo('admin')} 
            className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold"
          >
            Voltar ao Painel Admin
          </button>
        </div>
        <Storefront />
      </div>
    );
  }

  // 2. ISOLAMENTO TOTAL DO PAINEL ADMIN (Área de trabalho do Lojista)
  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center text-xs">
          <span className="font-extrabold text-white">⚙️ Painel de Gestão LKD / Carbura MS</span>
          <button 
            onClick={() => navigateTo('loja')} 
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg font-bold"
          >
            Ver Vitrine Publicada ↗
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // 3. LANDING PAGE PRINCIPAL DA SUA PLATAFORMA (Venda do SaaS)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <LandingPage onNavigate={(p: string) => navigateTo(p as any)} />
    </div>
  );
}
