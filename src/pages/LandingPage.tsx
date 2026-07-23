import { Zap, ArrowRight, ShieldCheck, Smartphone, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Header com a Marca Scam Company e o Raio */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Scam <span className="text-emerald-400">Company</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Fazer Login
            </a>
            <a href="#/register" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Criar Loja Grátis
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
          <span>Crie sua Vitrine Digital Mobile em 2 Minutos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Sua Loja Virtual Pronta para Vender no <span className="text-emerald-400">WhatsApp</span> e Instagram
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Cadastre seus produtos, envie seu link exclusivo e receba os pedidos organizados direto no seu WhatsApp com código Pix gerado na hora.
        </p>

        <div>
          <a 
            href="#/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20"
          >
            <span>Criar Minha Loja Agora</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Grid de Benefícios / Features */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white">100% Otimizado para Mobile</h3>
          <p className="text-xs text-slate-400">Seus clientes navegam, escolhem e compram direto pelo celular com extrema velocidade.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white">Controle de Assinaturas SaaS</h3>
          <p className="text-xs text-slate-400">Gerencie lojas ativas, bloqueie inadimplências e monitore seu faturamento mensal automatizado.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white">Checkout via WhatsApp</h3>
          <p className="text-xs text-slate-400">Cada pedido é formatado de forma limpa e enviado direto no chat do seu WhatsApp comercial.</p>
        </div>
      </section>

    </div>
  );
}
