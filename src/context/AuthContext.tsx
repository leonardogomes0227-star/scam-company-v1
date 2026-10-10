import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import type { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

export type SignUpResult = { ok: true; needsConfirmation: boolean } | { ok: false; error: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, storeName: string, tenantId: string) => Promise<SignUpResult>;
  logout: () => Promise<void>;
  /** true quando o usuário chegou pelo link de "esqueci minha senha" */
  recoveringPassword: boolean;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  finishRecovery: () => void;
}

/** Endereço base do site (sem hash), usado nos links enviados por e-mail. */
const siteUrl = () => `${window.location.origin}${window.location.pathname}`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string, email: string): Promise<User | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile) {
    console.error('[AuthContext] Profile não encontrado:', error?.message ?? userId);
    return null;
  }

  return { id: userId, email, role: profile.role, tenantId: profile.tenant_id ?? undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveringPassword, setRecoveringPassword] = useState(() => /type=recovery/.test(window.location.hash));

  const applySession = useCallback(async (sessionUser: { id: string; email?: string } | null | undefined) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }
    setUser(await fetchProfile(sessionUser.id, sessionUser.email ?? ''));
  }, []);

  useEffect(() => {
    let active = true;

    // Só libera a interface depois que o profile foi carregado — evita mostrar a tela
    // de login por um instante ao recarregar uma rota protegida.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await applySession(session?.user);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true);
      if (event === 'SIGNED_OUT') setUser(null);
      // Chamadas ao Supabase dentro do callback podem travar o client; adia para o próximo tick.
      else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') setTimeout(() => applySession(session?.user), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const profile = await fetchProfile(data.user.id, data.user.email ?? email);
    if (!profile) {
      // Autenticou mas não há profile: desloga para não ficar num estado inválido.
      await supabase.auth.signOut();
      return false;
    }
    setUser(profile);
    return true;
  };

  const signUp = async (email: string, password: string, storeName: string, tenantId: string): Promise<SignUpResult> => {
    // A loja e o profile são criados pelo trigger handle_new_user (supabase/schema.sql).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { store_name: storeName, tenant_id: tenantId }, emailRedirectTo: siteUrl() },
    });

    if (error) return { ok: false, error: error.message };
    if (!data.session || !data.user) return { ok: true, needsConfirmation: true };

    const profile = await fetchProfile(data.user.id, data.user.email ?? email);
    if (!profile) return { ok: false, error: 'Conta criada, mas a loja não foi configurada. Verifique o schema do banco.' };
    setUser(profile);
    return { ok: true, needsConfirmation: false };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.hash = '#/login';
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() });
    return error ? error.message : null;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error ? error.message : null;
  };

  const finishRecovery = () => setRecoveringPassword(false);

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, recoveringPassword, requestPasswordReset, updatePassword, finishRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
