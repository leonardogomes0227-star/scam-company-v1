import { useEffect, useState } from 'react';
import { Crown, ExternalLink, LayoutDashboard, Lock, LogOut, Megaphone, Menu, Package, Palette, Users, Settings as SettingsIcon, ShoppingBag, Tag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Spinner, cx } from '../components/ui';
import { useToast } from '../components/Toast';
import { useStoreData } from './admin/useStoreData';
import Overview from './admin/Overview';
import Products from './admin/Products';
import Orders from './admin/Orders';
import Coupons from './admin/Coupons';
import Marketing from './admin/Marketing';
import Appearance from './admin/Appearance';
import Customers from './admin/Customers';
import Settings from './admin/Settings';

export type AdminSection = 'overview' | 'products' | 'orders' | 'coupons' | 'customers' | 'marketing' | 'appearance' | 'settings';

const NAV: { id: AdminSection; label: string; icon: typeof Package }[] = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'coupons', label: 'Cupons', icon: Tag },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'settings', label: 'Configurações', icon: SettingsIcon },
];

const SUBSCRIPTION_CHECKOUT_URL = import.meta.env.VITE_SUBSCRIPTION_CHECKOUT_URL || '';

function readSection(): AdminSection {
  try {
    const saved = localStorage.getItem('stck_admin_section') as AdminSection | null;
    return saved && NAV.some((n) => n.id === saved) ? saved : 'overview';
  } catch {
    return 'overview';
  }
}

export default function AdminDashboard({ tenantId }: { tenantId: string }) {
  const { user, logout } = useAuth();
  const data = useStoreData(tenantId);
  const toast = useToast();
  const [section, setSection] = useState<AdminSection>(readSection);
  const [menuOpen, setMenuOpen] = useState(false);

  const storeUrl = `${window.location.origin}${window.location.pathname}#/loja/${tenantId}`;
  const pendingOrders = data.orders.filter((o) => o.status === 'Aguardando Pagamento').length;

  useEffect(() => {
    try {
      localStorage.setItem('stck_admin_section', section);
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  }, [section]);

  // Confere pedidos novos a cada 45s enquanto o painel está aberto e visível.
  const { refreshOrders } = data;
  useEffect(() => {
    const id = window.setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      const added = await refreshOrders();
      if (added > 0) {
        toast(added === 1 ? '🛒 Novo pedido recebido!' : `🛒 ${added} novos pedidos recebidos!`);
        document.title = `(${added}) Novo pedido · STCK`;
        setTimeout(() => (document.title = 'STCK Company'), 8000);
      }
    }, 45000);
    return () => window.clearInterval(id);
  }, [refreshOrders, toast]);

  const goTo = (s: AdminSection) => {
    setSection(s);
    setMenuOpen(false);
  };

  if (data.loading) {
    return <div className="min-h-screen bg-canvas"><Spinner label="Carregando sua loja..." /></div>;
  }

  if (data.tenant && (data.tenant.subscription_status || 'active') !== 'active') {
    const blocked = data.tenant.subscription_status === 'blocked';
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <span className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center"><Lock className="w-6 h-6" /></span>
        <h1 className="mt-5 font-display text-2xl font-semibold">{blocked ? 'Loja bloqueada' : 'Assinatura pendente'}</h1>
        <p className="mt-2 text-ink-muted max-w-md">Para liberar o painel e a vitrine, regularize sua assinatura ou fale com o suporte.</p>
        <div className="mt-6 flex gap-2">
          {SUBSCRIPTION_CHECKOUT_URL && (
            <a href={SUBSCRIPTION_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="h-11 px-5 rounded-xl bg-brand-600 text-white font-semibold flex items-center">Regularizar assinatura</a>
          )}
          <button onClick={logout} className="h-11 px-5 rounded-xl border border-black/10 font-semibold">Sair</button>
        </div>
      </div>
    );
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center justify-between">
        <Logo />
        <button onClick={() => setMenuOpen(false)} className="lg:hidden p-1.5 text-ink-muted" aria-label="Fechar menu"><X className="w-5 h-5" /></button>
      </div>

      <div className="mx-3 mt-2 mb-4 rounded-xl bg-black/[0.03] px-3 py-2.5">
        <p className="text-[11px] text-ink-soft">Sua loja</p>
        <p className="text-sm font-semibold truncate">{data.tenant?.name}</p>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">Ver vitrine <ExternalLink className="w-3 h-3" /></a>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => goTo(item.id)}
            className={cx(
              'w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition',
              section === item.id ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink hover:bg-black/[0.04]',
            )}
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'orders' && pendingOrders > 0 && (
              <span className={cx('min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center', section === item.id ? 'bg-white/20' : 'bg-amber-100 text-amber-800')}>{pendingOrders}</span>
            )}
          </button>
        ))}
        {user?.role === 'SUPER_ADMIN' && (
          <a href="#/admin-global" className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-50">
            <Crown className="w-[18px] h-[18px]" /> Painel global
          </a>
        )}
      </nav>

      <div className="p-3 border-t border-black/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center shrink-0">{(user?.email || '?').charAt(0).toUpperCase()}</span>
          <span className="flex-1 min-w-0 text-xs text-ink-muted truncate">{user?.email}</span>
          <button onClick={logout} className="p-2 rounded-lg text-ink-soft hover:text-red-600 hover:bg-red-50" title="Sair" aria-label="Sair"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas lg:pl-64">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-black/[0.06] z-30">{sidebar}</aside>

      {/* Sidebar mobile */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={() => setMenuOpen(false)}>
          <aside className="w-72 h-full bg-white shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
        </div>
      )}

      {/* Topo mobile */}
      <header className="lg:hidden sticky top-0 z-20 h-14 bg-white/90 backdrop-blur border-b border-black/[0.06] flex items-center justify-between px-4">
        <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2" aria-label="Abrir menu"><Menu className="w-5 h-5" /></button>
        <span className="font-semibold text-sm truncate">{NAV.find((n) => n.id === section)?.label}</span>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="p-2 -mr-2 text-ink-muted" aria-label="Ver vitrine"><ExternalLink className="w-5 h-5" /></a>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-28 lg:pb-10">
        {data.error && (
          <p className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">Alguns dados não carregaram: {data.error}</p>
        )}
        {section === 'overview' && <Overview data={data} storeUrl={storeUrl} goTo={goTo} />}
        {section === 'products' && <Products data={data} tenantId={tenantId} />}
        {section === 'orders' && <Orders data={data} />}
        {section === 'coupons' && <Coupons data={data} tenantId={tenantId} />}
        {section === 'customers' && <Customers data={data} />}
        {section === 'appearance' && <Appearance key={data.tenant?.id} data={data} tenantId={tenantId} storeUrl={storeUrl} />}
        {section === 'marketing' && <Marketing data={data} storeUrl={storeUrl} />}
        {section === 'settings' && <Settings data={data} tenantId={tenantId} storeUrl={storeUrl} />}
      </main>

      {/* Navegação inferior mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-black/[0.06] grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {NAV.filter((n) => ['overview', 'orders', 'products', 'settings'].includes(n.id)).map((item) => (
          <button key={item.id} onClick={() => goTo(item.id)} className={cx('relative h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-medium', section === item.id ? 'text-brand-700' : 'text-ink-soft')}>
            <item.icon className="w-5 h-5" />
            {item.label.split(' ')[0]}
            {item.id === 'orders' && pendingOrders > 0 && <span className="absolute top-2 right-[calc(50%-18px)] w-2 h-2 rounded-full bg-amber-500" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

