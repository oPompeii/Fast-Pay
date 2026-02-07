import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import useAuthStore from '../../store/authStore';
import { use2FA } from '../../hooks/use2FA';
import TwoFactorForm from '../auth/TwoFactorForm';
import TwoFactorAuthModal from '../auth/TwoFactorAuthModal';

const SecurityDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { loading, error, setup2FA, disable2FA } = use2FA();
  const [showQRCode, setShowQRCode] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [otpSecret, setOtpSecret] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSetup2FA = async () => {
    try {
      const { secret, uri } = await setup2FA();
      setOtpSecret(secret);
      setShowQRCode(true);
    } catch (err) {
      console.error('Error setting up 2FA:', err);
    }
  };

  const handleVerificationSuccess = () => {
    setShowQRCode(false);
    setShowVerification(false);
    setSuccess('2FA ativado com sucesso!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDisable2FA = async () => {
    setShowDisableForm(true);
  };

  const handleDisableSuccess = () => {
    setShowDisableForm(false);
    setSuccess('2FA desativado com sucesso!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Segurança da Conta
          </h2>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Lock className="w-6 h-6 text-emerald-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Autenticação em Dois Fatores (2FA)
            </h3>
          </div>
          {user?.twoFactorEnabled ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ativado
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Desativado
            </span>
          )}
        </div>

        {!user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              A autenticação em dois fatores adiciona uma camada extra de segurança à sua conta.
              Após ativar, você precisará fornecer um código gerado pelo seu aplicativo autenticador
              além da sua senha ao fazer login.
            </p>
            <button
              onClick={handleSetup2FA}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Configurando...' : 'Ativar 2FA'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    2FA está ativado para sua conta
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDisable2FA}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Lock className="w-4 h-4 mr-2" />
              Desativar 2FA
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && otpSecret && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Configurar 2FA
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                <QRCodeCanvas
                  value={`otpauth://totp/FastPay:${user?.email}?secret=${otpSecret}&issuer=FastPay`}
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

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowQRCode(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    setShowVerification(true);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && otpSecret && (
        <TwoFactorForm
          onSuccess={handleVerificationSuccess}
          onCancel={() => setShowVerification(false)}
          secret={otpSecret}
          email={user?.email || ''}
          userId={user?.id || ''}
        />
      )}

      {/* Disable 2FA Modal */}
      {showDisableForm && user?.twoFactorSecret && (
        <TwoFactorAuthModal
          onSuccess={handleDisableSuccess}
          onCancel={() => setShowDisableForm(false)}
        />
      )}
    </div>
  );
};

export default SecurityDashboard;