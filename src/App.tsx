import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import { ShoppingBag, LayoutDashboard, Home, Zap } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'storefront' | 'admin'>('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* CABEÇALHO ESCURO / NAVBAR INTEGRADA */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Limpa em SVG */}
          <div 
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              SCAM <span className="text-emerald-400">COMPANY</span>
            </span>
          </div>

          {/* Menu de Navegação */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'landing'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Início</span>
            </button>

            <button
              onClick={() => setCurrentPage('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'storefront'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> <span>Loja</span>
            </button>

            <button
              onClick={() => setCurrentPage('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'admin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> <span>Admin</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ROTEAMENTO DE PÁGINAS */}
      <main className="pt-16">
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'storefront' && <Storefront />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
