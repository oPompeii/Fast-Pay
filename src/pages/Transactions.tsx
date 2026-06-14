import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export default function Transactions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="text-emerald-500" />;
      case 'WITHDRAW':
        return <ArrowUpRight className="text-red-500" />;
      case 'TRANSFER':
        return <ArrowUpRight className="text-blue-500" />;
      default:
        return <Clock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-500';
      case 'PENDING':
        return 'text-yellow-500';
      case 'FAILED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-emerald-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </button>

        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Histórico de Transações</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhuma transação encontrada</p>
              <p>Suas transações aparecerão aqui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-navy-700">
                    <th className="pb-4">Tipo</th>
                    <th className="pb-4">Valor</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-navy-700">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span>{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {tx.amount.toFixed(2)} FASTC
                      </td>
                      <td className="py-4">
                        <span className={getStatusColor(tx.status)}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}