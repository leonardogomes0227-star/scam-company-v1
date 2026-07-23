import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'SUPER_ADMIN' | 'STORE_OWNER' | null;

interface User {
  email: string;
  role: Role;
  tenantId?: string; // ID da loja para o lojista
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Tenta lembrar do usuário se ele recarregar a página
    const saved = localStorage.getItem('saas_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, pass: string) => {
    // 👑 LOGIN DO DONO DA PLATAFORMA (SUPER ADMIN)
    if (email === 'admin@plataforma.com' && pass === '123456') {
      const newUser: User = { email, role: 'SUPER_ADMIN' };
      setUser(newUser);
      localStorage.setItem('saas_auth_user', JSON.stringify(newUser));
      return true;
    }
    
    // 🏪 LOGIN DO LOJISTA (INQUILINO) - Exemplo genérico
    if (email.includes('@loja.com') && pass === '123456') {
      const newUser: User = { email, role: 'STORE_OWNER', tenantId: email.split('@')[0] };
      setUser(newUser);
      localStorage.setItem('saas_auth_user', JSON.stringify(newUser));
      return true;
    }

    // Senha ou E-mail incorretos
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saas_auth_user');
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
