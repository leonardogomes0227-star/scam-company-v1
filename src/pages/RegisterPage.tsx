import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { slugify } from '../lib/format';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { Button, Field, Input } from '../components/ui';

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
      <AuthShell title="Confirme seu e-mail" subtitle="Falta só um passo para abrir sua loja.">
        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 text-sm text-ink-muted">
          <CheckCircle2 className="w-6 h-6 text-brand-600 mb-3" />
          Enviamos um link de confirmação para <b className="text-ink">{email}</b>. Depois de confirmar, é só entrar para acessar o painel.
        </div>
        <a href="#/login" className="mt-6 h-12 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold">Ir para o login</a>
      </AuthShell>
    );
  }

  const slug = slugify(storeName);

  return (
    <AuthShell
      title="Crie sua loja"
      subtitle="Sua vitrine fica pronta em menos de 2 minutos."
      footer={<>Já tem uma conta? <a href="#/login" className="font-semibold text-brand-700 hover:underline">Entrar</a></>}
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <Field label="Nome da loja" hint={slug ? <>Seu link: <span className="font-medium text-ink-muted">…/#/loja/{slug}</span></> : undefined}>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Loja da Marina" required autoFocus />
        </Field>
        <Field label="E-mail">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@sualoja.com" required />
        </Field>
        <Field label="Senha" hint="Mínimo de 6 caracteres.">
          <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </Field>
        {error && (
          <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={submitting} className="w-full">Criar minha loja</Button>
      </form>
    </AuthShell>
  );
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) return 'Este e-mail já possui uma conta. Faça login.';
  if (m.includes('password')) return 'Senha inválida: use pelo menos 6 caracteres.';
  if (m.includes('email')) return 'E-mail inválido.';
  return 'Não foi possível criar a conta agora. Tente novamente.';
}
