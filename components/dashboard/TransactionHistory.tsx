import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Transaction } from '../../types';
import useAuthStore from '../../store/authStore';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const { user } = useAuthStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'FST2') {
      return `${value.toFixed(2)} FST2`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return transaction.from_wallet_id === user?.wallet.id ? (
      <ArrowUpRight className="w-5 h-5 text-red-600" />
    ) : (
      <ArrowDownRight className="w-5 h-5 text-emerald-600" />
    );
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.status === 'pending') return 'text-yellow-600';
    return transaction.from_wallet_id === user?.wallet.id ? 'text-red-600' : 'text-emerald-600';
  };

  const getTransactionStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: 'Concluída',
      pending: 'Pendente',
      failed: 'Falhou',
      cancelled: 'Cancelada'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Histórico de Transações</h3>
      </div>
      {transactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Nenhuma transação encontrada
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${
                    transaction.status === 'pending' ? 'bg-yellow-100' :
                    transaction.from_wallet_id === user?.wallet.id ? 'bg-red-100' : 'bg-emerald-100'
                  } rounded-full flex items-center justify-center mr-4`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.from_wallet_id === user?.wallet.id ? 'Enviado' : 'Recebido'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getTransactionColor(transaction)}`}>
                    {transaction.from_wallet_id === user?.wallet.id ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getTransactionStatus(transaction.status)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;