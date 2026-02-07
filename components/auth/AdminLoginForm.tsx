import React, { useState } from 'react';
import { Lock, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Logo from '../Logo';
import AuthHeader from './AuthHeader';
import { useRateLimit } from '../../hooks/useRateLimit';

const AdminLoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const rateLimiter = useRateLimit('admin_login', {
    maxAttempts: 5,
    cooldownPeriod: 15 * 60 * 1000 // 15 minutes
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimiter.blocked) {
      setError("Muitas tentativas. Por favor, tente novamente mais tarde.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'adminfast',
        password
      });

      if (authError) {
        throw new Error('Credenciais inválidas');
      }

      if (!authData.user) {
        throw new Error('Erro ao fazer login');
      }

      // Get admin profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Perfil não encontrado');
      }

      // Verify admin role and status
      if (profile.role !== 'admin' || !profile.is_active) {
        throw new Error('Acesso não autorizado');
      }

      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      localStorage.removeItem('adminAuth');

      if (!rateLimiter.attempt()) {
        setError("Muitas tentativas. Por favor, tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo className="h-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesso Administrativo
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Usuário
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value="adminfast"
                    disabled
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {rateLimiter.blocked && (
                <div className="text-sm text-yellow-600">
                  Conta temporariamente bloqueada. Tente novamente mais tarde.
                </div>
              )}

              <button
                type="submit"
                disabled={loading || rateLimiter.blocked}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginForm;