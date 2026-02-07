import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, DollarSign, Share2, ArrowLeft, Copy, CheckCircle } from 'lucide-react';

export default function Affiliates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAffiliateTutorial, setShowAffiliateTutorial] = useState(false);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    directAffiliates: 0,
    networkVolume: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAffiliateData();
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

  const fetchAffiliateData = async () => {
    try {
      // Fetch user's referral code
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      setReferralCode(userData.referral_code);

      // Fetch affiliate stats
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliate_network')
        .select('*')
        .eq('referrer_id', user.id);

      if (affiliateError) throw affiliateError;

      const directAffiliates = affiliateData?.filter(a => a.level === 1).length || 0;
      const totalAffiliates = affiliateData?.length || 0;

      setStats({
        totalAffiliates,
        directAffiliates,
        networkVolume: 0, // To be implemented with real data
        totalEarnings: 0,
        pendingEarnings: 0
      });
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowAffiliateTutorial(true);
    }, 2000);
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <Users className="text-emerald-500" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Rede de Afiliados</h2>
                <p className="text-gray-400">Gerencie sua rede e acompanhe seus ganhos</p>
              </div>
            </div>
            <button
              onClick={copyReferralLink}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {copied ? <CheckCircle size={20} /> : <Share2 size={20} />}
              {copied ? 'Link Copiado!' : 'Compartilhar Link'}
            </button>
          </div>

          <div className="bg-navy-700 p-6 rounded-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Seu Código de Afiliado</div>
                <div className="text-2xl font-bold">{referralCode}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                    setShowAffiliateTutorial(true);
                  }, 2000);
                }}
                className="text-emerald-500 hover:text-emerald-400"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          {showAffiliateTutorial && (
            <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-emerald-500 mb-4">
                Comece a Ganhar com Indicações!
              </h3>
              <p className="text-gray-300 mb-4">
                Agora que você copiou seu código de afiliado, comece a construir sua rede:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Compartilhe seu código com amigos e conhecidos</li>
                <li>Ganhe comissões quando eles se cadastrarem e fizerem compras</li>
                <li>Acompanhe seus ganhos e sua rede aqui mesmo</li>
              </ol>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAffiliateTutorial(false)}
                  className="text-emerald-500 hover:text-emerald-400"
                >
                  Entendi
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-navy-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Users className="text-blue-500" size={20} />
                </div>
                <h3 className="font-semibold">Total de Afiliados</h3>
              </div>
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
              <div className="text-gray-400 text-sm">Em toda sua rede</div>
            </div>

            <div className="bg-navy-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Users className="text-emerald-500" size={20} />
                </div>
                <h3 className="font-semibold">Afiliados Diretos</h3>
              </div>
              <div className="text-2xl font-bold">{stats.directAffiliates}</div>
              <div className="text-gray-400 text-sm">Indicações diretas</div>
            </div>

            <div className="bg-navy-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <TrendingUp className="text-purple-500" size={20} />
                </div>
                <h3 className="font-semibold">Volume da Rede</h3>
              </div>
              <div className="text-2xl font-bold">${stats.networkVolume.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">Volume total gerado</div>
            </div>

            <div className="bg-navy-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <DollarSign className="text-yellow-500" size={20} />
                </div>
                <h3 className="font-semibold">Ganhos Totais</h3>
              </div>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">+${stats.pendingEarnings.toFixed(2)} pendente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}