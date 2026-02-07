import React, { useState } from 'react';
import { Coins, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';

interface EarningsManagerProps {
  userId: string;
  onUpdate: () => void;
}

const EarningsManager: React.FC<EarningsManagerProps> = ({ userId, onUpdate }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'staking' | 'referral' | 'bonus' | 'manual'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Valor inválido');
      }

      // Add manual earning
      const { error: earningError } = await supabase.rpc('add_manual_earning', {
        p_user_id: userId,
        p_amount: numAmount,
        p_earning_type: type
      });

      if (earningError) throw earningError;

      setAmount('');
      setShowConfirm(false);
      onUpdate();
    } catch (err) {
      console.error('Error adding earning:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ganho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Ganho</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="staking">Staking</option>
            <option value="referral">Referral</option>
            <option value="bonus">Bônus</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor (FST2)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Coins className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="block w-full pl-10 pr-12 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">FST2</span>
            </div>
          </div>
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

        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || !amount}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Adicionar Ganho'}
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Confirmar Ganho"
        message={`Tem certeza que deseja adicionar ${amount} FST2 como ganho do tipo ${type}?`}
        confirmLabel="Adicionar"
        type="info"
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default EarningsManager;