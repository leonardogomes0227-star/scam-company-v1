import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Storefront from './pages/Storefront';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut } from 'lucide-react';

// Criamos um sub-componente para gerenciar as rotas com o Contexto ativo
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
  // 1. ROTAS PÚBLICAS (Acesso Livre)
  // ============================================
  
  // Vitrine White-Label do Lojista (Comprador)
  if (route === '#/loja') return <Storefront />;
  
  // Tela de Autenticação
  if (route === '#/login') return <LoginPage />;
  
  // Landing Page do SaaS (Institucional)
  if (route === '#/' || route === '') {
    return <LandingPage onNavigate={(p: string) => navigateTo(`#/${p}`)} />;
  }

  // ============================================
  // 2. ROTAS PROTEGIDAS (O Guardião)
  // ============================================

  // 👑 PAINEL DO SUPER ADMIN
  if (route === '#/admin-global') {
    // Se não estiver logado, expulsa pro login
    if (!user) return <LoginPage />;
    
    // Se estiver logado mas não for dono da plataforma, barra o acesso
    if (user.role !== 'SUPER_ADMIN') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4 font-sans">
          <h1 className="text-xl font-black text-red-400">Acesso Negado</h1>
          <p className="text-sm text-slate-400">Esta área é restrita aos proprietários do SaaS.</p>
          <button onClick={() => navigateTo('#/admin')} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold transition-all hover:bg-slate-700">Voltar ao meu painel</button>
        </div>
      );
    }
    
    // Acesso Concedido
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

  // 🏪 PAINEL DO LOJISTA (Inquilino)
  if (route === '#/admin') {
    // Se não estiver logado, expulsa pro login
    if (!user) return <LoginPage />;
    
    // Permite que LOJISTAS acessem, e também permite que o SUPER ADMIN acesse (para testar/suporte)
    if (user.role !== 'STORE_OWNER' && user.role !== 'SUPER_ADMIN') {
      return <LoginPage />;
    }

    // Acesso Concedido
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
            <LogOut className="w-3.5 h-3.5" /> Sair da Loja
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Fallback: Se digitar qualquer loucura na URL, volta pra home
  return <LandingPage onNavigate={(p: string) => navigateTo(`#/${p}`)} />;
}

// O App principal apenas encapsula as rotas com o AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
