import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ArrowLeft, Check, X } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
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
      setShowTokenInput(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify token through Supabase
      const { error } = await supabase.auth.verifyOtp({
        email: recoveryEmail,
        token: recoveryToken,
        type: 'recovery'
      });

      if (error) throw error;
      setShowTokenInput(false);
      setShowNewPasswordInput(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (newPassword !== confirmNewPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (newPassword.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setRecoverySuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
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
                  onClick={() => {
                    setShowRecovery(true);
                    setError('');
                  }}
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
                {!showTokenInput && !showNewPasswordInput && (
                  <p className="text-gray-400">
                    Digite seu email para receber o código de recuperação
                  </p>
                )}
                {showTokenInput && (
                  <p className="text-gray-400">
                    Digite o código de recuperação enviado para seu email
                  </p>
                )}
                {showNewPasswordInput && (
                  <p className="text-gray-400">
                    Digite sua nova senha
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}

              {recoverySuccess ? (
                <div className="text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 rounded-lg p-4 mb-6 flex items-center gap-2 justify-center">
                    <Check size={20} />
                    <span>Senha alterada com sucesso! Redirecionando...</span>
                  </div>
                </div>
              ) : (
                <>
                  {!showTokenInput && !showNewPasswordInput && (
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
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Enviando...' : 'Enviar Código'}
                      </button>
                    </form>
                  )}

                  {showTokenInput && (
                    <form onSubmit={handleTokenVerification} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Código de Recuperação
                        </label>
                        <input
                          type="text"
                          value={recoveryToken}
                          onChange={(e) => setRecoveryToken(e.target.value)}
                          className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="Digite o código recebido"
                          required
                        />
                        <p className="text-sm text-gray-400 mt-2">
                          Verifique também sua pasta de spam
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Verificando...' : 'Verificar Código'}
                      </button>
                    </form>
                  )}

                  {showNewPasswordInput && (
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nova Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Atualizando...' : 'Atualizar Senha'}
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(false);
                      setShowTokenInput(false);
                      setShowNewPasswordInput(false);
                      setRecoveryEmail('');
                      setRecoveryToken('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setError('');
                    }}
                    className="w-full mt-4 bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Voltar para o Login
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}