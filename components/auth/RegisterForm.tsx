import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Logo from '../Logo';
import AuthHeader from './AuthHeader';
import { useRateLimit } from '../../hooks/useRateLimit';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const rateLimiter = useRateLimit('registration', {
    maxAttempts: 5,
    cooldownPeriod: 15 * 60 * 1000 // 15 minutes
  });

  const validateForm = () => {
    // Validate required fields
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      setError('Todos os campos são obrigatórios');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    // Validate phone format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Número de telefone inválido');
      return false;
    }

    // Validate password
    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    // Validate birth date if provided
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        setError('Você deve ter pelo menos 18 anos');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimiter.blocked) {
      setError("Sistema temporariamente indisponível. Por favor, aguarde alguns minutos antes de tentar novamente.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if email exists first
      const { data: emailExists, error: emailCheckError } = await supabase
        .rpc('check_email_exists', { p_email: formData.email.toLowerCase() });

      if (emailCheckError) throw emailCheckError;
      if (emailExists) {
        throw new Error('Este email já está em uso');
      }

      // Begin transaction
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            name: formData.name
          },
          emailRedirectTo: `${window.location.origin}/login?registration=success`
        }
      });

      if (signUpError) {
        if (signUpError.status === 429 || signUpError.message?.includes('rate limit')) {
          throw new Error('Sistema temporariamente indisponível. Por favor, aguarde alguns minutos antes de tentar novamente.');
        }
        if (signUpError.message?.includes('already registered')) {
          throw new Error('Este email já está em uso');
        }
        throw signUpError;
      }

      if (!user) {
        throw new Error('Erro ao criar conta');
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: formData.email.toLowerCase(),
          name: formData.name,
          birth_date: formData.birthDate,
          phone: formData.phone,
          address: formData.address,
          referral_code_used: formData.referralCode,
          is_active: true,
          level: 'Token',
          registration_status: 'demo'
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, sign out and clean up
        await supabase.auth.signOut();
        throw profileError;
      }

      // Create wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          fastcoin_balance: 0
        });

      if (walletError) {
        // If wallet creation fails, sign out and clean up
        await supabase.auth.signOut();
        throw walletError;
      }

      // Create referral network entry if referral code was used
      if (formData.referralCode) {
        const { data: upline } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', formData.referralCode)
          .single();

        if (upline) {
          const { error: networkError } = await supabase
            .from('referral_network')
            .insert({
              user_id: user.id,
              upline_id: upline.id,
              level: 1
            });

          if (networkError) {
            console.error('Error creating referral network:', networkError);
            // Non-critical error, don't throw
          }
        }
      }

      // Log successful registration
      await supabase.rpc('log_registration_event_safe', {
        p_user_id: profile.id,
        p_email: formData.email.toLowerCase(),
        p_event_type: 'registration_success',
        p_success: true
      });

      // Redirect to login page with success message
      navigate('/login?registration=success');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Track failed attempt
      rateLimiter.attempt();
      
      // Handle specific error cases
      let errorMessage = 'Erro ao criar conta. Por favor, tente novamente.';
      
      if (err instanceof Error) {
        if (err.message.includes('already registered') || err.message.includes('already in use')) {
          errorMessage = 'Este email já está em uso';
        } else if (err.message.includes('Invalid password')) {
          errorMessage = 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números';
        } else if (err.message.includes('rate limit') || err.message.includes('over_email_send_rate_limit')) {
          errorMessage = 'Sistema temporariamente indisponível. Por favor, aguarde alguns minutos antes de tentar novamente.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      // Log failed registration safely
      try {
        await supabase.rpc('log_registration_event_safe', {
          p_user_id: null,
          p_email: formData.email.toLowerCase(),
          p_event_type: 'registration_failed',
          p_success: false
        });
      } catch {
        // Ignore logging errors
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo className="h-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              entrar em uma conta existente
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  Data de Nascimento
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="birthDate"
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres, incluindo letras e números
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+55 11 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <div className="mt-1 grid grid-cols-1 gap-y-3">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Rua"
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Número"
                      value={formData.address.number}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, number: e.target.value }
                      })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={formData.address.complement}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, complement: e.target.value }
                      })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Bairro"
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, neighborhood: e.target.value }
                    })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Estado"
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value }
                      })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <select
                      value={formData.address.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value }
                      })}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">País</option>
                      <option value="BR">Brasil</option>
                      <option value="PT">Portugal</option>
                      <option value="FR">França</option>
                      <option value="IT">Itália</option>
                      <option value="ES">Espanha</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                  Código de Afiliado (opcional)
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Já tem uma conta?
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  to="/login"
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Fazer login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;