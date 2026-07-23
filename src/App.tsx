import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut } from 'lucide-react';

function AppRoutes() {
  const { user, logout } = useAuth();
  const [route, setRoute] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  // ============================================
  // 1. ROTAS PÚBLICAS (Vitrines Dinâmicas)
  // ============================================
  
  // Lê a URL. Se começar com "#/loja/", extrai o ID da loja e abre a vitrine correta.
  if (route.startsWith('#/loja/')) {
    const tenantId = route.replace('#/loja/', '');
    return <Storefront tenantId={tenantId} />;
  }
  
  // Se acessar apenas "#/loja" sem informar de quem é a loja
  if (route === '#/loja') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-black text-red-400 mb-2">Link Inválido</h1>
        <p className="text-slate-400 text-sm">Você precisa acessar o link completo da loja. Ex: #/loja/lkd-imports</p>
      </div>
    );
  }
  
  if (route === '#/login') return <LoginPage />;
  
  if (route === '#/' || route === '') {
    return <LandingPage onNavigate={(p: string) => navigateTo(`#/${p}`)} />;
  }

  // ============================================
  // 2. ROTAS PROTEGIDAS (Painéis de Gestão)
  // ============================================

  if (route === '#/admin-global') {
    if (!user) return <LoginPage />;
    if (user.role !== 'SUPER_ADMIN') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 font-sans">
          <h1 className="text-xl font-black text-red-400">Acesso Negado</h1>
          <button onClick={() => navigateTo('#/admin')} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold transition-all hover:bg-slate-700">Voltar ao meu painel</button>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-black tracking-wider uppercase">👑 Super Admin | CEO</span>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg font-bold transition-all">
            <LogOut className="w-3.5 h-3.5" /> Encerrar Sessão
          </button>
        </div>
        <SuperAdminDashboard />
      </div>
    );
  }

  if (route === '#/admin') {
    if (!user) return <LoginPage />;
    if (user.role !== 'STORE_OWNER' && user.role !== 'SUPER_ADMIN') return <LoginPage />;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Usuário: <span className="text-emerald-400">{user.email}</span>
            </span>
            {user.role === 'SUPER_ADMIN' && (
              <button onClick={() => navigateTo('#/admin-global')} className="text-amber-400 font-bold hover:underline transition-all">
                Voltar pro Global ↗
              </button>
            )}
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg font-bold transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return <LandingPage onNavigate={(p: string) => navigateTo(`#/${p}`)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
