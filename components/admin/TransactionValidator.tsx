import React, { useState } from 'react';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Transaction {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_hash?: string;
  created_at: string;
}

interface TransactionValidatorProps {
  transaction: Transaction;
  onValidate: () => void;
}

const TransactionValidator: React.FC<TransactionValidatorProps> = ({
  transaction,
  onValidate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidation = async (approved: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: approved ? 'completed' : 'rejected',
          validated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      if (approved) {
        // Update wallet balances
        const { error: walletError } = await supabase.rpc('process_transaction', {
          transaction_id: transaction.id
        });

        if (walletError) throw walletError;
      }

      onValidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Validar Transação
            </h3>
            <p className="text-sm text-gray-500">
              ID: {transaction.id}
            </p>
          </div>
          {transaction.transaction_hash && (
            <a
              href={`https://explorer.solana.com/tx/${transaction.transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="text-sm">Ver na Blockchain</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Valor</p>
            <p className="mt-1 text-sm text-gray-900">
              {transaction.amount} {transaction.currency}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Data</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(transaction.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => handleValidation(true)}
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar
          </button>
          <button
            onClick={() => handleValidation(false)}
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionValidator;