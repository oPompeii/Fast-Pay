import React, { useState } from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';
import * as OTPAuth from 'otpauth';
import { TransactionService } from '../../services/transactionService';

interface SendCryptoFormProps {
  selectedCrypto: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const SendCryptoForm: React.FC<SendCryptoFormProps> = ({ selectedCrypto, onSuccess, onCancel }) => {
  const { user } = useAuthStore();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | '2fa'>('details');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const validateTransaction = async () => {
    try {
      setError(null);

      // Validate password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password
      });

      if (authError) throw new Error('Senha incorreta');

      // Validate 2FA if enabled
      if (user?.twoFactorEnabled && user.twoFactorSecret) {
        const totp = new OTPAuth.TOTP({
          issuer: "FastPay",
          label: user.email,
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: user.twoFactorSecret
        });

        const isValid = totp.validate({ token: otpCode, window: 1 }) !== null;
        if (!isValid) throw new Error('Código 2FA inválido');
      }

      // Get recipient's wallet
      const { data: recipientWallet, error: recipientError } = await supabase
        .from('wallets')
        .select('id')
        .eq('address', address)
        .single();

      if (recipientError || !recipientWallet) {
        throw new Error('Carteira de destino não encontrada');
      }

      // Create pending transaction
      const transaction = await TransactionService.createTransaction(
        user?.wallet?.id || '',
        recipientWallet.id,
        parseFloat(amount),
        selectedCrypto
      );

      setTransactionId(transaction.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      setStep('2fa');
      return;
    }
    await validateTransaction();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Enviar {selectedCrypto}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'details' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Endereço de Destino
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantidade
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  step="0.00000001"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    {selectedCrypto}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            {user?.twoFactorEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código 2FA
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
            )}
          </>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            {loading ? (
              'Processando...'
            ) : step === 'details' ? (
              <>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Próximo
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Confirmar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendCryptoForm;