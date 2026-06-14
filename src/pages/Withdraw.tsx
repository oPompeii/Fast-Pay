import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, DollarSign, Phone, Building2, Bitcoin, QrCode, Copy, CheckCircle, X, Receipt,
  Clock, AlertTriangle
} from 'lucide-react';

type WithdrawMethod = 'PIX' | 'MBWAY' | 'IBAN' | 'CRYPTO';
type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';
type CryptoNetwork = 'BTC' | 'ETH' | 'BNB' | 'TRX';

export default function Withdraw() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [walletData, setWalletData] = useState({
    fastcoin_balance: '0.00',
  });
  const [withdrawLocked, setWithdrawLocked] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>('PIX');
  const [amount, setAmount] = useState('');
  
  // PIX fields
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('CPF');
  const [pixKey, setPixKey] = useState('');
  
  // MBWAY fields
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // IBAN fields
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  
  // Crypto fields
  const [cryptoNetwork, setCryptoNetwork] = useState<CryptoNetwork>('BTC');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      checkWithdrawLock();
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

  const checkWithdrawLock = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const createdAt = new Date(userData.created_at);
      const unlockDate = new Date(createdAt.getTime() + (30 * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (now < unlockDate) {
        setWithdrawLocked(true);
        
        // Update countdown timer every second
        const timer = setInterval(() => {
          const now = new Date();
          const diff = unlockDate.getTime() - now.getTime();

          if (diff <= 0) {
            setWithdrawLocked(false);
            clearInterval(timer);
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeRemaining({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setWithdrawLocked(false);
      }
    } catch (error) {
      console.error('Error checking withdraw lock:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Por favor, insira um valor válido');
      }

      if (parseFloat(amount) > parseFloat(walletData.fastcoin_balance)) {
        throw new Error('Saldo insuficiente');
      }

      let withdrawalDetails = {
        method: withdrawMethod,
      };

      switch (withdrawMethod) {
        case 'PIX':
          withdrawalDetails = {
            ...withdrawalDetails,
            keyType: pixKeyType,
            key: pixKey,
          };
          break;
        case 'MBWAY':
          withdrawalDetails = {
            ...withdrawalDetails,
            phoneNumber,
          };
          break;
        case 'IBAN':
          withdrawalDetails = {
            ...withdrawalDetails,
            iban,
            swiftCode,
            bankName,
            accountName,
          };
          break;
        case 'CRYPTO':
          withdrawalDetails = {
            ...withdrawalDetails,
            network: cryptoNetwork,
            address: walletAddress,
          };
          break;
      }

      // Create withdrawal request
      const { data, error: withdrawalError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'WITHDRAW',
          amount: parseFloat(amount),
          status: 'PENDING',
          details: withdrawalDetails,
        }])
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      // Format withdrawal details for WhatsApp message
      let withdrawalInfo = '';
      switch (withdrawMethod) {
        case 'PIX':
          withdrawalInfo = `
Método: PIX
Tipo de Chave: ${pixKeyType}
Chave: ${pixKey}`;
          break;
        case 'MBWAY':
          withdrawalInfo = `
Método: MBWAY
Telefone: ${phoneNumber}`;
          break;
        case 'IBAN':
          withdrawalInfo = `
Método: IBAN
IBAN: ${iban}
SWIFT/BIC: ${swiftCode}
Banco: ${bankName}
Titular: ${accountName}`;
          break;
        case 'CRYPTO':
          withdrawalInfo = `
Método: CRYPTO
Rede: ${cryptoNetwork}
Endereço: ${walletAddress}`;
          break;
      }

      // Open WhatsApp with withdrawal request
      const message = encodeURIComponent(`Olá FastPay tudo bem? Gostaria de solicitar um saque:

ID do Saque: ${data.id}
Valor: ${amount} FASTC
Email: ${user.email}
${withdrawalInfo}

Aguardo a confirmação do saque. Obrigado!`);

      window.open(`https://wa.me/32472669126?text=${message}`, '_blank');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert(error.message || 'Erro ao processar saque. Tente novamente.');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </button>

        <div className="bg-navy-800 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Saque</h2>
            <p className="text-gray-400">Solicite seu saque via PIX, MBWAY, IBAN Europeu ou Crypto</p>
          </div>

          {withdrawLocked ? (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-xl font-semibold text-red-500">Saque Bloqueado</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Por motivos de segurança, os saques estão bloqueados por 30 dias após a criação da conta.
              </p>
              <div className="bg-navy-700 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Tempo Restante para Desbloqueio:</div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-500">{timeRemaining.days}</div>
                    <div className="text-sm text-gray-400">Dias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-500">{timeRemaining.hours}</div>
                    <div className="text-sm text-gray-400">Horas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-500">{timeRemaining.minutes}</div>
                    <div className="text-sm text-gray-400">Minutos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-500">{timeRemaining.seconds}</div>
                    <div className="text-sm text-gray-400">Segundos</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-navy-700 rounded-lg p-6 mb-6">
            <div className="text-gray-400 mb-2">Saldo Disponível</div>
            <div className="text-3xl font-bold">
              {walletData.fastcoin_balance} FASTC
            </div>
            <div className="text-gray-400 text-sm mt-1">
              ≈ ${(parseFloat(walletData.fastcoin_balance) * 1).toFixed(2)} USD
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Método de Saque
              </label>
              <div className="grid grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('PIX')}
                  disabled={withdrawLocked}
                  className={`p-4 rounded-lg flex items-center justify-center gap-2 ${
                    withdrawMethod === 'PIX'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                  } ${withdrawLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <DollarSign size={20} />
                  PIX
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('MBWAY')}
                  disabled={withdrawLocked}
                  className={`p-4 rounded-lg flex items-center justify-center gap-2 ${
                    withdrawMethod === 'MBWAY'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                  } ${withdrawLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Phone size={20} />
                  MBWAY
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('IBAN')}
                  disabled={withdrawLocked}
                  className={`p-4 rounded-lg flex items-center justify-center gap-2 ${
                    withdrawMethod === 'IBAN'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                  } ${withdrawLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Building2 size={20} />
                  IBAN
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMethod('CRYPTO')}
                  disabled={withdrawLocked}
                  className={`p-4 rounded-lg flex items-center justify-center gap-2 ${
                    withdrawMethod === 'CRYPTO'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
                  } ${withdrawLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Bitcoin size={20} />
                  Crypto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">FASTC</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={withdrawLocked}
                  className="bg-navy-700 w-full pl-12 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {withdrawMethod === 'PIX' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Chave PIX
                  </label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="CPF">CPF</option>
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Telefone</option>
                    <option value="RANDOM">Chave Aleatória</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Digite sua chave PIX"
                    required
                  />
                </div>
              </>
            )}

            {withdrawMethod === 'MBWAY' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Telefone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={withdrawLocked}
                  className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+351"
                  required
                />
              </div>
            )}

            {withdrawMethod === 'IBAN' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="PT50..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código SWIFT/BIC
                  </label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="BCOMPTPL..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Banco
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Titular
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </>
            )}

            {withdrawMethod === 'CRYPTO' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rede
                  </label>
                  <select
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value as CryptoNetwork)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BNB">BNB Smart Chain (BSC)</option>
                    <option value="TRX">Tron (TRX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Endereço da Carteira
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    disabled={withdrawLocked}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={`Endereço ${cryptoNetwork}`}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={withdrawLocked || submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processando...' : 'Solicitar Saque'}
            </button>

            <p className="text-sm text-gray-400 text-center">
              Seu saque será processado em até 48 horas úteis
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}