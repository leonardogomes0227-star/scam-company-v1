import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Logo } from './Logo';

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas">
      <aside className="hidden lg:flex relative overflow-hidden bg-brand-700 text-white p-12 flex-col justify-between">
        <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/40 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-brand-900/70 blur-3xl" />
        <div className="relative"><Logo dark /></div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight text-balance">Venda mais pelo WhatsApp com uma vitrine profissional.</h2>
          <ul className="mt-8 space-y-3 text-white/85">
            {['Pedidos organizados direto no seu chat', 'Pix Copia e Cola com o valor exato', 'Painel com relatórios, cupons e estoque'].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">"The World Is Yours"</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden"><Logo /></div>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm animate-fade-up">
            <h1 className="font-display text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-ink-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-sm text-ink-muted text-center">{footer}</div>}
          </div>
        </div>
        <a href="#/" className="text-sm text-ink-muted hover:text-ink text-center">← Voltar ao site</a>
      </main>
    </div>
  );
}
