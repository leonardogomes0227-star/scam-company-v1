import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeName || !email || !password) {
      setError('Preencha todos os campos para continuar.');
      return;
    }

    // Cria o ID único da loja baseado no nome (ex: "Trendbox Shop" vira "trendbox-shop")
    const tenantId = storeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    // 1. Busca as lojas já cadastradas na plataforma
    const existingTenants = JSON.parse(localStorage.getItem('saas_tenants') || '[]');
    
    // Verifica se o ID da loja já existe
    if (existingTenants.some((t: any) => t.id === tenantId)) {
      setError('Já existe uma loja com esse nome. Escolha outro.');
      return;
    }

    // 2. Adiciona a nova loja na lista do Super Admin
    const newTenant = {
      id: tenantId,
      name: storeName,
      ownerEmail: email,
      plan: 'PRO',
      active: true,
      createdAt: new Date().toISOString()
    };

    const updatedTenants = [...existingTenants, newTenant];
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));

    // 3. Salva também a configuração inicial da loja para a vitrine e o admin dela
    const storeConfig = {
      name: storeName,
      about: 'Bem-vindo à nossa loja digital!',
      whatsapp: '5567999999999',
      pixKey: '00000000000',
    };
    localStorage.setItem(`store_config_${tenantId}`, JSON.stringify(storeConfig));

    // 4. Cria a sessão de login e redireciona direto para o painel do lojista
    // Salvamos temporariamente o usuario no contexto de auth simulando o registro
    const newUser = { email, role: 'STORE_OWNER' as const, tenantId };
    localStorage.setItem('saas_auth_user', JSON.stringify(newUser));

    // Redireciona para o painel de gestão do lojista
    window.location.hash = '#/admin';
    window.location.reload();
  };

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
                placeholder="••••••••"
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
            className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
          >
            Criar Minha Loja Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
