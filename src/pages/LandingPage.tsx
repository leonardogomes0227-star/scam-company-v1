import { useEffect, useState } from 'react';
import {
  ArrowRight, BarChart3, Check, ChevronDown, Clapperboard, Link2, Menu, MessageCircle, Package, QrCode, ShoppingBag,
  Smartphone, Sparkles, Store, Truck, X, Zap,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { cx } from '../components/ui';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

const NAV = [
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'precos', label: 'Preços' },
  { id: 'faq', label: 'Dúvidas' },
];

const STEPS = [
  { icon: Store, title: 'Crie sua loja', text: 'Cadastre-se, escolha o nome e a cor da sua marca. Sua vitrine fica no ar na hora.' },
  { icon: Package, title: 'Cadastre os produtos', text: 'Foto, preço, estoque e categoria. Tudo pelo celular, em poucos segundos por produto.' },
  { icon: Link2, title: 'Compartilhe o link', text: 'Coloque na bio do Instagram, no status e nos grupos. Os pedidos chegam prontos no seu WhatsApp.' },
];

const FEATURES = [
  { icon: Smartphone, title: 'Vitrine profissional', text: 'Loja rápida e bonita no celular, com busca, categorias, favoritos e página de produto.' },
  { icon: MessageCircle, title: 'Pedido direto no WhatsApp', text: 'O cliente monta o carrinho e o pedido chega formatado: itens, endereço, frete e total.' },
  { icon: QrCode, title: 'Pix Copia e Cola', text: 'Cada pedido gera um código Pix com o valor exato, direto para a sua chave. Sem taxa por venda.' },
  { icon: Truck, title: 'Venda para todo o Brasil', text: 'O cliente digita o CEP e vê entrega local, retirada na loja ou envio para a cidade dele. Frete grátis por valor mínimo.' },
  { icon: BarChart3, title: 'Painel e relatórios', text: 'Acompanhe faturamento, ticket médio, mais vendidos e estoque baixo num só lugar.' },
  { icon: Clapperboard, title: 'Roteiros e teleprompter', text: 'Gere roteiros de vídeo para cada produto e grave com o teleprompter embutido.' },
];

const PLANS = [
  {
    name: 'Iniciante',
    price: 49,
    description: 'Para quem está começando a vender pelo WhatsApp.',
    features: ['Até 100 produtos', 'Vitrine com link exclusivo', 'Pix Copia e Cola em cada pedido', 'Cupons de desconto', 'Suporte por chat'],
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 97,
    description: 'Para quem quer escalar com vídeo e dados.',
    features: ['Produtos ilimitados', 'Tudo do Iniciante', 'Relatórios completos', 'Roteiros e teleprompter', 'Prioridade no suporte', 'Sem taxa por venda'],
    highlight: true,
  },
];

const FAQ = [
  { q: 'Como recebo o dinheiro das vendas?', a: 'O Pix vai direto para a chave que você cadastrar no painel. A STCK não intermedia o pagamento e não cobra taxa por venda.' },
  { q: 'Preciso de conhecimento técnico?', a: 'Não. Você cria a conta, cadastra os produtos e compartilha o link. Tudo funciona pelo celular.' },
  { q: 'O cliente precisa criar conta para comprar?', a: 'Não. Ele escolhe os produtos, informa nome, WhatsApp e endereço e o pedido é enviado para você.' },
  { q: 'Como funcionam os roteiros e o teleprompter?', a: 'Você escolhe um produto e o objetivo do vídeo; o painel monta gancho, corpo e chamada. Depois é só abrir o teleprompter e gravar.' },
  { q: 'Posso personalizar a minha loja?', a: 'Sim: nome, descrição, cor da marca, WhatsApp, chave Pix e valores de frete são configurados no painel.' },
];

const DEMO_PRODUCTS = [
  { name: 'Vestido Midi Azul', price: 'R$ 89,90', tone: 'from-sky-200 to-sky-400' },
  { name: 'Bolsa Couro Caramelo', price: 'R$ 129,90', tone: 'from-amber-200 to-amber-500' },
  { name: 'Tênis Casual Branco', price: 'R$ 199,90', tone: 'from-zinc-100 to-zinc-300' },
  { name: 'Óculos Retrô', price: 'R$ 59,90', tone: 'from-rose-200 to-rose-400' },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [chatCycle, setChatCycle] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setChatCycle((c) => c + 1), 7000);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // O app usa rotas por hash (#/...), então as âncoras rolam a página manualmente.
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink overflow-x-hidden">
      {/* ================= HEADER ================= */}
      <header className={cx('sticky top-0 z-40 transition-all', scrolled ? 'bg-canvas/85 backdrop-blur-md border-b border-black/[0.06]' : 'bg-transparent')}>
        <div className="max-w-6xl mx-auto px-5 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={scrollTo(n.id)} className="px-3 py-2 text-sm text-ink-muted hover:text-ink rounded-lg transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#/login" onClick={go('login')} className="hidden sm:inline-flex h-10 px-4 items-center text-sm font-medium text-ink hover:bg-black/[0.04] rounded-xl">Entrar</a>
            <a href="#/register" onClick={go('register')} className="inline-flex h-10 px-4 items-center gap-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors">
              Criar loja <ArrowRight className="w-4 h-4 hidden sm:block" />
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 -mr-2 text-ink" aria-label="Menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-black/[0.06] bg-canvas px-5 py-3 space-y-1 animate-fade-in">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={scrollTo(n.id)} className="block px-3 py-2.5 text-[15px] text-ink rounded-lg hover:bg-black/[0.04]">{n.label}</a>
            ))}
            <a href="#/login" onClick={go('login')} className="block px-3 py-2.5 text-[15px] font-semibold text-brand-700 rounded-lg hover:bg-black/[0.04]">Entrar na minha conta</a>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative">
        <div aria-hidden className="absolute -top-40 right-[-10%] w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(14,107,79,0.12),transparent_65%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 pt-10 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold animate-fade-up">
              <Sparkles className="w-3.5 h-3.5" /> Vitrine + WhatsApp + Pix + envio para todo o Brasil
            </span>
            <h1 className="mt-5 font-display font-semibold text-[40px] leading-[1.05] sm:text-6xl text-balance animate-fade-up [animation-delay:80ms]">
              Sua loja vende sozinha no <span className="text-brand-600">WhatsApp</span>
            </h1>
            <p className="mt-5 text-lg text-ink-muted leading-relaxed max-w-xl animate-fade-up [animation-delay:160ms]">
              Monte sua vitrine em minutos, compartilhe o link e receba pedidos organizados no chat — com Pix Copia e Cola gerado
              na hora e roteiros prontos para gravar seus vídeos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up [animation-delay:240ms]">
              <a href="#/register" onClick={go('register')} className="inline-flex h-12 px-6 items-center justify-center gap-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-600/20 transition-colors">
                Criar minha loja agora <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#como-funciona" onClick={scrollTo('como-funciona')} className="inline-flex h-12 px-6 items-center justify-center font-semibold text-ink bg-white border border-black/10 hover:border-black/20 rounded-xl transition-colors">
                Ver como funciona
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted animate-fade-up [animation-delay:320ms]">
              {['Pronta em 2 minutos', 'Sem taxa por venda', 'Venda na cidade e no Brasil todo'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-600" /> {t}</li>
              ))}
            </ul>
          </div>

          {/* Celular com conversa */}
          <div className="flex justify-center lg:justify-end animate-fade-up [animation-delay:200ms]">
            <div className="relative">
              <div className="absolute -left-10 top-16 hidden sm:flex items-center gap-2 bg-white rounded-2xl shadow-lift px-4 py-3 z-10">
                <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center"><ShoppingBag className="w-4 h-4" /></span>
                <span className="text-xs leading-tight"><span className="block font-semibold text-ink">Novo pedido</span><span className="text-ink-muted">R$ 219,80 · Pix</span></span>
              </div>
              <div className="absolute -right-8 bottom-6 hidden sm:flex items-center gap-2 bg-white rounded-2xl shadow-lift px-4 py-3 z-10">
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><Zap className="w-4 h-4" /></span>
                <span className="text-xs leading-tight"><span className="block font-semibold text-ink">Cupom aplicado</span><span className="text-ink-muted">BEMVINDO10</span></span>
              </div>
              <div className="w-[290px] h-[580px] rounded-[44px] bg-[#0B141A] border-[10px] border-[#1a1a1a] shadow-[0_40px_80px_-30px_rgba(16,25,15,0.45)] overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1a1a1a] rounded-b-2xl z-10" />
                <div className="bg-[#1F2C34] pt-9 pb-3 px-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-brand-700 text-white text-xs font-semibold flex items-center justify-center">M</span>
                  <span className="leading-tight"><span className="block text-white text-[13px] font-semibold">Loja da Marina</span><span className="text-[11px] text-[#8ea3a8]">online</span></span>
                </div>
                <div key={chatCycle} className="p-3.5 flex flex-col gap-2 text-[12.5px] leading-snug">
                  <div className="chat-bubble self-start max-w-[82%] bg-[#1F2C34] text-[#E9EDEF] rounded-xl rounded-tl-sm px-3 py-2 [animation-delay:.3s]">Oi! Vi o vestido azul na sua loja, ainda tem M?</div>
                  <div className="chat-bubble self-end max-w-[82%] bg-[#025C4C] text-[#E9EDEF] rounded-xl rounded-tr-sm px-3 py-2 [animation-delay:1.1s]">
                    Tem sim! Separei pra você 💙
                    <div className="mt-2 h-16 rounded-md bg-gradient-to-br from-sky-300 to-sky-600" />
                  </div>
                  <div className="chat-bubble self-start max-w-[82%] bg-[#1F2C34] text-[#E9EDEF] rounded-xl rounded-tl-sm px-3 py-2 [animation-delay:1.9s]">Perfeito, quero levar!</div>
                  <div className="chat-bubble self-end max-w-[86%] bg-[#152A22] border border-brand-500/40 text-[#E9EDEF] rounded-xl rounded-tr-sm px-3 py-2 [animation-delay:2.7s]">
                    <span className="block text-[10.5px] font-bold text-[#57C08A] mb-1">🛒 PEDIDO PED-7KQ2 · PIX GERADO</span>
                    1x Vestido Midi Azul (M)<br />Frete: R$ 10,00<br /><b>Total: R$ 99,90</b>
                  </div>
                  <div className="chat-bubble self-start max-w-[82%] bg-[#1F2C34] text-[#E9EDEF] rounded-xl rounded-tl-sm px-3 py-2 [animation-delay:3.5s]">Pago! Segue o comprovante ✅</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segmentos */}
        <div className="border-y border-black/[0.06] bg-white/60">
          <div className="max-w-6xl mx-auto px-5 py-5 flex items-center gap-x-8 gap-y-2 flex-wrap justify-center text-sm text-ink-muted">
            <span className="font-semibold text-ink">Feito para quem vende:</span>
            {['Moda e acessórios', 'Cosméticos', 'Eletrônicos', 'Doces e delivery', 'Artesanato', 'Suplementos'].map((s) => <span key={s}>{s}</span>)}
          </div>
        </div>
      </section>

      {/* ================= COMO FUNCIONA ================= */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-5 py-20 sm:py-28 scroll-mt-20">
        <SectionHead eyebrow="Como funciona" title="Do cadastro ao primeiro pedido em 3 passos" />
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative bg-white rounded-2xl border border-black/[0.07] p-6 shadow-soft">
              <span className="absolute top-6 right-6 font-display text-5xl font-semibold text-black/[0.05]">{i + 1}</span>
              <span className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center"><s.icon className="w-5 h-5" /></span>
              <h3 className="mt-5 font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= RECURSOS ================= */}
      <section id="recursos" className="bg-white border-y border-black/[0.06] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-5 py-20 sm:py-28">
          <SectionHead eyebrow="Recursos" title="Tudo que você precisa para vender sem complicação" subtitle="Ferramentas pensadas para o pequeno lojista que vende pelo WhatsApp e pelo Instagram." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06] rounded-2xl overflow-hidden border border-black/[0.06]">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-7 group">
                <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors"><f.icon className="w-5 h-5" /></span>
                <h3 className="mt-5 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DEMONSTRAÇÃO ================= */}
      <section className="max-w-6xl mx-auto px-5 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Sua vitrine</span>
            <h2 className="mt-3 font-display font-semibold text-3xl sm:text-4xl text-balance">Uma loja com a cara da sua marca</h2>
            <p className="mt-4 text-ink-muted leading-relaxed">Escolha a cor, escreva sua descrição e pronto: a vitrine se adapta à sua identidade. Seus clientes navegam, favoritam, aplicam cupom e finalizam o pedido em poucos toques.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {['Página de produto com avaliações reais', 'Carrinho com quantidades e controle de estoque', 'Rastreio do pedido pelo código', 'Cupons, tamanhos/cores e preço promocional', 'Entrega local, retirada e envio por CEP'].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-3xl border border-black/[0.07] shadow-lift overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 h-10 border-b border-black/[0.06] bg-black/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-300" /><span className="w-2.5 h-2.5 rounded-full bg-amber-300" /><span className="w-2.5 h-2.5 rounded-full bg-green-300" />
              <span className="ml-3 text-[11px] text-ink-soft truncate">stck.company/#/loja/loja-da-marina</span>
            </div>
            <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-7 text-white">
              <p className="text-[11px] uppercase tracking-widest opacity-80">Bem-vinda</p>
              <p className="font-display text-2xl font-semibold">Loja da Marina</p>
              <p className="text-sm opacity-90">Moda feminina com entrega na cidade toda</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {DEMO_PRODUCTS.map((p) => (
                <div key={p.name} className="rounded-xl border border-black/[0.06] overflow-hidden">
                  <div className={`h-24 bg-gradient-to-br ${p.tone}`} />
                  <div className="p-3">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-sm font-semibold">{p.price}</span>
                      <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center"><ShoppingBag className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREÇOS ================= */}
      <section id="precos" className="bg-white border-y border-black/[0.06] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-5 py-20 sm:py-28">
          <SectionHead center eyebrow="Planos" title="Preço simples, sem taxa por venda" subtitle="Escolha o plano ideal para o momento do seu negócio. Troque quando quiser." />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.name} className={cx('relative rounded-3xl p-8 border', plan.highlight ? 'bg-ink text-white border-ink shadow-lift' : 'bg-canvas border-black/[0.08]')}>
                {plan.highlight && <span className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-semibold">Mais popular</span>}
                <h3 className="font-display font-semibold text-xl">{plan.name}</h3>
                <p className={cx('mt-1 text-sm', plan.highlight ? 'text-white/70' : 'text-ink-muted')}>{plan.description}</p>
                <p className="mt-6 font-display font-semibold text-5xl">R$ {plan.price}<span className={cx('text-base font-normal', plan.highlight ? 'text-white/60' : 'text-ink-muted')}>/mês</span></p>
                <ul className="mt-7 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5"><Check className={cx('w-4 h-4 shrink-0', plan.highlight ? 'text-brand-300' : 'text-brand-600')} /> {f}</li>
                  ))}
                </ul>
                <a
                  href="#/register"
                  onClick={go('register')}
                  className={cx('mt-8 h-12 flex items-center justify-center rounded-xl font-semibold transition-colors', plan.highlight ? 'bg-brand-500 hover:bg-brand-400 text-white' : 'bg-white border border-black/10 hover:border-black/25 text-ink')}
                >
                  Começar com o {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-20 sm:py-28 scroll-mt-16">
        <SectionHead center eyebrow="Dúvidas frequentes" title="Tudo o que você precisa saber" />
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group bg-white rounded-2xl border border-black/[0.07] px-5 open:shadow-soft">
              <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="w-4 h-4 text-ink-muted shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-5 -mt-1 text-sm text-ink-muted leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-14 sm:p-16 text-center text-white">
          <div aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-500/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-brand-900/60 blur-3xl" />
          <h2 className="relative font-display font-semibold text-3xl sm:text-4xl text-balance">Pronto para vender no automático?</h2>
          <p className="relative mt-4 text-white/75 max-w-xl mx-auto">Crie sua loja agora e receba o primeiro pedido ainda hoje.</p>
          <a href="#/register" onClick={go('register')} className="relative mt-8 inline-flex h-12 px-7 items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors">
            Criar minha loja <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ================= RODAPÉ ================= */}
      <footer className="border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={scrollTo(n.id)} className="hover:text-ink">{n.label}</a>)}
            <a href="#/login" onClick={go('login')} className="hover:text-ink">Entrar</a>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-5 pb-8 text-xs text-ink-soft">© {new Date().getFullYear()} STCK Company · Feito para quem vende todo dia no WhatsApp.</div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title, subtitle, center }: { eyebrow: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cx('mb-12 max-w-2xl', center && 'mx-auto text-center')}>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</span>
      <h2 className="mt-3 font-display font-semibold text-3xl sm:text-4xl text-balance">{title}</h2>
      {subtitle && <p className="mt-4 text-ink-muted leading-relaxed">{subtitle}</p>}
    </div>
  );
}
