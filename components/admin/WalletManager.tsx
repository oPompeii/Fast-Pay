import React, { useState } from 'react';
import { DollarSign, Plus, Minus, Coins, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';

interface WalletManagerProps {
  userId: string;
  currentBalance: number;
  currentFastcoin: number;
  onUpdate: () => void;
}

const WalletManager: React.FC<WalletManagerProps> = ({
  userId,
  currentBalance,
  currentFastcoin,
  onUpdate
}) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'FST2'>('FST2');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
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

      // Call RPC function to adjust balance
      const { error: rpcError } = await supabase.rpc('adjust_wallet_balance', {
        p_user_id: userId,
        p_currency: currency,
        p_amount: numAmount,
        p_operation: operation
      });

      if (rpcError) throw rpcError;

      setAmount('');
      setShowConfirm(false);
      onUpdate();
    } catch (err) {
      console.error('Error adjusting balance:', err);
      setError(err instanceof Error ? err.message : 'Erro ao ajustar saldo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Gerenciar Saldo</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Saldo USD</span>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${currentBalance.toFixed(2)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Saldo FST2</span>
            <Coins className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentFastcoin.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Moeda
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'FST2')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="FST2">FastCoin (FST2)</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Operação
          </label>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOperation('add')}
              className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                operation === 'add'
                  ? 'bg-emerald-600 text-white border-transparent'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => setOperation('subtract')}
              className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                operation === 'subtract'
                  ? 'bg-red-600 text-white border-transparent'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Minus className="w-4 h-4 mr-2" />
              Subtrair
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
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
          {loading ? 'Processando...' : 'Ajustar Saldo'}
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Confirmar Ajuste"
        message={`Tem certeza que deseja ${operation === 'add' ? 'adicionar' : 'subtrair'} ${amount} ${currency}?`}
        confirmLabel={operation === 'add' ? 'Adicionar' : 'Subtrair'}
        type={operation === 'add' ? 'info' : 'warning'}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default WalletManager;