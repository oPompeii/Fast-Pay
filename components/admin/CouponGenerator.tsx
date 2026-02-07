import React, { useState } from 'react';
import { Ticket, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CouponGenerator: React.FC = () => {
  const [discount, setDiscount] = useState('');
  const [expirationDays, setExpirationDays] = useState('30');
  const [maxUses, setMaxUses] = useState('1');
  const [generatedCoupon, setGeneratedCoupon] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoupon = async () => {
    try {
      setLoading(true);
      setError(null);

      const couponCode = `FAST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(expirationDays));

      const { error: insertError } = await supabase
        .from('coupons')
        .insert([{
          code: couponCode,
          discount: parseFloat(discount),
          expires_at: expirationDate.toISOString(),
          max_uses: parseInt(maxUses),
          remaining_uses: parseInt(maxUses)
        }]);

      if (insertError) throw insertError;

      setGeneratedCoupon(couponCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedCoupon) {
      navigator.clipboard.writeText(generatedCoupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Ticket className="w-6 h-6 text-emerald-600 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">
          Gerador de Cupons
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desconto (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dias para Expirar
          </label>
          <input
            type="number"
            min="1"
            value={expirationDays}
            onChange={(e) => setExpirationDays(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número Máximo de Usos
          </label>
          <input
            type="number"
            min="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={generateCoupon}
          disabled={loading || !discount}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar Cupom'}
        </button>

        {generatedCoupon && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cupom Gerado</p>
                <p className="text-lg font-mono font-medium text-gray-900">
                  {generatedCoupon}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponGenerator;