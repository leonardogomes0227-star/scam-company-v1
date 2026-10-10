import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { Button, Field, Input } from '../components/ui';

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
      <AlertCircle className="w-4 h-4 shrink-0" /> {message}
    </p>
  );
}

/**
 * Recuperação de senha em duas telas:
 * - sem link: pede o e-mail e envia o link de recuperação;
 * - chegando pelo link do e-mail: define a nova senha.
 */
export default function ResetPasswordPage() {
  const { recoveringPassword, requestPasswordReset, updatePassword, finishRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  if (passwordChanged) {
    return (
      <AuthShell title="Senha alterada!" subtitle="Tudo certo, você já pode usar a nova senha.">
        <a href="#/admin" onClick={finishRecovery} className="h-12 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold">Ir para o painel</a>
      </AuthShell>
    );
  }

  if (recoveringPassword) {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.');
      if (password !== confirm) return setError('As senhas não conferem.');
      setSubmitting(true);
      const err = await updatePassword(password);
      setSubmitting(false);
      if (err) return setError('Não foi possível trocar a senha. O link pode ter expirado — peça um novo.');
      setPasswordChanged(true);
    };

    return (
      <AuthShell title="Crie uma nova senha" subtitle="Escolha uma senha que você não use em outros sites.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nova senha" hint="Mínimo de 6 caracteres.">
            <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
          </Field>
          <Field label="Repita a nova senha">
            <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </Field>
          {error && <ErrorBox message={error} />}
          <Button type="submit" size="lg" loading={submitting} className="w-full">Salvar nova senha</Button>
        </form>
      </AuthShell>
    );
  }

  if (linkSent) {
    return (
      <AuthShell title="Confira seu e-mail" subtitle="Enviamos um link para criar uma nova senha.">
        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 text-sm text-ink-muted">
          <CheckCircle2 className="w-6 h-6 text-brand-600 mb-3" />
          Se existir uma conta com <b className="text-ink">{email}</b>, o link chega em alguns minutos. Olhe também a caixa de spam.
        </div>
        <a href="#/login" className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:underline">Voltar para o login</a>
      </AuthShell>
    );
  }

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const err = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (err) setError(/rate|seconds/i.test(err) ? 'Aguarde um minuto antes de pedir outro link.' : 'Não foi possível enviar o e-mail agora. Tente novamente.');
    else setLinkSent(true);
  };

  return (
    <AuthShell
      title="Esqueceu a senha?"
      subtitle="Informe seu e-mail e enviamos um link para criar outra."
      footer={<a href="#/login" className="font-semibold text-brand-700 hover:underline">Voltar para o login</a>}
    >
      <form onSubmit={request} className="space-y-4">
        <Field label="E-mail">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@sualoja.com" required autoFocus />
        </Field>
        {error && <ErrorBox message={error} />}
        <Button type="submit" size="lg" loading={submitting} className="w-full">Enviar link</Button>
      </form>
    </AuthShell>
  );
}
