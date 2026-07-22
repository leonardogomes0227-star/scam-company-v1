import { 
  ShoppingBag, Zap, MessageCircle, QrCode, Sparkles, 
  ArrowRight, ShieldCheck, Layers, Smartphone, CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'storefront' | 'admin') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HERO SECTION - COPY DE ALTA CONVERSÃO */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" /> Crie sua Vitrine Digital Mobile em 2 Minutos
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Sua Loja Virtual Pronta para Vender no <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">WhatsApp e Instagram</span>
        </h1>

        <p className="mt-6 text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Cadastre seus produtos, envie seu link exclusivo e receba os pedidos organizados direto no seu WhatsApp com código Pix gerado na hora. Zero comissões por venda.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('admin')}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Criar Minha Loja Agora <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('storefront')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" /> Ver Exemplo de Vitrine
          </button>
        </div>

        {/* MÉTRICAS CHAVE */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-900">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-white">2 Min</h4>
            <p className="text-xs text-slate-500 mt-1">Para Configurar</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-emerald-400">0%</h4>
            <p className="text-xs text-slate-500 mt-1">Taxa sobre Vendas</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-white">100%</h4>
            <p className="text-xs text-slate-500 mt-1">Direto no WhatsApp</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-900">
            <h4 className="text-2xl font-black text-emerald-400">IA Integrada</h4>
            <p className="text-xs text-slate-500 mt-1">Gerador de Roteiros</p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Simples e Rápido</span>
          <h2 className="text-3xl font-extrabold text-white">Como funciona na prática?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">1</div>
            <h3 className="text-xl font-extrabold text-white">Cadastre Seus Produtos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adicione fotos, preços promocionais e variações (tamanhos/cores) de forma extremamente simples pelo seu painel exclusivo.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">2</div>
            <h3 className="text-xl font-extrabold text-white">Divulgue Seu Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coloque o link da sua vitrine na bio do Instagram ou envie diretamente para seus clientes nas redes sociais.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">3</div>
            <h3 className="text-xl font-extrabold text-white">Receba Pedidos Prontos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O cliente seleciona os itens e manda o pedido detalhado no seu WhatsApp, já com código Pix pronto para pagamento.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© 2026 - Plataforma de Automação de Vitrines Virtuais.</p>
      </footer>
    </div>
  );
}
