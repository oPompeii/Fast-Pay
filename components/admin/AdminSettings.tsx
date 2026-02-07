import React, { useState } from 'react';
import { Shield, Key, Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as OTPAuth from 'otpauth';
import { QRCodeCanvas } from 'qrcode.react';

const AdminSettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSecret, setOtpSecret] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (newPassword.length < 8) {
        throw new Error('A nova senha deve ter pelo menos 8 caracteres');
      }

      // Verify current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'ld.durval',
        password: currentPassword
      });

      if (authError) {
        throw new Error('Senha atual incorreta');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate new OTP secret
      const randomBytes = new Uint8Array(20);
      crypto.getRandomValues(randomBytes);
      const secret = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      // Create TOTP with the generated secret
      const totp = new OTPAuth.TOTP({
        issuer: "FastPay",
        label: "ld.durval",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret
      });

      setOtpSecret(totp.secret.base32);
      setShowQRCode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!otpSecret) {
        throw new Error('Segredo 2FA não encontrado');
      }

      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: "FastPay",
        label: "ld.durval",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: otpSecret
      });

      // Verify OTP code
      const isValid = totp.validate({ token: otpCode, window: 1 }) !== null;
      if (!isValid) {
        throw new Error('Código inválido');
      }

      // Update admin profile with 2FA settings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          two_factor_secret: otpSecret
        })
        .eq('email', 'ld.durval');

      if (updateError) throw updateError;

      setSuccess('2FA ativado com sucesso!');
      setShowQRCode(false);
      setOtpCode('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify current password first
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'ld.durval',
        password: currentPassword
      });

      if (authError) {
        throw new Error('Senha incorreta');
      }

      // Update admin profile to disable 2FA
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null
        })
        .eq('email', 'ld.durval');

      if (updateError) throw updateError;

      setSuccess('2FA desativado com sucesso!');
      setCurrentPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Shield className="w-6 h-6 text-emerald-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Configurações de Segurança
        </h2>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Alterar Senha
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha Atual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>

      {/* 2FA Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Autenticação em Dois Fatores (2FA)
        </h3>
        {!showQRCode ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A autenticação em dois fatores adiciona uma camada extra de segurança à sua conta.
            </p>
            <button
              onClick={setup2FA}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Key className="w-4 h-4 mr-2" />
              Configurar 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
              <QRCodeCanvas
                value={`otpauth://totp/FastPay:ld.durval?secret=${otpSecret}&issuer=FastPay`}
                size={200}
                level="H"
              />
              <p className="mt-2 text-sm text-gray-500">
                Escaneie o código QR com seu aplicativo autenticador
              </p>
              <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
                {otpSecret}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Código de Verificação
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite o código"
                />
                <button
                  onClick={verify2FA}
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Verificar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;