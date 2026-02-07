import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import SendCryptoForm from '../components/crypto/SendCryptoForm';
import ReceiveCryptoForm from '../components/crypto/ReceiveCryptoForm';
import { useInterestUpdater } from '../hooks/useInterestUpdater';
import { useCryptoPrice } from '../hooks/useCryptoPrice';
import CryptoPriceDisplay from '../components/crypto/CryptoPriceDisplay';
import CryptoTutorial from '../components/help/CryptoTutorial';
import ProtectedFeature from '../components/ProtectedFeature';
import FastCoinHelp from '../components/help/FastCoinHelp';

const FastWallet: React.FC = () => {
  const { user } = useAuthStore();
  const [showSendForm, setShowSendForm] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('FST2');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    lastMonthEarnings: 0,
    nextEarnings: 0
  });

  const { prices, loading: pricesLoading } = useCryptoPrice(['BTC', 'ETH', 'SOL']);

  useInterestUpdater();

  const cryptos = [
    {
      symbol: 'FST2',
      name: 'FastCoin',
      balance: user?.wallet?.fastcoin?.toString() || '0.00',
      price: 1.00,
      address: user?.wallet?.id || '',
      network: 'FastPay Network',
      change24h: 0
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '0.00000000',
      price: prices.BTC?.usd || 0,
      address: 'bc1qqq03kw4ps7e0gpr9s3txjxjk3vlln92j7z0n9z',
      network: 'Bitcoin',
      change24h: prices.BTC?.usd_24h_change || 0
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '0.00000000',
      price: prices.ETH?.usd || 0,
      address: '0x1Bed25574e624ddf2F340d55560BD208F089c8D4',
      network: 'Ethereum',
      change24h: prices.ETH?.usd_24h_change || 0
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: '0.00000000',
      price: prices.SOL?.usd || 0,
      address: 'GYfMyiCwnBGLSvGVHtMcXxv5bjxTm5Ukrk1XwxSTx5Xw',
      network: 'Solana',
      change24h: prices.SOL?.usd_24h_change || 0
    }
  ];

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        if (!user?.wallet?.id) return;

        const { data, error } = await supabase
          .rpc('get_wallet_earnings', {
            wallet_id: user.wallet.id
          });

        if (error) throw error;

        setEarnings({
          totalEarnings: data.total_earnings || 0,
          lastMonthEarnings: data.last_month_earnings || 0,
          nextEarnings: data.next_earnings || 0
        });
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError('Erro ao carregar ganhos');
      }
    };

    fetchEarnings();
    const interval = setInterval(fetchEarnings, 60000);

    return () => clearInterval(interval);
  }, [user?.wallet?.id]);

  const handleSend = (crypto: string) => {
    setSelectedCrypto(crypto);
    setShowSendForm(true);
  };

  const handleReceive = (crypto: string) => {
    setSelectedCrypto(crypto);
    setShowReceiveForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowSendForm(false);
    setSuccess('Transação enviada com sucesso!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setSuccess('Endereço copiado para a área de transferência!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const totalBalance = cryptos.reduce((acc, crypto) => {
    return acc + (parseFloat(crypto.balance) * crypto.price);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carteira FastPay</h1>
          <p className="text-gray-600">Gerencie suas criptomoedas</p>
        </div>
        <button
          onClick={() => setShowTutorial(true)}
          className="inline-flex items-center px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md shadow-sm text-sm font-medium hover:bg-emerald-50"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Como Comprar
        </button>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold">FastCoin (FST2)</h2>
              <p className="text-emerald-100">Moeda oficial FastPay</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{user?.wallet?.fastcoin || 0} FST2</p>
            <p className="text-emerald-100">${(user?.wallet?.fastcoin || 0).toFixed(2)} USD</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-emerald-100 text-sm">Rendimento Total</p>
              <p className="text-lg font-bold">{earnings.totalEarnings.toFixed(2)} FST2</p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Último Mês</p>
              <p className="text-lg font-bold">{earnings.lastMonthEarnings.toFixed(2)} FST2</p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Próximo Mês (Est.)</p>
              <p className="text-lg font-bold">{earnings.nextEarnings.toFixed(2)} FST2</p>
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-2">
            Rendimento de 9% ao mês sobre o saldo em FastCoin
          </p>
        </div>

        <ProtectedFeature feature="trading">
          <div className="flex space-x-4">
            <button
              onClick={() => handleSend('FST2')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Enviar
            </button>
            <button
              onClick={() => handleReceive('FST2')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <ArrowDownRight className="w-4 h-4 mr-2" />
              Receber
            </button>
          </div>
        </ProtectedFeature>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Saldo Total: ${totalBalance.toFixed(2)}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moeda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação 24h
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cryptos.map((crypto) => (
                <tr key={crypto.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {crypto.balance} {crypto.symbol}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${(parseFloat(crypto.balance) * crypto.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${crypto.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {crypto.change24h > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : crypto.change24h < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      ) : null}
                      <span className={`text-sm font-medium ${
                        crypto.change24h > 0 ? 'text-green-600' :
                        crypto.change24h < 0 ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ProtectedFeature feature="trading">
                      <button
                        onClick={() => handleSend(crypto.symbol)}
                        className="text-emerald-600 hover:text-emerald-900 mr-4"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReceive(crypto.symbol)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        <ArrowDownRight className="w-4 h-4" />
                      </button>
                    </ProtectedFeature>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSendForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <SendCryptoForm
              selectedCrypto={selectedCrypto}
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowSendForm(false)}
            />
          </div>
        </div>
      )}

      {showReceiveForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <ReceiveCryptoForm
              selectedCrypto={selectedCrypto}
              address={cryptos.find(c => c.symbol === selectedCrypto)?.address || ''}
              onCopy={handleCopyAddress}
              onClose={() => setShowReceiveForm(false)}
            />
          </div>
        </div>
      )}

      {showTutorial && (
        <FastCoinHelp onClose={() => setShowTutorial(false)} />
      )}

      {success && (
        <div className="fixed bottom-4 right-4 bg-green-50 text-green-800 px-4 py-2 rounded-lg shadow-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-800 px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default FastWallet;