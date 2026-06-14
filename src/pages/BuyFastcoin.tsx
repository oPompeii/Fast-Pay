import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Coins, Bitcoin, QrCode, Copy, CheckCircle, X, Receipt, 
  RefreshCw, DollarSign
} from 'lucide-react';

const WALLET_ADDRESSES = {
  SOL: 'GYfMyiCwnBGLSvGVHtMcXxv5bjxTm5Ukrk1XwxSTx5Xw',
  ETH: '0x1Bed25574e624ddf2F340d55560BD208F089c8D4',
  USDT: '0x1Bed25574e624ddf2F340d55560BD208F089c8D4',
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
};

export default function BuyFastcoin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState({
    cryptoType: 'SOL',
    amount: ''
  });
  const [addressCopied, setAddressCopied] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState({
    SOL: 0,
    ETH: 0,
    USDT: 1,
    BTC: 0
  });
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showConfirmationTicket, setShowConfirmationTicket] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);

  useEffect(() => {
    checkUser();
    fetchCryptoPrices();
  }, []);

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

  const fetchCryptoPrices = async () => {
    setLoadingPrices(true);
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,bitcoin&vs_currencies=usd'
      );
      const data = await response.json();
      
      setCryptoPrices({
        SOL: data.solana.usd,
        ETH: data.ethereum.usd,
        USDT: 1,
        BTC: data.bitcoin.usd
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  const calculateCryptoAmount = () => {
    if (!purchaseData.amount || !cryptoPrices[purchaseData.cryptoType]) return 0;
    return (parseFloat(purchaseData.amount) / cryptoPrices[purchaseData.cryptoType]).toFixed(8);
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESSES[purchaseData.cryptoType]);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handlePurchase = async () => {
    try {
      const amount = parseFloat(purchaseData.amount);
      if (!amount || amount <= 0) {
        throw new Error('Por favor, insira um valor válido');
      }

      if (amount < 10) {
        throw new Error('O valor mínimo para compra é 10 FASTC');
      }

      // Create purchase record
      const { data, error } = await supabase
        .from('fastcoin_purchases')
        .insert([{
          user_id: user.id,
          crypto_type: purchaseData.cryptoType,
          amount: parseFloat(calculateCryptoAmount())
        }])
        .select()
        .single();

      if (error) throw error;

      setPurchaseDetails({
        id: data.id,
        cryptoType: purchaseData.cryptoType,
        amount: calculateCryptoAmount(),
        fastcoinAmount: purchaseData.amount,
        date: new Date(),
        walletAddress: WALLET_ADDRESSES[purchaseData.cryptoType]
      });

      setShowConfirmationTicket(true);
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert(error.message || 'Erro ao processar compra. Tente novamente.');
    }
  };

  const handleConfirmationClose = () => {
    window.open(
      `https://wa.me/32472669126?text=Olá FastPay tudo bem? Acabo de adquirir ${purchaseDetails.amount} ${purchaseDetails.cryptoType} para comprar ${purchaseDetails.fastcoinAmount} FastCoins, aqui está meu email: ${user.email} e a prova de pagamento`,
      '_blank'
    );
    setShowConfirmationTicket(false);
    setPurchaseDetails(null);
    setPurchaseData({ cryptoType: 'SOL', amount: '' });
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

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Comprar FastCoin</h1>
          <p className="text-gray-400">
            Escolha o valor e a criptomoeda para sua compra
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-navy-800 rounded-lg p-6">
            <div className="space-y-6">
              {lastUpdate && (
                <div className="text-sm text-gray-400 text-center">
                  Última atualização: {lastUpdate.toLocaleTimeString()}
                  <button
                    onClick={fetchCryptoPrices}
                    className="ml-2 text-emerald-500 hover:text-emerald-400"
                  >
                    <RefreshCw size={16} className={loadingPrices ? 'animate-spin' : ''} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor em FastCoin
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    value={purchaseData.amount}
                    onChange={(e) => setPurchaseData({ ...purchaseData, amount: e.target.value })}
                    className="bg-navy-700 w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0.00"
                    min="10"
                    step="1"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Valor mínimo: 10 FASTC
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Escolha a Criptomoeda
                </label>
                <select
                  value={purchaseData.cryptoType}
                  onChange={(e) => setPurchaseData({ ...purchaseData, cryptoType: e.target.value })}
                  className="bg-navy-700 w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="SOL">Solana (SOL) - ${cryptoPrices.SOL.toFixed(2)}</option>
                  <option value="ETH">Ethereum (ETH) - ${cryptoPrices.ETH.toFixed(2)}</option>
                  <option value="USDT">USDT (Tether) - $1.00</option>
                  <option value="BTC">Bitcoin (BTC) - ${cryptoPrices.BTC.toFixed(2)}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço para Depósito
                </label>
                <div className="bg-navy-700 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <code className="text-emerald-500 flex-1 break-all">
                      {WALLET_ADDRESSES[purchaseData.cryptoType]}
                    </code>
                    <button
                      onClick={copyWalletAddress}
                      className="bg-navy-600 hover:bg-navy-500 p-2 rounded-lg transition-colors"
                      title="Copiar endereço"
                    >
                      {addressCopied ? (
                        <CheckCircle className="text-emerald-500" size={20} />
                      ) : (
                        <Copy className="text-gray-400" size={20} />
                      )}
                    </button>
                  </div>
                  <div className="border-t border-navy-600">
                    <div className="p-4 flex justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${WALLET_ADDRESSES[purchaseData.cryptoType]}`}
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {purchaseData.amount && (
                <div className="bg-navy-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Valor a Pagar</div>
                  <div className="text-2xl font-bold text-emerald-500">
                    {calculateCryptoAmount()} {purchaseData.cryptoType}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Equivalente a ${purchaseData.amount} USD
                  </div>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={!purchaseData.amount || parseFloat(purchaseData.amount) < 10}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Bitcoin size={20} />
                Finalizar Compra
              </button>

              <p className="text-sm text-gray-400 text-center">
                Após a compra, você será redirecionado para o WhatsApp para enviar o comprovante.
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Confirmation Modal */}
        {showConfirmationTicket && purchaseDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="text-emerald-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold">Compra Realizada!</h2>
                <p className="text-gray-400">Obrigado por sua compra</p>
              </div>

              <div className="bg-navy-700 rounded-lg p-4 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID da Compra</span>
                    <span className="font-medium">{purchaseDetails.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data</span>
                    <span className="font-medium">{purchaseDetails.date.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">FastCoins</span>
                    <span className="font-medium">{purchaseDetails.fastcoinAmount} FASTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pagamento</span>
                    <span className="font-medium">{purchaseDetails.amount} {purchaseDetails.cryptoType}</span>
                  </div>
                  <div className="pt-4 border-t border-navy-600">
                    <div className="text-sm text-gray-400 mb-2">Endereço de Depósito</div>
                    <code className="text-emerald-500 text-sm break-all">
                      {purchaseDetails.walletAddress}
                    </code>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">
                  Envie o comprovante de pagamento via WhatsApp para confirmar sua compra
                </p>
                <button
                  onClick={handleConfirmationClose}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-3 rounded-lg font-medium transition-colors"
                >
                  Enviar Comprovante via WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}