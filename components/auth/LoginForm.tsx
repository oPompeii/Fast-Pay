import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import Logo from '../Logo';
import Toast from '../Toast';
import { useToast } from '../../hooks/useToast';
import AuthHeader from './AuthHeader';
import { useRateLimit } from '../../hooks/useRateLimit';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast, hideToast, toast } = useToast();
  const rateLimiter = useRateLimit('login', {
    maxAttempts: 5,
    cooldownPeriod: 15 * 60 * 1000 // 15 minutes
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registration') === 'success') {
      showToast('success', 'Cadastro realizado com sucesso! Complete seu perfil para começar.');
    }
  }, [location, showToast]);

  const createInitialProfile = async (userId: string, userEmail: string) => {
    try {
      // First create the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          level: 'Token',
          is_active: true,
          registration_status: 'demo'
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Then create the wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0,
          fastcoin_balance: 0
        })
        .select()
        .single();

      if (walletError) {
        // Cleanup profile if wallet creation fails
        await supabase.from('profiles').delete().eq('id', userId);
        throw walletError;
      }

      return {
        ...profile,
        wallet: {
          id: wallet.id,
          balance: wallet.balance,
          fastcoin: wallet.fastcoin_balance
        }
      };
    } catch (error) {
      console.error('Error in createInitialProfile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimiter.blocked) {
      setError("Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Log login attempt before auth
      await supabase
        .from('security_logs')
        .insert([{
          event_type: 'login_attempt',
          severity: 'info',
          details: {
            email: email.toLowerCase(),
            timestamp: new Date().toISOString()
          }
        }]);

      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (authError) {
        rateLimiter.attempt();
        throw new Error('Email ou senha incorretos');
      }

      if (!authData?.user) {
        throw new Error('Erro ao fazer login');
      }

      // Get or create profile
      let profile;
      try {
        // First try to get existing profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*, wallet:wallets(id, balance, fastcoin_balance)')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!existingProfile) {
          // Profile doesn't exist, create it
          profile = await createInitialProfile(authData.user.id, authData.user.email!);
          showToast('info', 'Por favor, complete seu perfil para começar a usar a plataforma.');
        } else {
          profile = existingProfile;
        }

        // Set user data
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          birthDate: profile.birth_date,
          address: profile.address,
          avatar_url: profile.avatar_url,
          level: profile.level,
          referralCode: profile.referral_code,
          twoFactorEnabled: profile.two_factor_enabled,
          twoFactorSecret: profile.two_factor_secret,
          wallet: profile.wallet?.[0] ? {
            id: profile.wallet[0].id,
            balance: profile.wallet[0].balance,
            fastcoin: profile.wallet[0].fastcoin_balance
          } : undefined
        });

        // Log successful login after profile exists
        await supabase
          .from('security_logs')
          .insert([{
            user_id: profile.id,
            event_type: 'login_success',
            severity: 'info',
            details: {
              method: 'password',
              timestamp: new Date().toISOString()
            }
          }]);

        // Redirect based on profile status
        if (profile.registration_status === 'demo') {
          navigate('/dashboard/settings');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error getting/creating profile:', err);
        // Try to sign out on profile error
        await supabase.auth.signOut().catch(console.error);
        throw new Error('Erro ao carregar perfil. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      rateLimiter.attempt();

      // Log failed login attempt
      await supabase
        .from('security_logs')
        .insert([{
          event_type: 'login_failed',
          severity: 'warning',
          details: {
            email: email.toLowerCase(),
            error: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        }]);
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
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              criar uma nova conta
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="seu@email.com"
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
                    placeholder="••••••••"
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
                  Conta temporariamente bloqueada. Tente novamente em {Math.ceil(rateLimiter.remainingTime / 60000)} minutos.
                </div>
              )}

              <button
                type="submit"
                disabled={loading || rateLimiter.blocked}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {loading ? (
                  'Entrando...'
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Não tem uma conta?
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  to="/register"
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={hideToast}
          />
        )}
      </div>
    </>
  );
};

export default LoginForm;