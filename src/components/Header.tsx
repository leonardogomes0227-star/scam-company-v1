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
          <div className="h-9 w-9 rounded-lg bg-zinc-900 p-1 border border-zinc-700 flex items-center justify-center overflow-hidden">
            <svg viewBox="-5 -15 110 110" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50,92 C46,78 56,66 48,52 C45,46 46,42 47,39 L53,39 C54,42 52,47 55,53 C63,68 52,79 56,92 Z"
                fill="#F59E0B"
              />
              <g fill="#F59E0B">
                <path d="M50,39 C40,25 40,5 50,-7 C60,5 60,25 50,39 Z" transform="rotate(-70 50 39)" />
                <path d="M50,39 C40,25 40,5 50,-7 C60,5 60,25 50,39 Z" transform="rotate(-35 50 39)" />
                <path d="M50,39 C40,25 40,5 50,-7 C60,5 60,25 50,39 Z" />
                <path d="M50,39 C40,25 40,5 50,-7 C60,5 60,25 50,39 Z" transform="rotate(35 50 39)" />
                <path d="M50,39 C40,25 40,5 50,-7 C60,5 60,25 50,39 Z" transform="rotate(70 50 39)" />
              </g>
            </svg>
          </div>
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
