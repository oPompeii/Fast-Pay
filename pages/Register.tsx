import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Lock, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { generateAffiliateCode, isValidAffiliateCode } from '../lib/utils';

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCodeFromURL = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    birthDate: '',
    referralCode: referralCodeFromURL || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate affiliate code when it changes
    if (name === 'referralCode' && value) {
      setValidatingCode(true);
      setCodeValidated(false);
      setError('');

      try {
        // First validate format
        if (!isValidAffiliateCode(value)) {
          setError('Formato de código inválido. Use o formato: FAST1234A');
          setValidatingCode(false);
          return;
        }

        // Then check if code exists in database
        const { data: codes, error: codeError } = await supabase
          .from('affiliate_codes')
          .select('code')
          .eq('code', value);

        if (codeError) throw codeError;

        if (!codes || codes.length === 0) {
          setError('Código de afiliado inválido ou não encontrado');
        } else {
          setCodeValidated(true);
        }
      } catch (err) {
        console.error('Error validating code:', err);
        setError('Erro ao validar código de afiliado');
      } finally {
        setValidatingCode(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Validate affiliate code if provided
      if (formData.referralCode) {
        if (!codeValidated) {
          throw new Error('Por favor, aguarde a validação do código de afiliado ou use um código válido');
        }
      }

      // Generate unique affiliate code
      const affiliateCode = generateAffiliateCode();

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado. Por favor, faça login.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          birth_date: formData.birthDate,
          referral_code: affiliateCode,
          status: 'ACTIVE'
        });

      if (profileError) throw profileError;

      // Create wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: authData.user.id,
          fastcoin_balance: 0
        });

      if (walletError) throw walletError;

      // Create affiliate code record
      const { error: affiliateCodeError } = await supabase
        .from('affiliate_codes')
        .insert({
          user_id: authData.user.id,
          code: affiliateCode
        });

      if (affiliateCodeError) throw affiliateCodeError;

      // Process referral if code provided
      if (formData.referralCode) {
        const { data: referrer, error: referrerError } = await supabase
          .from('affiliate_codes')
          .select('user_id')
          .eq('code', formData.referralCode)
          .maybeSingle();

        if (referrerError || !referrer) {
          throw new Error('Código de afiliado inválido ou não encontrado');
        }

        // Create level 1 connection
        const { error: level1Error } = await supabase
          .from('affiliate_network')
          .insert({
            referrer_id: referrer.user_id,
            referred_id: authData.user.id,
            level: 1
          });

        if (level1Error) throw level1Error;

        // Find and create level 2 connection if exists
        const { data: parentReferrer } = await supabase
          .from('affiliate_network')
          .select('referrer_id')
          .eq('referred_id', referrer.user_id)
          .eq('level', 1)
          .single();

        if (parentReferrer) {
          await supabase
            .from('affiliate_network')
            .insert({
              referrer_id: parentReferrer.referrer_id,
              referred_id: authData.user.id,
              level: 2
            });
        }

        // Create notification for referrer
        await supabase
          .from('notifications')
          .insert({
            user_id: referrer.user_id,
            type: 'NEW_REFERRAL',
            title: 'Novo Afiliado',
            message: `${formData.name} se juntou à sua rede de afiliados`,
            read: false
          });
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Erro ao criar conta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <Link 
        to="/"
        className="text-gray-300 hover:text-white p-4 flex items-center gap-2 self-start"
      >
        <ArrowLeft size={20} />
        Voltar para Home
      </Link>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-navy-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">
              <span className="text-emerald-500">Fast</span>Pay
            </h2>
            <p className="text-gray-400 mt-2">Criar sua conta</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Nascimento
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-4 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Endereço Completo
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Rua, número, complemento, cidade, estado"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código de Afiliado {referralCodeFromURL && '(Preenchido automaticamente)'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className={`bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none ${
                    codeValidated 
                      ? 'focus:ring-emerald-500 border-emerald-500' 
                      : error 
                        ? 'focus:ring-red-500 border-red-500'
                        : 'focus:ring-emerald-500'
                  }`}
                  placeholder="Código de quem te indicou (opcional)"
                />
                {validatingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
                  </div>
                )}
                {codeValidated && !validatingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    ✓
                  </div>
                )}
              </div>
              {formData.referralCode && !validatingCode && (
                <p className={`mt-1 text-sm ${codeValidated ? 'text-emerald-500' : 'text-red-500'}`}>
                  {codeValidated ? 'Código válido!' : error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (formData.referralCode && !codeValidated)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-400">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;