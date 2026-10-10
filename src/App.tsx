import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Spinner } from './components/ui';
import LandingPage from './pages/LandingPage';

// Páginas carregadas sob demanda: o visitante da vitrine não baixa o painel.
const Storefront = lazy(() => import('./pages/Storefront'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

function navigateTo(path: string) {
  window.location.hash = path;
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigateTo(to), [to]);
  return null;
}

function FullScreenMessage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-6 text-center gap-3">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
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

  // ---------------- Rotas públicas ----------------
  if (route.startsWith('#/loja/')) {
    const [tenantPart, , productPart] = route.replace('#/loja/', '').split(/[?]/)[0].split('/');
    const tenantId = decodeURIComponent(tenantPart);
    const productId = productPart ? decodeURIComponent(productPart) : undefined;
    return <Storefront key={tenantId} tenantId={tenantId} initialProductId={productId} />;
  }

  // "#/" é a home; hashes sem "/" (ex: #recursos) são âncoras da landing page.
  if (route === '#/' || !route.startsWith('#/')) {
    return <LandingPage onNavigate={(p: string) => navigateTo(`#/${p}`)} />;
  }

  if (loading) return <Spinner />;

  if (route === '#/login' || route === '#/register') {
    if (user) return <Redirect to={user.role === 'SUPER_ADMIN' && !user.tenantId ? '#/admin-global' : '#/admin'} />;
    return route === '#/login' ? <LoginPage /> : <RegisterPage />;
  }

  // ---------------- Rotas protegidas ----------------
  if (route === '#/admin-global') {
    if (!user) return <LoginPage />;
    if (user.role !== 'SUPER_ADMIN') {
      return (
        <FullScreenMessage title="Acesso negado">
          <a href="#/admin" className="text-sm font-semibold text-brand-700 hover:underline">Voltar ao meu painel</a>
        </FullScreenMessage>
      );
    }
    return <SuperAdminDashboard />;
  }

  if (route === '#/admin') {
    if (!user) return <LoginPage />;
    if (!user.tenantId) {
      if (user.role === 'SUPER_ADMIN') return <Redirect to="#/admin-global" />;
      return (
        <FullScreenMessage title="Nenhuma loja vinculada">
          <p className="text-ink-muted max-w-sm">Sua conta ainda não está associada a uma loja. Entre em contato com o suporte.</p>
          <button onClick={logout} className="text-sm font-semibold text-brand-700 hover:underline">Sair</button>
        </FullScreenMessage>
      );
    }
    return <AdminDashboard tenantId={user.tenantId} />;
  }

  return (
    <FullScreenMessage title="Página não encontrada">
      <a href="#/" className="text-sm font-semibold text-brand-700 hover:underline">Voltar ao início</a>
    </FullScreenMessage>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </ToastProvider>
  );
}
