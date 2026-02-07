import React, { useEffect, useState } from 'react';
import { Wallet, Coins, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useInterestUpdater } from '../../hooks/useInterestUpdater';

const WalletOverview: React.FC = () => {
  const { user } = useAuthStore();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Use the interest updater hook
  useInterestUpdater();

  useEffect(() => {
    // Update the last update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Token':
        return 'bg-blue-100 text-blue-600';
      case 'Miner':
        return 'bg-purple-100 text-purple-600';
      case 'Master':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Saldo USD</h3>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(user?.wallet?.balance || 0)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Saldo disponível para transferências
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">FastCoin (FST2)</h3>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {user?.wallet?.fastcoin?.toFixed(6)} FST2
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">
            Rendimento: 9% ao mês (0.3% ao dia)
          </p>
          <p className="text-xs text-emerald-600">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Nível</h3>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getLevelColor(user?.level || '')}`}>
            <User className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{user?.level}</p>
          <p className="text-sm text-gray-500 mt-2">
            Seu nível atual no programa
          </p>
          {user?.referralCode && (
            <div className="mt-4 p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500">Código de Indicação</p>
              <p className="text-sm font-medium text-gray-900">{user.referralCode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;