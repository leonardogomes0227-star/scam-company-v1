// src/components/AbandonedCartCapture.tsx
import React, { useState } from 'react';

interface CheckoutCaptureProps {
  cartItems: any[];
  onProceed: (contact: { name: string; whatsapp: string }) => void;
}

export function AbandonedCartCapture({ cartItems, onProceed }: CheckoutCaptureProps) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp || whatsapp.length < 10) {
      alert('Por favor, informe um WhatsApp válido.');
      return;
    }

    // Salva o lead no localStorage para o motor de recuperação caso caia a sessão
    const leadData = { name, whatsapp, items: cartItems, timestamp: new Date().toISOString() };
    localStorage.setItem('scam_abandoned_lead', JSON.stringify(leadData));

    // Segue para o fluxo de pagamento/frete
    onProceed({ name, whatsapp });
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-xl max-w-md mx-auto text-white shadow-xl">
      <h3 className="text-lg font-bold mb-2">Quase lá! 🚀</h3>
      <p className="text-sm text-gray-300 mb-4">
        Informe seus dados rápidos para garantir seu pedido e calcular o frete com precisão.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Seu Nome</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Carlos Silva"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">WhatsApp (com DDD)</label>
          <input 
            type="tel" 
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ex: 11999999999"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 font-semibold py-2.5 rounded-lg text-sm transition text-slate-950"
        >
          Continuar para Frete e Pagamento
        </button>
      </form>
    </div>
  );
}
