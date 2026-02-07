import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Users, Wallet, BarChart2, Bell, Settings, LogOut, Gift, Share2, Copy, CheckCircle, HelpCircle, Plus,
  Bitcoin, Coins, QrCode, RefreshCw, X, Receipt, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    fastcoin_balance: '0.00',
  });
  const [stakingData, setStakingData] = useState({
    total_staking: 0,
    total_earnings: 0,
    estimated_monthly: 0
  });
  const [userPlan, setUserPlan] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
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
    if (user) {
      fetchWalletData();
      fetchUserPlan();
      fetchReferralCode();
      fetchStakingData();
    }
  }, [user]);

  useEffect(() => {
    if (showBuyModal) {
      fetchCryptoPrices();
    }
  }, [showBuyModal]);

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

  const fetchWalletData = async () => {
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (wallet) setWalletData(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchStakingData = async () => {
    try {
      const { data: positions, error } = await supabase
        .from('staking_positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE');

      if (error) throw error;

      let totalStaking = 0;
      let totalEarnings = 0;
      let estimatedMonthly = 0;

      positions?.forEach(position => {
        totalStaking += position.amount;
        
        const weeklyRate = position.period === 30 ? 0.023 : position.period === 60 ? 0.026 : 0.03;
        const weeks = position.period / 7;
        const earnings = position.amount * (1 + weeklyRate) ** weeks - position.amount;
        
        totalEarnings += earnings;
        estimatedMonthly += position.amount * (1 + weeklyRate) ** 4 - position.amount;
      });

      setStakingData({
        total_staking: totalStaking,
        total_earnings: totalEarnings,
        estimated_monthly: estimatedMonthly
      });
    } catch (error) {
      console.error('Error fetching staking data:', error);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const { data: plan, error } = await supabase
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
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserPlan(plan);
    } catch (error) {
      console.error('Error fetching user plan:', error);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setReferralCode(data.referral_code);
    } catch (error) {
      console.error('Error fetching referral code:', error);
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

  const calculateFastCoinAmount = () => {
    if (!purchaseData.amount || !cryptoPrices[purchaseData.cryptoType]) return 0;
    const cryptoValue = parseFloat(purchaseData.amount) * cryptoPrices[purchaseData.cryptoType];
    return cryptoValue.toFixed(2);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddresses[purchaseData.cryptoType]);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handlePurchase = async () => {
    try {
      const { data, error } = await supabase
        .from('fastcoin_purchases')
        .insert([{
          user_id: user.id,
          crypto_type: purchaseData.cryptoType,
          amount: parseFloat(purchaseData.amount)
        }])
        .select()
        .single();

      if (error) throw error;

      setPurchaseDetails({
        id: data.id,
        cryptoType: purchaseData.cryptoType,
        amount: purchaseData.amount,
        fastcoinAmount: calculateFastCoinAmount(),
        date: new Date(),
        walletAddress: walletAddresses[purchaseData.cryptoType]
      });

      setShowBuyModal(false);
      setShowConfirmationTicket(true);
    } catch (error) {
      console.error('Error registering purchase:', error);
      alert('Erro ao registrar compra. Tente novamente.');
    }
  };

  const handleConfirmationClose = () => {
    window.open(
      `https://wa.me/32472669126?text=Olá FastPay tudo bem? Acabo de adquirir ${purchaseDetails.fastcoinAmount} Fastcoins, aqui está meu email: ${user.email} e a prova de pagamento`,
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

  const totalBalance = parseFloat(walletData.fastcoin_balance) + stakingData.total_staking;
  const totalValue = totalBalance * 1;

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-navy-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Carteira FastPay</h2>
              <p className="text-gray-400">Gerencie suas FastCoins</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 md:gap-4">
              <button 
                onClick={() => setShowBuyModal(true)}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Comprar FastCoin</span>
              </button>
              <button 
                onClick={() => navigate('/packages')}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Gift size={20} />
                <span>Pacotes</span>
              </button>
              <button 
                onClick={() => navigate('/affiliates')}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                <span>Afiliados</span>
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="w-full md:w-auto bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Settings size={20} />
                <span>Configurações</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>

          <div className="bg-navy-700 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Seu Código de Afiliado</div>
                <div className="text-xl font-bold">{referralCode}</div>
              </div>
              <button
                onClick={copyReferralCode}
                className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="bg-emerald-500 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet size={24} />
              <div>
                <div className="text-sm opacity-90">Saldo Total</div>
                <div className="font-medium">Combinado FastPay</div>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">{totalBalance.toFixed(2)} FASTC</div>
              <div>${totalValue.toFixed(2)} USD</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <div className="text-sm opacity-80">Disponível</div>
                <div className="font-semibold">{walletData.fastcoin_balance} FASTC</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Em Staking</div>
                <div className="font-semibold">{stakingData.total_staking.toFixed(2)} FASTC</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Ganhos Totais</div>
                <div className="font-semibold">{stakingData.total_earnings.toFixed(2)} FASTC</div>
              </div>
            </div>
          </div>

          {userPlan ? (
            <div className="bg-navy-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Seu Plano Atual</div>
                  <div className="text-lg font-bold">{userPlan.plans?.name}</div>
                </div>
                <div className="text-emerald-500">
                  {userPlan.plans?.plan_type === 'VITALICIO' ? 'Vitalício' : 'Mensal'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-navy-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Plano Atual</div>
                  <div className="text-lg font-bold">Gratuito</div>
                </div>
                <button
                  onClick={() => navigate('/packages')}
                  className="text-emerald-500 hover:text-emerald-400"
                >
                  Fazer Upgrade
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-navy-700 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Rendimento Total</div>
              <div className="text-xl font-bold">{stakingData.total_earnings.toFixed(2)} FASTC</div>
            </div>
            <div className="bg-navy-700 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Ganhos Este Mês</div>
              <div className="text-xl font-bold">{(stakingData.total_earnings * 0.25).toFixed(2)} FASTC</div>
            </div>
            <div className="bg-navy-700 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Próximo Mês (Est.)</div>
              <div className="text-xl font-bold">{stakingData.estimated_monthly.toFixed(2)} FASTC</div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            {userPlan ? (
              `Ganhos de até ${userPlan.plans?.features?.monthly_earnings || 0}% ao mês sobre o saldo em Renda Fixa FastCoin`
            ) : (
              'Faça upgrade para um plano pago e comece a ganhar rendimentos mensais'
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button 
              onClick={() => navigate('/earn')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Renda Fixa
            </button>
            <button 
              onClick={() => navigate('/withdraw')}
              className="bg-navy-700 hover:bg-navy-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Sacar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-navy-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <BarChart2 className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Rendimento Total</h3>
            </div>
            <div className="text-2xl font-bold">{stakingData.total_earnings.toFixed(2)} FASTC</div>
            <div className="text-gray-400 text-sm">
              {userPlan ? (
                `Rendimento de ${userPlan.plans?.features?.monthly_earnings || 0}% ao mês`
              ) : (
                'Faça upgrade para começar a ganhar'
              )}
            </div>
          </div>

          <div className="bg-navy-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="text-blue-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Rede de Afiliados</h3>
            </div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-gray-400 text-sm">Afiliados diretos</div>
          </div>

          <div className="bg-navy-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Bell className="text-purple-500" size={24} />
              </div>
              <h3 className="text-lg font-semibold">Ganhos Totais</h3>
            </div>
            <div className="text-2xl font-bold">${(stakingData.total_earnings * 1).toFixed(2)}</div>
            <div className="text-gray-400 text-sm">+${(stakingData.estimated_monthly * 1).toFixed(2)} estimado próximo mês</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/tutorial')}
          className="fixed bottom-24 right-6 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
        >
          <HelpCircle size={20} />
          Como Comprar
        </button>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Coins className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Comprar FastCoin</h2>
                  <p className="text-gray-400">Escolha o método de pagamento</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchCryptoPrices}
                  disabled={loadingPrices}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                  title="Atualizar cotações"
                >
                  <RefreshCw size={20} className={loadingPrices ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => {
                    setShowBuyModal(false);
                    setPurchaseData({ cryptoType: 'SOL', amount: '' });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {lastUpdate && (
              <div className="text-sm text-gray-400 mb-4 text-center">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </div>
            )}

            <div className="space-y-6">
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
                  Quantidade
                </label>
                <input
                  type="number"
                  value={purchaseData.amount}
                  onChange={(e) => setPurchaseData({ ...purchaseData, amount: e.target.value })}
                  className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                  min="1"
                  step="1"
                />
              </div>

              <div className="bg-navy-700 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="text-sm text-gray-400 mb-2">Endereço para Depósito</div>
                  <div className="flex items-center gap-2">
                    <code className="bg-navy-600 p-2 rounded flex-1 break-all">
                      {walletAddresses[purchaseData.cryptoType]}
                    </code>
                    <button
                      onClick={copyWalletAddress}
                      className="bg-navy-600 hover:bg-navy-500 p-2 rounded-lg transition-colors"
                    >
                      {addressCopied ? (
                        <CheckCircle className="text-emerald-500" size={20} />
                      ) : (
                        <Copy className="text-gray-400" size={20} />
                      )}
                    </button>
                  </div>
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

              <div className="bg-navy-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Valor a Pagar</div>
                <div className="text-2xl font-bold text-emerald-500">
                  {purchaseData.amount} {purchaseData.cryptoType}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Equivalente a ${calculateFastCoinAmount()} USD
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowBuyModal(false);
                    setPurchaseData({ cryptoType: 'SOL', amount: '' });
                  }}
                  className="px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!purchaseData.amount || parseFloat(purchaseData.amount) <= 0}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Bitcoin size={20} />
                  Confirmar Compra
                </button>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Após a compra, você será redirecionado para o WhatsApp para enviar o comprovante.
              </p>
            </div>
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
                  <span className="text-gray-400">Valor</span>
                  <span className="font-medium">{purchaseDetails.amount} {purchaseDetails.cryptoType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FastCoins</span>
                  <span className="font-medium">{purchaseDetails.fastcoinAmount} FASTC</span>
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
  );
}

export default Dashboard;