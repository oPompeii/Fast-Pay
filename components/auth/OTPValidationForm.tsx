import React, { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as OTPAuth from 'otpauth';

interface OTPValidationFormProps {
  userId: string;
  email: string;
  secret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const OTPValidationForm: React.FC<OTPValidationFormProps> = ({
  userId,
  email,
  secret,
  onSuccess,
  onCancel
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= 5) {
      setError('Muitas tentativas. Por favor, tente novamente mais tarde.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create TOTP object
      const totp = new OTPAuth.TOTP({
        issuer: "FastPay",
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret
      });

      // Validate code
      const isValid = totp.validate({ token: code, window: 1 }) !== null;

      if (!isValid) {
        setAttempts(prev => prev + 1);
        throw new Error('Código inválido');
      }

      // Log successful validation
      await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: 'otp_validation_success',
        p_severity: 'info',
        p_details: {
          timestamp: new Date().toISOString()
        }
      });

      onSuccess();
    } catch (err) {
      console.error('OTP validation error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao validar código');

      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: 'otp_validation_failed',
        p_severity: 'warning',
        p_details: {
          attempts: attempts + 1,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Verificação em Duas Etapas
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código de Verificação
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Digite o código"
              required
              pattern="\d{6}"
              maxLength={6}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {attempts > 0 && (
          <div className="text-sm text-yellow-600">
            Tentativas restantes: {5 - attempts}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || code.length !== 6 || attempts >= 5}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPValidationForm;