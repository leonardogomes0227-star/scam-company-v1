import { useState } from 'react';
import { Palmtree, ShoppingBag, Smartphone, CheckCircle2, Video, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black tracking-wider text-white">STCK COMPANY</span>
            <span className="text-[10px] text-zinc-500 block italic">"The World Is Yours"</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#/login" className="text-xs font-bold text-zinc-400 hover:text-white transition-all">
            Fazer Login
          </a>
          <a href="#/register" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10">
            Criar Loja Grátis
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          <Sparkles className="w-4 h-4" /> Fábrica de Roteiros & Teleprompter Integrados
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Sua Loja Virtual Pronta para <span className="text-amber-400">Vender no WhatsApp</span> e Instagram
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
          Cadastre seus produtos, envie seu link exclusivo e receba os pedidos organizados direto no seu WhatsApp com código Pix gerado na hora — além de gravar vídeos virais com nosso teleprompter embutido.
        </p>

        <div className="flex justify-center items-center gap-4 pt-4">
          <a href="#/register" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2">
            Criar Minha Loja Agora <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* CARDS DE BENEFÍCIOS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-left space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">100% Otimizado para Mobile</h3>
            <p className="text-xs text-zinc-400">Seus clientes navegam, escolhem e compram direto pelo celular com extrema velocidade.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-left space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center text-amber-400">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Roteiros & Teleprompter</h3>
            <p className="text-xs text-zinc-400">Gere roteiros automáticos para os seus produtos e grave Reels direto pelo painel sem errar.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-left space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Checkout via WhatsApp</h3>
            <p className="text-xs text-zinc-400">Cada pedido é formatado de forma limpa e enviado direto no chat do seu WhatsApp comercial.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PREÇOS E PLANOS */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-zinc-900 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white">Planos simples e transparentes</h2>
          <p className="text-xs text-zinc-400">Escolha o plano ideal para escalar suas vendas hoje mesmo.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Plano Starter */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-black border border-zinc-800 text-zinc-400 font-bold text-xs rounded-xl">Iniciante</span>
              <h3 className="text-xl font-black text-white">Plano Mensal</h3>
              <div className="text-3xl font-black text-amber-400">R$ 67<span className="text-xs text-zinc-400 font-normal"> /mês</span></div>
              <ul className="space-y-3 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Vitrine online ilimitada</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Pedidos direto no WhatsApp</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Fábrica de Roteiros & Teleprompter</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Alerta de estoque crítico</li>
              </ul>
            </div>
            <a href="#/register" className="w-full py-3.5 bg-black border border-zinc-800 hover:border-amber-500 text-white font-black text-xs rounded-xl transition-all text-center">
              Começar Agora
            </a>
          </div>

          {/* Plano PRO (Destaque) */}
          <div className="bg-zinc-900 border-2 border-amber-500 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-500 text-black font-black text-[10px] rounded-full uppercase tracking-wider">
              Mais Popular
            </div>
            <div className="space-y-4">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-xl">Profissional</span>
              <h3 className="text-xl font-black text-white">Plano Semestral PRO</h3>
              <div className="text-3xl font-black text-amber-400">R$ 197<span className="text-xs text-zinc-400 font-normal"> /6 meses</span></div>
              <ul className="space-y-3 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Tudo do plano mensal</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Prioridade no suporte</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Cupons de desconto avançados</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Exportação de relatórios CSV</li>
              </ul>
            </div>
            <a href="#/register" className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all text-center shadow-lg">
              Garantir Plano PRO
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Palmtree className="w-4 h-4 text-amber-400" /> STCK Company. Todos os direitos reservados.
        </div>
        <p className="italic">"The World Is Yours"</p>
      </footer>

    </div>
  );
}
