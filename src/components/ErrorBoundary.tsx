import { Component, type ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';

interface State {
  error: Error | null;
}

const RELOAD_KEY = 'stck_chunk_reload_at';

/** Erro típico logo após publicar uma versão nova: o navegador pede um arquivo que não existe mais. */
function isStaleBundleError(error: Error) {
  return /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch/i.test(error.message);
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
    if (isStaleBundleError(error)) {
      // Recarrega uma vez para baixar a versão nova (evita laço se o erro persistir)
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      } catch {
        /* sem sessionStorage */
      }
      if (Date.now() - last > 15000) window.location.reload();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-canvas">
        <h1 className="font-display text-2xl font-semibold">Ops, algo deu errado</h1>
        <p className="text-ink-muted max-w-sm">Recarregue a página para continuar. Se o problema continuar, tente de novo em alguns minutos.</p>
        <button onClick={() => window.location.reload()} className="h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" /> Recarregar
        </button>
      </div>
    );
  }
}
