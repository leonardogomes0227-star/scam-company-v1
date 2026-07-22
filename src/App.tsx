import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import { Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  // Controle simples de rota pela URL (#/loja ou #/admin) ou estado
  const [currentPage, setCurrentPage] = useState<'landing' | 'storefront' | 'admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#/loja') return 'storefront';
    if (hash === '#/admin') return 'admin';
    return 'landing';
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* O Cabeçalho da Nossa SaaS só aparece na Landing Page ou no Admin */}
      {currentPage === 'landing' && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div onClick={() => setCurrentPage('landing')} className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4 fill-emerald-400" />
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                SCAM <span className="text-emerald-400">COMPANY</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('storefront')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                Ver Demonstração da Loja
              </button>
              <button
                onClick={() => setCurrentPage('admin')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-md"
              >
                Painel do Lojista
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ROTEAMENTO DAS PÁGINAS */}
      <main className={currentPage === 'landing' ? 'pt-16' : ''}>
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'storefront' && <Storefront />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
