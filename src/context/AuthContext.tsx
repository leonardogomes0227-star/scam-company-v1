import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

type Role = 'SUPER_ADMIN' | 'STORE_OWNER' | null;

interface User {
  id: string;
  email: string;
  role: Role;
  tenantId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(sessionUserId: string, email: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', sessionUserId)
      .single();

    if (profile) {
      setUser({
        id: sessionUserId,
        email,
        role: profile.role,
        tenantId: profile.tenant_id
      });
    }
  }

  useEffect(() => {
    // Verifica se já existe uma sessão ativa ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email!);
      }
      setLoading(false);
    });

    // Escuta mudanças de login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    await loadProfile(data.user.id, data.user.email!);
    return true;
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
