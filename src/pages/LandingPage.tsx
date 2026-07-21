import { ArrowRight, Store, LayoutDashboard, Zap, MessageCircle, BrainCircuit, CheckCircle, TrendingUp, Shield, Clock } from 'lucide-react';
import { Page } from '@/types';

interface LandingPageProps {
  onNavigate: (p: Page) => void;
}

const features = [
  {
    icon: Store,
    title: 'Vitrine Rápida',
    desc: 'Monte sua loja online em minutos com catálogo de produtos, categorias e busca integrada.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: MessageCircle,
    title: 'Checkout WhatsApp + Pix',
    desc: 'Pedidos finalizados direto no WhatsApp com código Pix gerado automaticamente.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: BrainCircuit,
    title: 'Estúdio de Roteiros IA',
    desc: 'Gere roteiros de vídeo de 15 segundos para seus produtos com um clique.',
    color: 'bg-violet-50 text-violet-600',
  },
];

const stats = [
  { value: '2min', label: 'Para sua loja ir ao ar' },
  { value: '98%', label: 'Taxa de entrega WhatsApp' },
  { value: 'R$0', label: 'Taxa por transação Pix' },
];

const benefits = [
  'Sem mensalidade escondida no primeiro mês',
  'Suporte via WhatsApp em até 2h',
  'Integração nativa com Pix do Banco Central',
  'IA treinada para vendas em português brasileiro',
  'Dashboard em tempo real com métricas de conversão',
  'SSL e hospedagem inclusos no plano',
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Plataforma all-in-one para pequenos negócios
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Sua Vitrine Digital com{' '}
            <span className="text-emerald-600">Automação de WhatsApp,</span>{' '}
            <span className="text-emerald-600">Pix</span> e{' '}
            <span className="relative">
              Criativos de IA
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 9C50 3 100 1 150 3C200 5 250 8 298 6" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>{' '}
            em segundos.
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Venda mais sem complicação. Catálogo online, pagamento via Pix, pedidos pelo WhatsApp e roteiros de vídeo gerados por IA — tudo num só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => onNavigate('loja')}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              <Store className="w-4 h-4" />
              Acessar Demonstração da Loja
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel do Lojista (Admin)
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Três pilares que transformam seu negócio em uma máquina de vendas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative p-7 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300"
                >
                  <div className={`inline-flex p-3 rounded-xl ${f.color} mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Como funciona
            </h2>
            <p className="text-gray-500 text-lg">Em 3 passos simples, sua loja está vendendo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-emerald-200" />
            {[
              { step: '01', icon: Store, title: 'Cadastre seus produtos', desc: 'Adicione nome, foto, preço e categoria. Sua vitrine fica pronta instantaneamente.' },
              { step: '02', icon: TrendingUp, title: 'Cliente escolhe e pede', desc: 'O cliente navega, adiciona ao carrinho e finaliza via WhatsApp com Pix pré-formatado.' },
              { step: '03', icon: BrainCircuit, title: 'IA cria seus criativos', desc: 'Selecione o produto e gere roteiros de 15s para Reels, TikTok e Stories em segundos.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 mb-5">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-emerald-500 tracking-widest mb-2">PASSO {item.step}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
                Por que escolher a{' '}
                <span className="text-emerald-600">Scam Company?</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Criamos a plataforma que pequenos empreendedores merecem: simples, rápida e com as ferramentas certas para crescer.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Segurança', desc: 'Pix oficial do Banco Central' },
                { icon: Clock, label: 'Velocidade', desc: 'Loja no ar em 2 minutos' },
                { icon: MessageCircle, label: 'WhatsApp', desc: 'Checkout conversacional' },
                { icon: BrainCircuit, label: 'IA Nativa', desc: 'Roteiros em português BR' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                    <Icon className="w-8 h-8 text-emerald-600 mb-3" />
                    <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para vender mais?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Explore a demonstração completa agora mesmo — sem cadastro, sem cartão.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('loja')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-lg text-sm"
            >
              <Store className="w-4 h-4" />
              Ver Demonstração da Loja
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white font-semibold rounded-xl border border-emerald-400 hover:bg-emerald-400 transition-all text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Acessar Painel Admin
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/assets/images/Gemini_Generated_Image_grc94xgrc94xgrc9.png" alt="" className="h-6 w-6 rounded" />
          <span className="text-white font-semibold text-sm">Scam Company</span>
        </div>
        <p className="text-gray-500 text-xs">© 2025 Scam Company. E-commerce Platform Tech SaaS.</p>
      </footer>
    </div>
  );
}
