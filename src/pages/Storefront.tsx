import { useState, useEffect } from 'react';
import { ShoppingBag, Star, ShieldCheck, Filter } from 'lucide-react';

export default function Storefront() {
  const [storeConfig, setStoreConfig] = useState({ name: 'Minha Loja', about: 'Seja bem-vindo!', whatsapp: '5567999999999', color: '#10b981' });
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    // Carrega dados da loja e produtos salvos no painel
    const config = JSON.parse(localStorage.getItem('store_config_lkd-imports') || '{}');
    if (config.name) setStoreConfig(config);

    const prods = JSON.parse(localStorage.getItem('store_products_lkd-imports') || '[]');
    if (prods.length > 0) {
      const prodsWithReviews = prods.map((p: any) => ({
        ...p,
        rating: 4.8,
        reviewsCount: Math.floor(Math.random() * 25) + 5
      }));
      setProducts(prodsWithReviews);
    } else {
      setProducts([
        { id: '1', name: 'Fone Bluetooth Pro', price: 149.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', rating: 4.9, reviewsCount: 12 },
        { id: '2', name: 'Smartwatch 4K', price: 299.90, category: 'Eletrônicos', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', rating: 4.7, reviewsCount: 8 },
        { id: '3', name: 'Capacete Esportivo', price: 450.00, category: 'Acessórios', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80', rating: 5.0, reviewsCount: 19 }
      ]);
    }
  }, []);

  // Extrai categorias únicas dinamicamente dos produtos cadastrados
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category || 'Geral')))];

  // Filtra produtos com base na categoria selecionada
  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => (p.category || 'Geral') === selectedCategory);

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Header da Vitrine */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 text-center space-y-2">
        <h1 className="text-xl font-black text-white">{storeConfig.name}</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{storeConfig.about}</p>
      </div>

      {/* Filtros de Categoria Dinâmicos */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0"><Filter className="w-3.5 h-3.5" /> Filtrar:</span>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos Filtrados */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl bg-slate-950" />
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{product.category || 'Geral'}</span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{product.name}</h3>
                
                {/* Avaliações */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-black ml-1 text-white">{product.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">({product.reviewsCount} avaliações)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-sm font-black text-emerald-400">{formatBRL(product.price)}</span>
              <button 
                onClick={() => setCart([...cart, product])}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20"
              >
                Comprar 🛒
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
