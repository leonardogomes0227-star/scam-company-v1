import { ShoppingCart, Store, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/types';

interface HeaderProps {
  page: Page;
  onNavigate: (p: Page) => void;
  cartCount: number;
  onCartOpen: () => void;
}

export default function Header({ page, onNavigate, cartCount, onCartOpen }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (p: Page) => {
    onNavigate(p);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => nav('home')} className="flex items-center gap-2.5 group">
          <img
            src="/assets/images/Gemini_Generated_Image_grc94xgrc94xgrc9.png"
            alt="Scam Company"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="font-bold text-lg text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">
            Scam Company
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavBtn active={page === 'home'} onClick={() => nav('home')}>Início</NavBtn>
          <NavBtn active={page === 'loja'} onClick={() => nav('loja')}>
            <Store className="w-4 h-4 mr-1.5" />Loja
          </NavBtn>
          <NavBtn active={page === 'admin'} onClick={() => nav('admin')}>
            <LayoutDashboard className="w-4 h-4 mr-1.5" />Admin
          </NavBtn>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {page === 'loja' && (
            <button
              onClick={onCartOpen}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <MobileNavBtn active={page === 'home'} onClick={() => nav('home')}>Início</MobileNavBtn>
          <MobileNavBtn active={page === 'loja'} onClick={() => nav('loja')}>Loja</MobileNavBtn>
          <MobileNavBtn active={page === 'admin'} onClick={() => nav('admin')}>Admin</MobileNavBtn>
        </div>
      )}
    </header>
  );
}

function NavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

function MobileNavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
