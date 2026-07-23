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
    <header className="fixed top-0 inset-x-0 z-50 bg-black/95 text-white backdrop-blur-sm border-b border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => nav('home')} className="flex items-center gap-2.5 group">
          <img
            src="/logo-stck.png"
            alt="STCK Company"
            className="h-9 w-9 rounded-lg object-contain bg-zinc-900 p-1 border border-zinc-700"
          />
          <div className="flex flex-col text-left">
            <span className="font-bold text-lg text-white tracking-wider group-hover:text-amber-400 transition-colors">
              STCK COMPANY
            </span>
            <span className="text-[10px] text-amber-400/80 italic tracking-wide -mt-1">
              "The World Is Yours"
            </span>
          </div>
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
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-amber-400 hover:bg-zinc-800 border border-zinc-700 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black px-4 py-3 space-y-1">
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
          ? 'bg-amber-500 text-black shadow-sm font-semibold'
          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
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
        active ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
