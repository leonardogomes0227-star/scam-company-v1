import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Button, Field, Input } from '../components/ui';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    const success = await login(email.trim(), password);
    setSubmitting(false);
    if (success) window.location.hash = '#/admin';
    else setError(true);
  };

  return (
    <AuthShell
      title="Bem-vindo de volta"
      subtitle="Entre para gerenciar sua loja."
      footer={<>Ainda não tem loja? <a href="#/register" className="font-semibold text-brand-700 hover:underline">Criar conta</a></>}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="E-mail">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@sualoja.com" required autoFocus />
        </Field>
        <Field label="Senha">
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className="pr-11" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <div className="-mt-2 text-right">
          <a href="#/recuperar-senha" className="text-xs font-semibold text-brand-700 hover:underline">Esqueci minha senha</a>
        </div>
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> E-mail ou senha incorretos.
          </p>
        )}
        <Button type="submit" size="lg" loading={submitting} className="w-full">Entrar no painel</Button>
      </form>
    </AuthShell>
  );
}
