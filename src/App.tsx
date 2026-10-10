import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut } from 'lucide-react';

function navigateTo(path: string) {
  window.location.hash = path;
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigateTo(to), [to]);
  return null;
}

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 font-sans p-6 text-center">
      {children}
    </div>
  );
}

function AppRoutes() {
  const { user, loading, logout } = useAuth();
  const [route, setRoute] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ============================================
  // 1. ROTAS PÚBLICAS
  // ============================================

  if (route.startsWith('#/loja/')) {
    const tenantId = decodeURIComponent(route.replace('#/loja/', '').split(/[/?]/)[0]);
    return <Storefront key={tenantId} tenantId={tenantId} />;
  }

  // "#/" é a home; hashes sem "/" (ex: #recursos) são âncoras da landing page.
  if (route === '#/' || !route.startsWith('#/')) {
    return <LandingPage onNavigate={(p: string) => navigateTo(`#/${p}`)} />;
  }

  if (loading) {
    return (
      <FullScreenMessage>
        <p className="text-xs text-slate-400">Carregando...</p>
      </FullScreenMessage>
    );
  }

  if (route === '#/login' || route === '#/register') {
    // Quem já está logado vai direto para o painel.
    if (user) return <Redirect to={user.role === 'SUPER_ADMIN' && !user.tenantId ? '#/admin-global' : '#/admin'} />;
    return route === '#/login' ? <LoginPage /> : <RegisterPage />;
  }

  // ============================================
  // 2. ROTAS PROTEGIDAS
  // ============================================

  if (route === '#/admin-global') {
    if (!user) return <LoginPage />;
    if (user.role !== 'SUPER_ADMIN') {
      return (
        <FullScreenMessage>
          <h1 className="text-xl font-black text-red-400">Acesso Negado</h1>
          <button onClick={() => navigateTo('#/admin')} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold transition-all hover:bg-slate-700">Voltar ao meu painel</button>
        </FullScreenMessage>
      );
    }

    return (
      <div className="min-h-screen bg-black text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-black tracking-wider uppercase">👑 Super Admin | CEO</span>
          <div className="flex items-center gap-3">
            {user.tenantId && (
              <button onClick={() => navigateTo('#/admin')} className="text-amber-400 font-bold hover:underline">Minha loja ↗</button>
            )}
            <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg font-bold transition-all">
              <LogOut className="w-3.5 h-3.5" /> Encerrar Sessão
            </button>
          </div>
        </div>
        <SuperAdminDashboard />
      </div>
    );
  }

  if (route === '#/admin') {
    if (!user) return <LoginPage />;
    if (!user.tenantId) {
      if (user.role === 'SUPER_ADMIN') return <Redirect to="#/admin-global" />;
      return (
        <FullScreenMessage>
          <h1 className="text-xl font-black text-amber-400">Nenhuma loja vinculada</h1>
          <p className="text-xs text-slate-400 max-w-sm">Sua conta ainda não está associada a uma loja. Entre em contato com o suporte.</p>
          <button onClick={logout} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700">Sair</button>
        </FullScreenMessage>
      );
    }

    return (
      <div className="min-h-screen bg-black text-slate-100 font-sans">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-slate-300 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 truncate">
              Usuário: <span className="text-emerald-400">{user.email}</span>
            </span>
            {user.role === 'SUPER_ADMIN' && (
              <button onClick={() => navigateTo('#/admin-global')} className="text-amber-400 font-bold hover:underline transition-all shrink-0">
                Painel Global ↗
              </button>
            )}
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg font-bold transition-all shrink-0">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
        <AdminDashboard tenantId={user.tenantId} />
      </div>
    );
  }

  return (
    <FullScreenMessage>
      <h1 className="text-xl font-black">Página não encontrada</h1>
      <button onClick={() => navigateTo('#/')} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700">Voltar ao início</button>
    </FullScreenMessage>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
