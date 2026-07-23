import { Store, ArrowRight, ShieldCheck, Zap, Smartphone, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-black">
              S
            </div>
            <span className="font-black tracking-tight text-white text-lg">SaaS<span className="text-emerald-400">Store</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('login')} className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
              Fazer Login
            </button>
            <button onClick={() => onNavigate('register')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Criar Loja Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> Crie sua Vitrine Digital Mobile em 2 Minutos
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
            Sua Loja Virtual Pronta para Vender no <span className="text-emerald-400">WhatsApp</span> e Instagram
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Cadastre seus produtos, envie seu link exclusivo e receba os pedidos organizados direto no seu WhatsApp com código Pix gerado na hora.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => onNavigate('register')} 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group"
            >
              Criar Minha Loja Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-slate-900 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-black mb-4">2m</div>
            <h3 className="font-extrabold text-white text-base">Rápido para Configurar</h3>
            <p className="text-xs text-slate-400">Sem códigos complexos. Sua vitrine pronta em instantes.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-black mb-4">0%</div>
            <h3 className="font-extrabold text-white text-base">Taxa Zero sobre Vendas</h3>
            <p className="text-xs text-slate-400">Todo o lucro das suas vendas vai direto para o seu bolso.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-black mb-4">Pix</div>
            <h3 className="font-extrabold text-white text-base">Direto no WhatsApp</h3>
            <p className="text-xs text-slate-400">Pedidos organizados com pagamento instantâneo no seu celular.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
