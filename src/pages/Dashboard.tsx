import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateAIResponse } from '../lib/openai';
import { 
  Users, Wallet, BarChart2, Bell, Settings, LogOut, Gift, Share2, Copy, CheckCircle, HelpCircle, Plus,
  Bitcoin, Coins, QrCode, RefreshCw, X, Receipt, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Shield, TrendingUp, Calendar, Tag,
  Brain, Clock, ChevronDown, ChevronUp, UserPlus
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
  const [showDowngradeAlert, setShowDowngradeAlert] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CRYPTO' | 'WALLET'>('CRYPTO');
  const [showExpirationAlert, setShowExpirationAlert] = useState(false);
  const [daysUntilExpiration, setDaysUntilExpiration] = useState(0);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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
      fetchStakingData();
      generateWalletAnalysis();
    }
  }, [user]);

  useEffect(() => {
    if (showBuyModal) {
      fetchCryptoPrices();
    }
  }, [showBuyModal]);

  useEffect(() => {
    if (userPlan && userPlan.plans?.plan_type === 'MENSAL') {
      const startDate = new Date(userPlan.start_date);
      const expirationDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const now = new Date();
      const daysLeft = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      setDaysUntilExpiration(daysLeft);
      setShowExpirationAlert(daysLeft <= 3 && daysLeft > 0);
    }
  }, [userPlan]);

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

      if (error) throw error;
      if (wallet) {
        setWalletData(wallet);
        setWalletBalance(parseFloat(wallet.fastcoin_balance));
      }
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

  const generateWalletAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      setAiError(null);
      
      const totalBalance = parseFloat(walletData.fastcoin_balance) + stakingData.total_staking;
      const availableBalance = parseFloat(walletData.fastcoin_balance);
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: stakingPositions } = await supabase
        .from('staking_positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE');

      const prompt = `Analise os seguintes dados da carteira FastPay:

Saldo Total: ${totalBalance.toFixed(2)} FASTC (${(totalBalance * 1).toFixed(2)} USD)
- Saldo Disponível em Carteira: ${availableBalance.toFixed(2)} FASTC
- Saldo em Staking: ${stakingData.total_staking.toFixed(2)} FASTC
- Rendimentos Totais: ${stakingData.total_earnings.toFixed(2)} FASTC
- Rendimento Estimado Mensal: ${stakingData.estimated_monthly.toFixed(2)} FASTC

Projeção de Rendimentos com Saldo Disponível:
- Se aplicar ${availableBalance.toFixed(2)} FASTC em staking por 30 dias: ${(availableBalance * 0.023 * 4).toFixed(2)} FASTC/mês (2.3% semanal)
- Se aplicar ${availableBalance.toFixed(2)} FASTC em staking por 60 dias: ${(availableBalance * 0.026 * 4).toFixed(2)} FASTC/mês (2.6% semanal)
- Se aplicar ${availableBalance.toFixed(2)} FASTC em staking por 90 dias: ${(availableBalance * 0.03 * 4).toFixed(2)} FASTC/mês (3.0% semanal)

Últimas Transações: ${transactions?.map(tx => 
  `${tx.type} de ${tx.amount} FASTC em ${new Date(tx.created_at).toLocaleDateString()}`
).join('\n')}

Posições em Staking: ${stakingPositions?.map(pos => 
  `${pos.amount} FASTC por ${pos.period} dias (rendimento semanal de ${
    pos.period === 30 ? '2.3%' : pos.period === 60 ? '2.6%' : '3%'
  })`
).join('\n')}

Forneça uma análise detalhada do portfólio com:
1. Performance geral e distribuição de ativos
2. Análise dos rendimentos atuais
3. Oportunidades de otimização com o saldo disponível
4. Dicas personalizadas para maximizar ganhos
5. Projeções de rendimento para os próximos 30/60/90 dias
6. Recomendações específicas para o saldo disponível em carteira`;

      const analysis = await generateAIResponse([{
        role: 'user',
        content: prompt
      }]);

      setAiAnalysis(analysis);
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      setAiError(error.message || 'Não foi possível gerar a análise no momento. Tente novamente mais tarde.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Carteira FastPay</h2>
            <p className="text-gray-400">Gerencie suas FastCoins</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 md:gap-4">
            <button 
              onClick={() => navigate('/buy-fastcoin')}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span>Comprar FastCoin</span>
            </button>
            <button 
              onClick={() => navigate('/invite')}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              <span>Convidar</span>
            </button>
            <button 
              onClick={() => navigate('/packages')}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Gift size={20} />
              <span>Pacotes</span>
            </button>
            <button 
              onClick={() => navigate('/ai-advisor')}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Brain size={20} />
              <span>IA Advisor</span>
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

        {userPlan?.plans?.plan_type === 'MENSAL' && (
          <div className="mb-6">
            <div className="bg-navy-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-emerald-500" size={24} />
                <div>
                  <div className="text-sm text-gray-400">Renovação do Plano</div>
                  <div className="font-medium">
                    {new Date(new Date(userPlan.start_date).getTime() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {showExpirationAlert && (
                <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-2 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={20} />
                  <span>Seu plano vence em {daysUntilExpiration} {daysUntilExpiration === 1 ? 'dia' : 'dias'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <Brain className="text-emerald-300 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Análise de Carteira AI</h3>
                <p className="text-sm text-gray-300">Insights personalizados baseados no seu portfólio</p>
              </div>
              <button
                onClick={() => {
                  setShowAiAnalysis(!showAiAnalysis);
                  if (!aiAnalysis && !aiError) {
                    generateWalletAnalysis();
                  }
                }}
                className="ml-auto bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                {showAiAnalysis ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>

            {showAiAnalysis && (
              <div className="bg-navy-800/50 backdrop-blur-sm rounded-lg p-4 mt-4">
                {loadingAnalysis ? (
                  <div className="flex items-center gap-3 text-gray-300">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Gerando análise...</span>
                  </div>
                ) : aiError ? (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                      {aiError}
                    </div>
                    <button
                      onClick={generateWalletAnalysis}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Tentar Novamente
                    </button>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-line text-gray-300">
                      {aiAnalysis}
                    </div>
                    <button
                      onClick={generateWalletAnalysis}
                      className="mt-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Atualizar Análise
                    </button>
                  </div>
                )}
              </div>
            )}
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

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Rendimento Total Card */}
          <div className="bg-navy-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <BarChart2 className="text-emerald-500" size={24} />
              </div>
              <h3 className="font-semibold">Rendimento Total</h3>
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

          {/* Próximo Rendimento Card */}
          <div className="bg-navy-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="text-blue-500" size={24} />
              </div>
              <h3 className="font-semibold">Próximo Rendimento</h3>
            </div>
            <div className="text-2xl font-bold">
              {(stakingData.total_staking * 0.023).toFixed(2)} FASTC
            </div>
            <div className="text-gray-400 text-sm">Estimativa semanal</div>
          </div>

          {/* Ganhos Totais Card */}
          <div className="bg-navy-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Bell className="text-purple-500" size={24} />
              </div>
              <h3 className="font-semibold">Ganhos Totais</h3>
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
    </div>
  );
}

export default Dashboard;