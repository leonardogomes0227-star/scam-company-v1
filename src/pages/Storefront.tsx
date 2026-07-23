import { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle } from 'lucide-react';

export default function Storefront({ tenantId }: { tenantId?: string }) {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Procura qual loja o cliente está acessando
    const tenants = JSON.parse(localStorage.getItem('saas_tenants') || '[]');
    const foundStore = tenants.find((t: any) => t.id === tenantId);
    
    if (foundStore) {
      setStore(foundStore);
      
      // 2. Simula os produtos exclusivos de cada loja para mostrar o isolamento
      if (tenantId === 'lkd-imports') {
        setProducts([
          { id: '1', name: 'Fone de Ouvido Bluetooth Pro', price: 149.90, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Eletrônicos' },
          { id: '2', name: 'Smartwatch Esportivo 4K', price: 299.90, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Eletrônicos' }
        ]);
      } else if (tenantId === 'carbura-ms') {
        setProducts([
          { id: '3', name: 'Capacete Moto Esportivo', price: 450.00, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&q=80', category: 'Acessórios' },
          { id: '4', name: 'Luva de Couro Protetora', price: 120.00, image: 'https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?w=500&q=80', category: 'Acessórios' }
        ]);
      } else {
         setProducts([
          { id: '5', name: 'Produto Lançamento', price: 99.90, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80', category: 'Geral' }
        ]);
      }
    }
  }, [tenantId]);

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-black text-red-400 mb-2">Loja não encontrada</h1>
        <p className="text-slate-400 text-sm">Verifique se o link da loja está correto.</p>
      </div>
    );
  }

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER WHITE-LABEL (Sem menção ao SaaS) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
              {store.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-black text-slate-900 leading-tight">{store.name}</h1>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Compra Segura
              </p>
            </div>
          </div>
          <button className="relative p-2 text-slate-600 hover:text-emerald-500 transition-colors">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </header>

      {/* BANNER DA LOJA */}
      <div className="bg-slate-900 py-12 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Bem-vindo à {store.name}</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">{store.config?.about || 'Encontre os melhores produtos com entrega garantida.'}</p>
      </div>

      {/* VITRINE DE PRODUTOS */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.category}</span>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</h4>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-black text-emerald-500">{formatBRL(p.price)}</span>
                </div>
                <button className="w-full py-2.5 bg-slate-900 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-colors">
                  Comprar Agora
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
