import React, { useState, useCallback, useRef } from 'react';
import { Ticket, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CouponInputProps {
  onValidCoupon: (discount: number) => void;
  disabled?: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  max_uses: number;
  remaining_uses: number;
  expires_at: string | null;
}

const CouponInput: React.FC<CouponInputProps> = ({ onValidCoupon, disabled = false }) => {
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const validateCoupon = useCallback(async (code: string) => {
    if (!code) {
      setError(null);
      setSuccess(false);
      onValidCoupon(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { data, error } = await supabase
        .from('coupons')
        .select<'coupons', Coupon>('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Cupom inválido');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Cupom inválido');
      }

      // Check if coupon is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Cupom expirado');
      }

      // Check if coupon has remaining uses
      if (data.remaining_uses <= 0) {
        throw new Error('Cupom esgotado');
      }

      setSuccess(true);
      onValidCoupon(data.discount);
    } catch (err) {
      console.error('Error validating coupon:', err);
      setError(err instanceof Error ? err.message : 'Erro ao validar cupom');
      onValidCoupon(0);
    } finally {
      setLoading(false);
    }
  }, [onValidCoupon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCoupon(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for validation
    timeoutRef.current = setTimeout(() => {
      validateCoupon(value);
    }, 500);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div>
      <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
        Cupom de Desconto
      </label>
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Ticket className={`h-5 w-5 ${error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          id="coupon"
          value={coupon}
          onChange={handleChange}
          disabled={disabled}
          className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${
            error ? 'border-red-300' : success ? 'border-green-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Digite seu cupom"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
        {!loading && success && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
        )}
        {!loading && error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-1 text-sm text-green-600">
          Cupom aplicado com sucesso!
        </p>
      )}
    </div>
  );
};

export default CouponInput;