import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, TrendingUp, Clock, Info, Lock, Unlock, ArrowUpCircle, Calendar, Gift 
} from 'lucide-react';

function Earn() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);
  const [walletData, setWalletData] = useState({
    fastcoin_balance: '0.00',
  });
  const [stakingPositions, setStakingPositions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [stakingAmount, setStakingAmount] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [withdrawing, setWithdrawing] = useState<{[key: string]: boolean}>({});
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchUserPlan();
      fetchStakingPositions();
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

  const fetchWalletData = async () => {
    try {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (wallet) setWalletData(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchStakingPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('staking_positions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStakingPositions(data || []);
    } catch (error) {
      console.error('Error fetching staking positions:', error);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
        throw new Error('Por favor, insira um valor válido');
      }

      if (parseFloat(stakingAmount) > parseFloat(walletData.fastcoin_balance)) {
        throw new Error('Saldo insuficiente');
      }

      if (parseFloat(stakingAmount) < 10) {
        throw new Error('O valor mínimo para staking é 10 FASTC');
      }

      const { error: stakingError } = await supabase
        .from('staking_positions')
        .insert([{
          user_id: user.id,
          amount: parseFloat(stakingAmount),
          period: selectedPeriod,
          status: 'ACTIVE',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + selectedPeriod * 24 * 60 * 60 * 1000).toISOString(),
          last_withdrawal_date: new Date().toISOString()
        }]);

      if (stakingError) throw stakingError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          fastcoin_balance: (parseFloat(walletData.fastcoin_balance) - parseFloat(stakingAmount)).toString(),
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      alert('Staking realizado com sucesso!');
      setStakingAmount('');
      fetchWalletData();
      fetchStakingPositions();
    } catch (error) {
      console.error('Error processing staking:', error);
      alert(error.message || 'Erro ao realizar staking. Tente novamente.');
    }
  };

  const handleUnlock = async (positionId: string) => {
    try {
      setUnlocking(true);

      const position = stakingPositions.find(p => p.id === positionId);
      if (!position) throw new Error('Posição não encontrada');

      // Calculate returns
      const returns = calculateReturns(position.amount, position.period);
      const totalAmount = position.amount + returns;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          fastcoin_balance: (parseFloat(walletData.fastcoin_balance) + totalAmount).toString(),
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Update staking position status
      const { error: stakingError } = await supabase
        .from('staking_positions')
        .update({ status: 'COMPLETED' })
        .eq('id', positionId);

      if (stakingError) throw stakingError;

      alert('Staking desbloqueado com sucesso!');
      fetchWalletData();
      fetchStakingPositions();
    } catch (error) {
      console.error('Error unlocking staking:', error);
      alert(error.message || 'Erro ao desbloquear staking. Tente novamente.');
    } finally {
      setUnlocking(false);
    }
  };

  const handleWithdrawEarnings = async (positionId: string) => {
    if (processingWithdrawal) {
      return;
    }

    try {
      setProcessingWithdrawal(true);
      setWithdrawing(prev => ({ ...prev, [positionId]: true }));

      // Call the server-side function to process withdrawal
      const { data, error } = await supabase
        .rpc('process_staking_withdrawal', {
          p_position_id: positionId,
          p_user_id: user.id
        });

      if (error) {
        throw new Error(error.message);
      }

      const earnings = data;
      alert(`Rendimento semanal de ${earnings.toFixed(2)} FASTC retirado com sucesso!`);
      
      // Refresh data
      await fetchWalletData();
      await fetchStakingPositions();
    } catch (error) {
      console.error('Error withdrawing earnings:', error);
      alert(error.message || 'Erro ao retirar rendimentos. Tente novamente.');
    } finally {
      setProcessingWithdrawal(false);
      setWithdrawing(prev => ({ ...prev, [positionId]: false }));
    }
  };

  const isUnlockable = (endDate: string) => {
    return new Date(endDate) <= new Date();
  };

  const canWithdrawEarnings = (lastWithdrawalDate: string) => {
    const lastWithdrawal = new Date(lastWithdrawalDate);
    const now = new Date();
    const daysSinceLastWithdrawal = Math.floor((now.getTime() - lastWithdrawal.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastWithdrawal >= 7;
  };

  const getNextPaymentDate = (lastWithdrawalDate: string) => {
    const lastWithdrawal = new Date(lastWithdrawalDate);
    const nextPayment = new Date(lastWithdrawal);
    nextPayment.setDate(nextPayment.getDate() + 7);
    return nextPayment;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRemainingTime = (nextPaymentDate: Date) => {
    const now = new Date();
    const diff = nextPaymentDate.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateReturns = (amount: number, period: number) => {
    const weeklyRate = period === 30 ? 0.023 : period === 60 ? 0.026 : 0.03;
    const weeks = period / 7;
    return amount * (1 + weeklyRate) ** weeks - amount;
  };

  const calculateWeeklyEarnings = (amount: number, period: number) => {
    const weeklyRate = period === 30 ? 0.023 : period === 60 ? 0.026 : 0.03;
    return amount * weeklyRate;
  };

  const getContractEndDate = (endDate: string) => {
    const date = new Date(endDate);
    const daysRemaining = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return {
      date: formatDate(endDate),
      daysRemaining
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-emerald-500">Carregando...</div>
      </div>
    );
  }

  // Check if user has an active plan
  if (!userPlan) {
    return (
      <div className="min-h-screen bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-8"
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </button>

          <div className="bg-navy-800 rounded-lg p-8 text-center">
            <div className="bg-navy-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-emerald-500" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
            <p className="text-gray-400 mb-6">
              Para acessar a área de Renda Fixa, você precisa ter um plano ativo.
            </p>

            <button
              onClick={() => navigate('/packages')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <Gift size={20} />
              Ver Pacotes Disponíveis
            </button>
          </div>
        </div>
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

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Renda Fixa FastPay</h1>
          <p className="text-gray-400">
            Faça staking de FastCoin e ganhe rendimentos semanais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-navy-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total em Staking</div>
                <div className="text-2xl font-bold">
                  {stakingPositions.reduce((acc, pos) => acc + pos.amount, 0).toFixed(2)} FASTC
                </div>
              </div>
            </div>
          </div>

          <div className="bg-navy-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <Clock className="text-emerald-500" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total de Rendimentos</div>
                <div className="text-2xl font-bold">
                  {stakingPositions.reduce((acc, pos) => {
                    const returns = calculateReturns(pos.amount, pos.period);
                    return acc + returns;
                  }, 0).toFixed(2)} FASTC
                </div>
              </div>
            </div>
          </div>

          <div className="bg-navy-800 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <Info className="text-emerald-500" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Saldo Disponível</div>
                <div className="text-2xl font-bold">
                  {walletData.fastcoin_balance} FASTC
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-navy-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">30 Dias</h3>
            <div className="text-3xl font-bold text-emerald-500 mb-2">2.3%</div>
            <div className="text-sm text-gray-400 mb-4">semanal</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Pagamento semanal</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Mínimo 10 FASTC</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Bloqueio de 30 dias</span>
              </li>
            </ul>
            <div className="text-sm text-gray-400 mb-4">
              Exemplo: 100 FASTC = 9.86 FASTC em 30 dias
            </div>
            <button
              onClick={() => setSelectedPeriod(30)}
              className={`w-full py-2 rounded-lg font-medium ${
                selectedPeriod === 30
                  ? 'bg-emerald-500 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Fazer Staking
            </button>
          </div>

          <div className="bg-navy-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">60 Dias</h3>
            <div className="text-3xl font-bold text-emerald-500 mb-2">2.6%</div>
            <div className="text-sm text-gray-400 mb-4">semanal</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Pagamento semanal</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Mínimo 10 FASTC</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Bloqueio de 60 dias</span>
              </li>
            </ul>
            <div className="text-sm text-gray-400 mb-4">
              Exemplo: 100 FASTC = 22.29 FASTC em 60 dias
            </div>
            <button
              onClick={() => setSelectedPeriod(60)}
              className={`w-full py-2 rounded-lg font-medium ${
                selectedPeriod === 60
                  ? 'bg-emerald-500 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Fazer Staking
            </button>
          </div>

          <div className="bg-navy-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">90 Dias</h3>
            <div className="text-3xl font-bold text-emerald-500 mb-2">3%</div>
            <div className="text-sm text-gray-400 mb-4">semanal</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Pagamento semanal</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Mínimo 10 FASTC</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Bloqueio de 90 dias</span>
              </li>
            </ul>
            <div className="text-sm text-gray-400 mb-4">
              Exemplo: 100 FASTC = 38.57 FASTC em 90 dias
            </div>
            <button
              onClick={() => setSelectedPeriod(90)}
              className={`w-full py-2 rounded-lg font-medium ${
                selectedPeriod === 90
                  ? 'bg-emerald-500 text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Fazer Staking
            </button>
          </div>
        </div>

        <div className="bg-navy-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-6">Fazer Staking</h3>
          
          <form onSubmit={handleStake} className="max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantidade de FASTC
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">FASTC</span>
                <input
                  type="number"
                  value={stakingAmount}
                  onChange={(e) => setStakingAmount(e.target.value)}
                  className="bg-navy-700 w-full pl-12 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Período Selecionado
              </label>
              <div className="text-lg font-semibold">
                {selectedPeriod} dias ({selectedPeriod === 30 ? '2.3%' : selectedPeriod === 60 ? '2.6%' : '3%'} semanal)
              </div>
            </div>

            {stakingAmount && (
              <div className="bg-navy-700 p-4 rounded-lg mb-6">
                <div className="text-sm text-gray-400 mb-2">Retorno Estimado</div>
                <div className="text-xl font-bold">
                  {calculateReturns(parseFloat(stakingAmount) || 0, selectedPeriod).toFixed(2)} FASTC
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Rendimento semanal: {calculateWeeklyEarnings(parseFloat(stakingAmount) || 0, selectedPeriod).toFixed(2)} FASTC
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Confirmar Staking
            </button>
          </form>
        </div>

        {stakingPositions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-6">Posições Ativas</h3>
          
            <div className="grid gap-4">
              {stakingPositions.map((position) => {
                const contractEnd = getContractEndDate(position.end_date);
                const nextPayment = getNextPaymentDate(position.last_withdrawal_date);
                const timeToNextPayment = getRemainingTime(nextPayment);
                const canWithdraw = canWithdrawEarnings(position.last_withdrawal_date);

                return (
                  <div key={position.id} className="bg-navy-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Quantidade e Período */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Quantidade</div>
                        <div className="font-semibold">{position.amount.toFixed(2)} FASTC</div>
                        <div className="text-sm text-gray-400 mt-2">Período: {position.period} dias</div>
                      </div>

                      {/* Taxa e Ganhos */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Taxa Semanal</div>
                        <div className="font-semibold">
                          {position.period === 30 ? '2.3%' : position.period === 60 ? '2.6%' : '3%'}
                        </div>
                        <div className="text-sm text-emerald-500 mt-2">
                          {calculateWeeklyEarnings(position.amount, position.period).toFixed(2)} FASTC/semana
                        </div>
                      </div>

                      {/* Próximo Pagamento */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Próximo Pagamento</div>
                        <div className="font-semibold">
                          {formatDate(nextPayment.toISOString())}
                        </div>
                        <div className="text-sm text-emerald-500 mt-2">
                          Em {timeToNextPayment}
                        </div>
                      </div>

                      {/* Término do Contrato */}
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Término do Contrato</div>
                        <div className="font-semibold">
                          {contractEnd.date}
                        </div>
                        <div className="text-sm text-emerald-500 mt-2">
                          {contractEnd.daysRemaining > 0 
                            ? `Em ${contractEnd.daysRemaining} dias`
                            : 'Contrato finalizado'}
                        </div>
                      </div>

                      {/* Status e Ações */}
                      <div className="lg:col-span-4">
                        <div className="text-sm text-gray-400 mb-2">Status</div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs text-center ${
                            position.status === 'COMPLETED' 
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : isUnlockable(position.end_date)
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {position.status === 'COMPLETED'
                              ? 'Completado'
                              : isUnlockable(position.end_date)
                              ? 'Disponível'
                              : 'Em Staking'}
                          </span>

                          {position.status === 'ACTIVE' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleWithdrawEarnings(position.id)}
                                disabled={!canWithdraw || withdrawing[position.id] || processingWithdrawal}
                                className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 text-sm ${
                                  canWithdraw && !processingWithdrawal
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : 'bg-navy-700 text-gray-400 cursor-not-allowed'
                                }`}
                                title={
                                  canWithdraw
                                    ? 'Retirar rendimento semanal'
                                    : `Próximo saque disponível em ${timeToNextPayment}`
                                }
                              >
                                <ArrowUpCircle size={16} />
                                {withdrawing[position.id] ? 'Processando...' : 'Retirar'}
                              </button>

                              <button
                                onClick={() => handleUnlock(position.id)}
                                disabled={!isUnlockable(position.end_date) || unlocking}
                                className={`px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 text-sm ${
                                  isUnlockable(position.end_date)
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : 'bg-navy-700 text-gray-400 cursor-not-allowed'
                                }`}
                                title={
                                  isUnlockable(position.end_date)
                                    ? 'Desbloquear Staking'
                                    : `Bloqueado até ${formatDate(position.end_date)}`
                                }
                              >
                                {isUnlockable(position.end_date) ? (
                                  <Unlock size={16} />
                                ) : (
                                  <Lock size={16} />
                                )}
                                {unlocking ? 'Processando...' : 'Desbloquear'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Earn;