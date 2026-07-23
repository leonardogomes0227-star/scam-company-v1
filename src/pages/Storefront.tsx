import { useState, useEffect } from 'react';
import { ShoppingBag, Star, ShieldCheck, MessageCircle } from 'lucide-react';

export default function Storefront() {
  const [storeConfig, setStoreConfig] = useState({ name: 'Minha Loja', about: 'Seja bem-vindo!', whatsapp: '5567999999999', color: '#10b981' });
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    // Carrega dados da loja e produtos do localStorage
    const config = JSON.parse(localStorage.getItem('store_config_lkd-imports') || '{}');
    if (config.name) setStoreConfig(config);

    const prods = JSON.parse(localStorage.getItem('store_products_lkd-imports') || '[]');
    if (prods.length > 0) {
      // Adiciona avaliações simuladas para dar prova social aos produtos
      const prodsWithReviews = prods.map((p: any) => ({
        ...p,
        rating: 4.8,
        reviewsCount: Math.floor(Math.random() * 25) + 5
      }));
      setProducts(prodsWithReviews);
    }
  }, []);

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Header da Vitrine Mobile */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 text-center space-y-2">
        <h1 className="text-xl font-black text-white">{storeConfig.name}</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{storeConfig.about}</p>
      </div>

      {/* Grid de Produtos com Prova Social / Avaliações */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-2xl bg-slate-950" />
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{product.category || 'Destaque'}</span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{product.name}</h3>
                
                {/* Sistema de Avaliações (Estrelas e Reviews) */}
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
