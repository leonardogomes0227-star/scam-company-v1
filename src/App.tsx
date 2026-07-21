import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import LandingPage from '@/pages/LandingPage';
import Storefront from '@/pages/Storefront';
import AdminDashboard from '@/pages/AdminDashboard';
import { Product, CartItem, StoreConfig, Page } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CONFIG } from '@/data';

function parseHash(): Page {
  const h = window.location.hash.replace('#/', '').replace('#', '');
  if (h === 'loja') return 'loja';
  if (h === 'admin') return 'admin';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState<Page>(parseHash);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [config, setConfig] = useState<StoreConfig>(INITIAL_CONFIG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setPage(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((p: Page) => {
    window.location.hash = p === 'home' ? '/' : `/${p}`;
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  // Cart actions
  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === p.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product: p, quantity: 1 }];
    });
    setCartOpen(true);
  };
  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  const updateQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  const clearCart = () => setCart([]);

  // Product actions
  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev]);
  const updateProduct = (p: Product) =>
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const toggleProduct = (id: string) =>
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <Header
        page={page}
        onNavigate={navigate}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
      />

      {page === 'home' && <LandingPage onNavigate={navigate} />}
      {page === 'loja' && (
        <Storefront
          products={products}
          config={config}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onQty={updateQty}
          onClear={clearCart}
          cartOpen={cartOpen}
          onCartOpen={() => setCartOpen(true)}
          onCartClose={() => setCartOpen(false)}
        />
      )}
      {page === 'admin' && (
        <AdminDashboard
          products={products}
          config={config}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onToggleProduct={toggleProduct}
          onDeleteProduct={deleteProduct}
          onUpdateConfig={setConfig}
        />
      )}
    </div>
  );
}
