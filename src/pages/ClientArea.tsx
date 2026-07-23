// src/pages/ClientArea.tsx
import React, { useState, useEffect } from 'react';

export function ClientArea() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de busca de pedidos do cliente autenticado
    setTimeout(() => {
      setPedidos([
        {
          id: "ORD-98421",
          data: "2026-07-23",
          total: "149.90",
          status: "Em trânsito",
          rastreio: "AA123456785BR",
          nfeUrl: "#"
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="p-6 text-white text-center">Carregando seus pedidos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Meus Pedidos e Rastreio</h2>
      
      {pedidos.length === 0 ? (
        <p className="text-gray-400">Você ainda não realizou nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-emerald-400">{pedido.id}</span>
                <span className="text-sm text-gray-400">{pedido.data}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400 block">Total:</span> 
                  R$ {pedido.total}
                </div>
                <div>
                  <span className="text-gray-400 block">Status:</span> 
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs font-medium">
                    {pedido.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Rastreio:</span> 
                  <span className="font-mono text-cyan-300">{pedido.rastreio}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <a 
                  href={pedido.nfeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-medium rounded transition"
                >
                  Baixar Nota Fiscal
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
