import { forwardRef, useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Loader2, X } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Botão
// ---------------------------------------------------------------------------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-ink border border-black/10 hover:border-black/20 hover:bg-black/[0.02]',
  ghost: 'text-ink-muted hover:text-ink hover:bg-black/[0.04]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  dark: 'bg-ink text-white hover:bg-black',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

// ---------------------------------------------------------------------------
// Campos de formulário
// ---------------------------------------------------------------------------
const fieldBase =
  'w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-ink placeholder:text-ink-soft transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-black/[0.03]';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cx(fieldBase, 'h-11', className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx(fieldBase, 'py-3 min-h-[88px] resize-y', className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cx(fieldBase, 'h-11 pr-8 cursor-pointer', className)} {...rest} />;
});

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block space-y-1.5', className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Superfícies
// ---------------------------------------------------------------------------
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('bg-white border border-black/[0.07] rounded-2xl shadow-soft', className)}>{children}</div>;
}

export function Badge({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'violet'; children: ReactNode; className?: string }) {
  const tones = {
    neutral: 'bg-black/[0.05] text-ink-muted',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-600/15',
    blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/15',
    violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/15',
  };
  return <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold', tones[tone], className)}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-display font-semibold text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-muted">
      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal e gaveta lateral
// ---------------------------------------------------------------------------
function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
}

export function Modal({ title, onClose, children, footer, size = 'md' }: { title?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cx('w-full bg-white sm:rounded-2xl rounded-t-2xl shadow-lift max-h-[92vh] flex flex-col animate-fade-up', size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg')}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-black/[0.06]">
            <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5" aria-label="Fechar"><X className="w-5 h-5" /></button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-5 flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-black/[0.06] bg-black/[0.015] sm:rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ title, onClose, children, footer }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      <aside role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="w-full max-w-md h-full bg-white shadow-lift flex flex-col animate-slide-in">
        <div className="flex items-center justify-between gap-4 px-5 h-16 border-b border-black/[0.06] shrink-0">
          <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:bg-black/5" aria-label="Fechar"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-black/[0.06] shrink-0">{footer}</div>}
      </aside>
    </div>
  );
}
