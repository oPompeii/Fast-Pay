import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setRecoverySuccess(true);
    } catch (err) {
      setError(err.message);
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
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-navy-800 rounded-lg shadow-lg p-8">
          {!showRecovery ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">
                  <span className="text-emerald-500">Fast</span>Pay
                </h2>
                <p className="text-gray-400 mt-2">Entre na sua conta</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="seu@email.com"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <button
                  onClick={() => setShowRecovery(true)}
                  className="text-emerald-500 hover:text-emerald-400"
                >
                  Esqueceu sua senha?
                </button>
                <p className="text-gray-400">
                  Não tem uma conta?{' '}
                  <Link to="/register" className="text-emerald-500 hover:text-emerald-400">
                    Criar conta
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Recuperar Senha</h2>
                <p className="text-gray-400">
                  Digite seu email para receber instruções de recuperação
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}

              {recoverySuccess ? (
                <div className="text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 rounded-lg p-4 mb-6">
                    Email de recuperação enviado! Verifique sua caixa de entrada.
                  </div>
                  <button
                    onClick={() => {
                      setShowRecovery(false);
                      setRecoverySuccess(false);
                      setRecoveryEmail('');
                    }}
                    className="text-emerald-500 hover:text-emerald-400"
                  >
                    Voltar para o login
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordRecovery} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Voltar para o Login
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}