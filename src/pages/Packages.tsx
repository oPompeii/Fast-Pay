import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Shield, Coins, Users, ArrowRight, 
  Bitcoin, QrCode, Copy, CheckCircle, X, Receipt,
  RefreshCw, AlertTriangle, Wallet
} from 'lucide-react';

export default function Packages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planType, setPlanType] = useState<'MENSAL' | 'VITALICIO'>('MENSAL');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
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
  const [showDowngradeAlert, setShowDowngradeAlert] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CRYPTO' | 'WALLET'>('CRYPTO');

  const walletAddresses = {
    SOL: 'GYfMyiCwnBGLSvGVHtMcXxv5bjxTm5Ukrk1XwxSTx5Xw',
    ETH: '0x1Bed25574e624ddf2F340d55560BD208F089c8D4',
    USDT: '0x1Bed25574e624ddf2F340d55560BD208F089c8D4',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [planType]);

  useEffect(() => {
    if (showPaymentModal) {
      fetchCryptoPrices();
    }
  }, [showPaymentModal]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      await fetchUserPlan(user.id);
      await fetchWalletBalance(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async (userId: string) => {
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('fastcoin_balance')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setWalletBalance(wallet?.fastcoin_balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('plan_type', planType)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUserPlan = async (userId: string) => {
    try {
      const { data: userPlan, error } = await supabase
        .from('user_plans')
        .select(`
          *,
          plans (
            id,
            name,
            plan_type,
            price,
            features
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setCurrentPlan(userPlan);
    } catch (error) {
      console.error('Error fetching user plan:', error);
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
    if (!selectedPlan || !cryptoPrices[purchaseData.cryptoType]) return 0;
    return (selectedPlan.price / cryptoPrices[purchaseData.cryptoType]).toFixed(8);
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddresses[purchaseData.cryptoType]);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleSubscribe = async (planId: string) => {
    try {
      if (!user) return;

      const selectedPlan = plans.find(p => p.id === planId);
      const isDowngrade = currentPlan?.plans?.price > selectedPlan?.price;

      if (isDowngrade) {
        if (!confirm('Tem certeza que deseja fazer o downgrade? Seus benefícios serão ajustados de acordo com o novo plano selecionado.')) {
          return;
        }
      }

      setSelectedPlan(selectedPlan);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      alert('Erro ao atualizar plano. Tente novamente.');
    }
  };

  const handlePurchase = async () => {
    try {
      if (paymentMethod === 'WALLET') {
        if (selectedPlan.price > walletBalance) {
          throw new Error('Saldo insuficiente na carteira');
        }

        // Update wallet balance
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ 
            fastcoin_balance: walletBalance - selectedPlan.price 
          })
          .eq('user_id', user.id);

        if (walletError) throw walletError;

        // Update user plan
        const { error: planError } = await supabase
          .from('user_plans')
          .upsert({
            user_id: user.id,
            plan_id: selectedPlan.id,
            status: 'ACTIVE',
            start_date: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (planError) throw planError;

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([{
            user_id: user.id,
            type: 'TRANSFER',
            amount: selectedPlan.price,
            status: 'COMPLETED',
            details: {
              type: 'PLAN_PURCHASE',
              plan_id: selectedPlan.id,
              plan_name: selectedPlan.name,
              payment_method: 'WALLET'
            }
          }]);

        if (transactionError) throw transactionError;

        alert('Plano atualizado com sucesso!');
        setShowPaymentModal(false);
        window.location.reload();
        return;
      }

      // Crypto payment flow
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
        planName: selectedPlan.name,
        planType: selectedPlan.plan_type,
        price: selectedPlan.price,
        date: new Date(),
        walletAddress: walletAddresses[purchaseData.cryptoType]
      });

      setShowPaymentModal(false);
      setShowConfirmationTicket(true);
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert(error.message || 'Erro ao processar compra. Tente novamente.');
    }
  };

  const handleConfirmationClose = () => {
    window.open(
      `https://wa.me/32472669126?text=Olá FastPay tudo bem? Acabo de adquirir o pacote "${purchaseDetails.planName} ${purchaseDetails.planType.toLowerCase()}", aqui está meu email: ${user.email} e a prova de pagamento`,
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

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano FastPay</h1>
          <p className="text-gray-400">
            Comece sua jornada com o plano que melhor se adapta às suas necessidades
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-navy-800 rounded-lg p-2 inline-flex">
            <button
              onClick={() => setPlanType('MENSAL')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                planType === 'MENSAL'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPlanType('VITALICIO')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                planType === 'VITALICIO'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Vitalício
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-navy-800 rounded-lg p-6 ${
                plan.name === 'Master' ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              {plan.name === 'Master' && (
                <div className="bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                  Mais Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                ${plan.price}
                <span className="text-sm font-normal text-gray-400">
                  {plan.plan_type === 'MENSAL' ? ' /mês' : ' único'}
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.benefits.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Shield className="text-emerald-500" size={16} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-2 rounded-lg font-medium ${
                  currentPlan?.plans?.id === plan.id
                    ? 'bg-navy-700 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
                disabled={currentPlan?.plans?.id === plan.id}
              >
                {currentPlan?.plans?.id === plan.id ? (
                  'Plano Atual'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Escolher Plano
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <Coins className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Comprar Pacote</h2>
                    <p className="text-gray-400">{selectedPlan.name} {selectedPlan.plan_type.toLowerCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPurchaseData({ cryptoType: 'SOL', amount: '' });
                    setPaymentMethod('CRYPTO');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Método de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('CRYPTO')}
                    className={`p-4 rounded-lg flex items-center justify-center gap-2 ${
                      paymentMethod === 'CRYPTO'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                    }`}
                  >
                    <Bitcoin size={20} />
                    Crypto
                  </button>
                  <button
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-4 rounded-lg flex items-center justify-center gap-2 ${
                      paymentMethod === 'WALLET'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                    }`}
                  >
                    <Wallet size={20} />
                    Carteira
                  </button>
                </div>
              </div>

              {paymentMethod === 'WALLET' ? (
                <div className="space-y-6">
                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Saldo Disponível</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {walletBalance.toFixed(2)} FASTC
                    </div>
                  </div>

                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Valor do Plano</div>
                    <div className="text-2xl font-bold text-white">
                      {selectedPlan.price.toFixed(2)} FASTC
                    </div>
                  </div>

                  {walletBalance < selectedPlan.price && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                      Saldo insuficiente para comprar este plano
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentMethod('CRYPTO');
                      }}
                      className="px-4 py-2 rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePurchase}
                      disabled={walletBalance < selectedPlan.price}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Wallet size={20} />
                      Pagar com Saldo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {lastUpdate && (
                    <div className="text-sm text-gray-400 mb-4 text-center">
                      Última atualização: {lastUpdate.toLocaleTimeString()}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Escolha a Criptomoeda
                    </label>
                    <select
                      value={purchaseData.cryptoType}
                      onChange={(e) => setPurchaseData({ ...purchaseData, cryptoType: e.target.value })}
                      className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                          {walletAddresses[purchaseData.cryptoType]}
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
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddresses[purchaseData.cryptoType]}`}
                            alt="QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Valor a Pagar</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {calculateCryptoAmount()} {purchaseData.cryptoType}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Equivalente a ${selectedPlan.price.toFixed(2)} USD
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPurchaseData({ cryptoType: 'SOL', amount: '' });
                        setPaymentMethod('CRYPTO');
                      }}
                      className="px-4 py-2 rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePurchase}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Bitcoin size={20} />
                      Finalizar Compra
                    </button>
                  </div>

                  <p className="text-sm text-gray-400 text-center">
                    Após a compra, você será redirecionado para o WhatsApp para enviar o comprovante.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
                    <span className="text-gray-400">Pacote</span>
                    <span className="font-medium">{purchaseDetails.planName} {purchaseDetails.planType.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor</span>
                    <span className="font-medium">${purchaseDetails.price}</span>
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