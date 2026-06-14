import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, Mail, Send, MessageSquare, Users, TrendingUp, 
  Copy, CheckCircle, Share2, Gift, Crown, Medal, Clock, ChevronRight,
  Link as LinkIcon, Facebook, QrCode, Phone,
  AlertTriangle, Award, Star, TrendingDown, ChevronDown, ChevronUp
} from 'lucide-react';

export default function Invite() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteStats, setInviteStats] = useState({
    total_invites: 0,
    accepted_invites: 0,
    pending_invites: 0,
    conversion_rate: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchInviteStats();
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

  const fetchInviteStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_invite_stats', {
        p_user_id: user.id
      });

      if (error) throw error;
      setInviteStats(data);
    } catch (error) {
      console.error('Error fetching invite stats:', error);
    }
  };

  const handleSocialShare = async (platform) => {
    try {
      const { data, error } = await supabase.rpc('process_invite', {
        p_platform: platform,
        p_user_id: user.id
      });

      if (error) throw error;

      let shareUrl = '';
      const message = encodeURIComponent(data.message);
      const referralUrl = `https://fastpy.net/register?ref=${data.referral_code}`;

      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${message}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${referralUrl}&text=${message}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${referralUrl}`;
          break;
      }

      window.open(shareUrl, '_blank');
      fetchInviteStats();
    } catch (error) {
      console.error('Error sharing invite:', error);
      alert('Erro ao compartilhar convite. Tente novamente.');
    }
  };

  const handleEmailInvite = async (e) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.rpc('process_invite', {
        p_platform: 'email',
        p_user_id: user.id,
        p_invitee_name: formData.name
      });

      if (error) throw error;

      alert('Convite enviado com sucesso!');
      setFormData({ name: '', email: '' });
      setShowEmailForm(false);
      fetchInviteStats();
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Erro ao enviar convite. Tente novamente.');
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `https://fastpy.net/register?ref=${user.referral_code}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Erro ao copiar link. Tente novamente.');
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Section */}
          <div className="lg:col-span-2">
            <div className="bg-navy-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Users className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Rede de Afiliados</h2>
                  <p className="text-gray-400">Gerencie sua rede e acompanhe seus ganhos</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-navy-700 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                      <Users className="text-emerald-500" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total de Convites</div>
                      <div className="text-2xl font-bold">{inviteStats.total_invites}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-navy-700 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                      <CheckCircle className="text-emerald-500" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Convites Aceitos</div>
                      <div className="text-2xl font-bold">{inviteStats.accepted_invites}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-navy-700 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                      <Clock className="text-emerald-500" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Convites Pendentes</div>
                      <div className="text-2xl font-bold">{inviteStats.pending_invites}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-navy-700 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-lg">
                      <TrendingUp className="text-emerald-500" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Taxa de Conversão</div>
                      <div className="text-2xl font-bold">{inviteStats.conversion_rate}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Marcos de Convites</h3>
                  <div className="text-sm text-emerald-500">
                    {inviteStats.total_invites} convites
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* 10 Convites */}
                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className={inviteStats.total_invites >= 10 ? "text-emerald-500" : "text-gray-500"} size={20} />
                        <span>10 Convites</span>
                      </div>
                      <div className="text-sm text-emerald-500">+50 FASTC</div>
                    </div>
                    <div className="h-2 bg-navy-600 rounded-full">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((inviteStats.total_invites / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 25 Convites */}
                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className={inviteStats.total_invites >= 25 ? "text-emerald-500" : "text-gray-500"} size={20} />
                        <span>25 Convites</span>
                      </div>
                      <div className="text-sm text-emerald-500">+100 FASTC</div>
                    </div>
                    <div className="h-2 bg-navy-600 rounded-full">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((inviteStats.total_invites / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 50 Convites */}
                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className={inviteStats.total_invites >= 50 ? "text-emerald-500" : "text-gray-500"} size={20} />
                        <span>50 Convites</span>
                      </div>
                      <div className="text-sm text-emerald-500">+250 FASTC</div>
                    </div>
                    <div className="h-2 bg-navy-600 rounded-full">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((inviteStats.total_invites / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 100 Convites */}
                  <div className="bg-navy-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className={inviteStats.total_invites >= 100 ? "text-emerald-500" : "text-gray-500"} size={20} />
                        <span>100 Convites</span>
                      </div>
                      <div className="text-sm text-emerald-500">+750 FASTC</div>
                    </div>
                    <div className="h-2 bg-navy-600 rounded-full">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((inviteStats.total_invites / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranking Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Seu Ranking</h3>
                  <div className="text-sm text-emerald-500">
                    {inviteStats.total_invites} pontos
                  </div>
                </div>
                
                <div className="bg-navy-700 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-emerald-500/20 p-4 rounded-full">
                      {inviteStats.total_invites >= 100 ? (
                        <Crown className="text-emerald-500" size={32} />
                      ) : inviteStats.total_invites >= 50 ? (
                        <Medal className="text-yellow-500" size={32} />
                      ) : (
                        <Medal className="text-gray-400" size={32} />
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        Nível {inviteStats.total_invites >= 100 ? 'Diamante' : inviteStats.total_invites >= 50 ? 'Ouro' : 'Bronze'}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {100 - inviteStats.total_invites} convites para o próximo nível
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="h-2 bg-navy-600 rounded-full">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(inviteStats.total_invites / 100) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <ChevronRight className="text-emerald-500" size={16} />
                      <span>Bônus de 5% em convites</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <ChevronRight className="text-emerald-500" size={16} />
                      <span>Acesso a eventos exclusivos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <ChevronRight className="text-emerald-500" size={16} />
                      <span>Suporte prioritário</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Section */}
          <div>
            <div className="bg-navy-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Convidar Amigos</h3>

              {/* Quick Invite */}
              <div className="space-y-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-navy-700 hover:bg-navy-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={20} />
                      Link Copiado!
                    </>
                  ) : (
                    <>
                      <LinkIcon size={20} />
                      Copiar Link de Convite
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Compartilhar via WhatsApp
                </button>

                <button
                  onClick={() => handleSocialShare('telegram')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} />
                  Compartilhar via Telegram
                </button>

                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="w-full bg-[#1877F2] hover:bg-[#1865D3] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Facebook size={20} />
                  Compartilhar no Facebook
                </button>

                <button
                  onClick={() => setShowQRCode(true)}
                  className="w-full bg-navy-700 hover:bg-navy-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode size={20} />
                  Mostrar QR Code
                </button>

                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full bg-navy-700 hover:bg-navy-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Convidar via Email
                </button>
              </div>

              {/* Email Form Modal */}
              {showEmailForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold mb-6">Convidar via Email</h3>
                    
                    <form onSubmit={handleEmailInvite} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome do Convidado
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="Nome completo"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          E-mail do Convidado
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="email@exemplo.com"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => setShowEmailForm(false)}
                          className="px-4 py-2 rounded-lg font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Send size={20} />
                          Enviar Convite
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* QR Code Modal */}
              {showQRCode && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold mb-6">QR Code do Convite</h3>
                    
                    <div className="flex justify-center mb-6">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://fastpy.net/register?ref=${user.referral_code}`}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>

                    <p className="text-center text-gray-400 mb-6">
                      Escaneie este QR Code para acessar o link de convite
                    </p>

                    <button
                      onClick={() => setShowQRCode(false)}
                      className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4">Benefícios para Convidados</h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Carteira digital segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Investimentos em FastCoin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Programa de afiliados lucrativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Suporte 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}