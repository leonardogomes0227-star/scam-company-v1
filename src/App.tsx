import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import { Zap } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'storefront' | 'admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#/loja') return 'storefront';
    if (hash === '#/admin') return 'admin';
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/loja') setCurrentPage('storefront');
      else if (hash === '#/admin') setCurrentPage('admin');
      else setCurrentPage('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: 'landing' | 'storefront' | 'admin') => {
    setCurrentPage(page);
    if (page === 'storefront') window.location.hash = '#/loja';
    else if (page === 'admin') window.location.hash = '#/admin';
    else window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* A BARRA DO NOSSO SAAS SÓ APARECE NA LANDING PAGE OU NO ADMIN.
          NA LOJA DO CLIENTE (STOREFRONT) ELA NÃO APARECE PARA NÃO MISTURAR AS MARCAS */}
      {currentPage !== 'storefront' && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            
            <div onClick={() => navigateTo('landing')} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-emerald-400" />
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                SCAM <span className="text-emerald-400">COMPANY</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('storefront')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
              >
                Ver Exemplo de Vitrine
              </button>
              <button
                onClick={() => navigateTo('admin')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all"
              >
                Painel do Lojista
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ROTEAMENTO DAS PÁGINAS */}
      <main className={currentPage !== 'storefront' ? 'pt-16' : ''}>
        {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentPage === 'storefront' && <Storefront />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
