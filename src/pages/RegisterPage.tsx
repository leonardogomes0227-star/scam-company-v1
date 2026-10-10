import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { slugify } from '../lib/format';
import { Store, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeName.trim() || !email.trim() || !password) {
      setError('Preencha todos os campos para continuar.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    // ID da loja baseado no nome (ex: "Trendbox Shop" vira "trendbox-shop").
    // Se já existir, o banco acrescenta um sufixo automaticamente.
    const tenantId = slugify(storeName) || 'loja';

    setSubmitting(true);
    const result = await signUp(email.trim(), password, storeName.trim(), tenantId);
    setSubmitting(false);

    if (!result.ok) {
      setError(translateAuthError(result.error));
      return;
    }
    if (result.needsConfirmation) {
      setAwaitingConfirmation(true);
      return;
    }
    window.location.hash = '#/admin';
  };

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h1 className="text-xl font-black text-white">Confirme seu e-mail</h1>
          <p className="text-xs text-slate-400">
            Enviamos um link de confirmação para <span className="text-white font-bold">{email}</span>.
            Depois de confirmar, é só fazer login para acessar o painel da sua loja.
          </p>
          <a href="#/login" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl">Ir para o login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Crie sua Loja Virtual</h1>
          <p className="text-xs text-slate-400">Configure sua vitrine digital em menos de 2 minutos.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nome da Loja</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                placeholder="Ex: Trendbox Virtual Shop"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                placeholder="contato@sualoja.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Senha do Painel</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                placeholder="Mínimo de 6 caracteres"
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-wait text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
          >
            {submitting ? 'Criando sua loja...' : <>Criar Minha Loja Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Já tem uma conta?{' '}
            <a href="#/login" className="text-emerald-400 font-bold hover:underline">
              Fazer Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) return 'Este e-mail já possui uma conta. Faça login.';
  if (m.includes('password')) return 'Senha inválida: use pelo menos 6 caracteres.';
  if (m.includes('email')) return 'E-mail inválido.';
  return 'Não foi possível criar a conta agora. Tente novamente.';
}
