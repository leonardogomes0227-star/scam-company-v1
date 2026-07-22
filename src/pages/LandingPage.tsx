import { 
  ShoppingBag, Zap, MessageCircle, QrCode, Sparkles, 
  ArrowRight, ShieldCheck, Layers, Play
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'storefront' | 'admin') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HERO SECTION */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow de Fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" /> A Infraestrutura Definitiva para Vender nas Redes Sociais
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Transforme Tráfego em <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Vendas Líquidas</span> Sem Comissões
        </h1>

        <p className="mt-6 text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Sua loja digital mobile-first com checkout direto no WhatsApp, gerador de Pix automático e IA para criar roteiros virais de Reels/TikTok.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('storefront')}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" /> Ver Demonstração da Loja <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" /> Testar Painel do Lojista
          </button>
        </div>

        {/* METRICAS RAPIDAS */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-900">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-white">&lt; 1 seg</h4>
            <p className="text-xs text-slate-500 mt-1">Carregamento Mobile</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-emerald-400">0%</h4>
            <p className="text-xs text-slate-500 mt-1">Taxas de Marketplace</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-white">100%</h4>
            <p className="text-xs text-slate-500 mt-1">Direto no WhatsApp</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-emerald-400">IA Nativ.</h4>
            <p className="text-xs text-slate-500 mt-1">Criador de Criativos</p>
          </div>
        </div>
      </section>

      {/* PILARES DO PRODUTO */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Por que é mais eficaz?</span>
          <h2 className="text-3xl font-extrabold text-white">Tudo o que seu negócio precisa para girar estoque rápido</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Checkout Sem Atrito</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O cliente navega, adiciona ao carrinho e envia o pedido pronto diretamente no seu WhatsApp com valor, itens e dados de entrega.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Pix Automático na Tela</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gere o código Copia e Cola Pix na hora para o comprador pagar antes mesmo de iniciar a conversa. Dinheiro caindo na sua conta na hora.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 transition-all group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Estúdio de Criativos IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sem ideias do que postar? A IA gera ganchos persuasivos, sugestões de vídeos curtos e legendas prontas para seus produtos em 1 clique.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER BÁSICO */}
      <footer className="py-12 px-4 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© 2026 - Plataforma de Automação de Vendas & Inteligência Comercial.</p>
      </footer>
    </div>
  );
}
