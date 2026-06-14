import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Lock, Bell, Shield, LogOut, History, AlertTriangle, 
  Smartphone, MapPin, Mail, Calendar, Check, X, MessageSquare,
  Phone, ArrowLeft, FileText, Download, FileSpreadsheet, Package
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [exportLoading, setExportLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    notifications: {
      email: true,
      push: true,
      security: true
    }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
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

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        ...formData,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        birth_date: data.birth_date || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          birth_date: formData.birth_date
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    setChangingPassword(true);

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordSuccess(true);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message);
    } finally {
      setChangingPassword(false);
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

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao excluir conta');
    }
  };

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/32472669126', '_blank');
  };

  const fetchTransactionData = async () => {
    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) throw walletError;

      // Fetch staking positions
      const { data: stakingData, error: stakingError } = await supabase
        .from('staking_positions')
        .select('*')
        .eq('user_id', user.id);

      if (stakingError) throw stakingError;

      // Calculate total staking balance
      const totalStakingBalance = stakingData?.reduce((sum, pos) => {
        if (pos.status === 'ACTIVE') {
          return sum + pos.amount;
        }
        return sum;
      }, 0) || 0;

      // Calculate combined total
      const combinedTotal = (parseFloat(walletData.fastcoin_balance) || 0) + totalStakingBalance;

      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch affiliate earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;

      // Fetch plan movements
      const { data: planMovements, error: planError } = await supabase
        .from('user_plans')
        .select(`
          *,
          plans (
            name,
            plan_type,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (planError) throw planError;

      // Fetch admin actions
      const { data: adminActions, error: adminError } = await supabase
        .from('admin_actions')
        .select('*')
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      return {
        user: userData,
        wallet: walletData,
        staking: stakingData || [],
        transactions: transactionData || [],
        earnings: earningsData || [],
        planMovements: planMovements || [],
        adminActions: adminActions || [],
        totalStakingBalance,
        combinedTotal
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      const data = await fetchTransactionData();
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('FastPay - Extrato Financeiro', 15, 20);

      // User Info
      doc.setFontSize(12);
      doc.text(`Nome: ${data.user.name}`, 15, 35);
      doc.text(`Email: ${data.user.email}`, 15, 42);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString()}`, 15, 49);

      // Balances
      doc.text('Saldo em Carteira', 15, 65);
      doc.text(`${data.wallet.fastcoin_balance} FASTC`, 150, 65);
      
      doc.text('Saldo em Staking', 15, 72);
      doc.text(`${data.totalStakingBalance} FASTC`, 150, 72);
      
      doc.text('Saldo Total', 15, 79);
      doc.text(`${data.combinedTotal} FASTC`, 150, 79);

      // Plan Movements
      doc.addPage();
      doc.text('Histórico de Planos', 15, 20);
      if (data.planMovements.length > 0) {
        const planRows = data.planMovements.map(plan => [
          new Date(plan.created_at).toLocaleDateString(),
          plan.plans.name,
          plan.plans.plan_type,
          `$${plan.plans.price}`,
          plan.status
        ]);

        doc.autoTable({
          startY: 25,
          head: [['Data', 'Plano', 'Tipo', 'Valor', 'Status']],
          body: planRows,
        });
      } else {
        doc.text('Nenhum histórico de planos encontrado', 15, 25);
      }

      // Admin Actions
      if (data.adminActions.length > 0) {
        doc.addPage();
        doc.text('Ações Administrativas', 15, 20);
        const actionRows = data.adminActions.map(action => [
          new Date(action.created_at).toLocaleDateString(),
          action.action_type,
          action.details.reason || '-',
          action.details.new_status || '-'
        ]);

        doc.autoTable({
          startY: 25,
          head: [['Data', 'Ação', 'Motivo', 'Status']],
          body: actionRows,
        });
      }

      // Staking Positions
      doc.addPage();
      doc.text('Posições em Staking', 15, 20);
      if (data.staking.length > 0) {
        const stakingRows = data.staking.map(pos => [
          new Date(pos.start_date).toLocaleDateString(),
          pos.amount.toString(),
          `${pos.period} dias`,
          pos.status
        ]);

        doc.autoTable({
          startY: 25,
          head: [['Data Início', 'Quantidade', 'Período', 'Status']],
          body: stakingRows,
        });
      } else {
        doc.text('Nenhuma posição em staking', 15, 25);
      }

      // Transactions
      doc.addPage();
      doc.text('Histórico de Transações', 15, 20);
      if (data.transactions.length > 0) {
        const transactionRows = data.transactions.map(tx => [
          new Date(tx.created_at).toLocaleDateString(),
          tx.type,
          tx.amount.toString(),
          tx.status
        ]);

        doc.autoTable({
          startY: 25,
          head: [['Data', 'Tipo', 'Quantidade', 'Status']],
          body: transactionRows,
        });
      }

      // Save the PDF
      doc.save(`fastpay-extrato-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const data = await fetchTransactionData();

      const workbook = XLSX.utils.book_new();

      // User Info Sheet
      const userInfo = [
        ['FastPay - Informações do Usuário'],
        [],
        ['Nome', data.user.name],
        ['Email', data.user.email],
        ['Data de Emissão', new Date().toLocaleDateString()],
        [],
        ['Saldo em Carteira', `${data.wallet.fastcoin_balance} FASTC`],
        ['Saldo em Staking', `${data.totalStakingBalance} FASTC`],
        ['Saldo Total', `${data.combinedTotal} FASTC`]
      ];
      const userSheet = XLSX.utils.aoa_to_sheet(userInfo);
      XLSX.utils.book_append_sheet(workbook, userSheet, 'Informações');

      // Plan Movements Sheet
      if (data.planMovements.length > 0) {
        const planData = data.planMovements.map(plan => ({
          'Data': new Date(plan.created_at).toLocaleDateString(),
          'Plano': plan.plans.name,
          'Tipo': plan.plans.plan_type,
          'Valor': `$${plan.plans.price}`,
          'Status': plan.status
        }));
        const planSheet = XLSX.utils.json_to_sheet(planData);
        XLSX.utils.book_append_sheet(workbook, planSheet, 'Histórico de Planos');
      }

      // Admin Actions Sheet
      if (data.adminActions.length > 0) {
        const actionData = data.adminActions.map(action => ({
          'Data': new Date(action.created_at).toLocaleDateString(),
          'Ação': action.action_type,
          'Motivo': action.details.reason || '-',
          'Status': action.details.new_status || '-'
        }));
        const actionSheet = XLSX.utils.json_to_sheet(actionData);
        XLSX.utils.book_append_sheet(workbook, actionSheet, 'Ações Administrativas');
      }

      // Staking Sheet
      if (data.staking.length > 0) {
        const stakingData = data.staking.map(pos => ({
          'Data Início': new Date(pos.start_date).toLocaleDateString(),
          'Quantidade': pos.amount,
          'Período': `${pos.period} dias`,
          'Status': pos.status,
          'Data Término': new Date(pos.end_date).toLocaleDateString(),
          'Último Saque': new Date(pos.last_withdrawal_date).toLocaleDateString()
        }));
        const stakingSheet = XLSX.utils.json_to_sheet(stakingData);
        XLSX.utils.book_append_sheet(workbook, stakingSheet, 'Staking');
      }

      // Transactions Sheet
      if (data.transactions.length > 0) {
        const transactionData = data.transactions.map(tx => ({
          'Data': new Date(tx.created_at).toLocaleDateString(),
          'Tipo': tx.type,
          'Quantidade': tx.amount,
          'Status': tx.status,
          'Detalhes': JSON.stringify(tx.details)
        }));
        const txSheet = XLSX.utils.json_to_sheet(transactionData);
        XLSX.utils.book_append_sheet(workbook, txSheet, 'Transações');
      }

      // Save the file
      XLSX.writeFile(workbook, `fastpay-extrato-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Erro ao gerar arquivo Excel. Tente novamente.');
    } finally {
      setExportLoading(false);
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
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </button>

          <button
            onClick={handleWhatsAppSupport}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Phone size={20} />
            Suporte via WhatsApp
          </button>
        </div>

        <div className="bg-navy-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Configurações</h2>

          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'profile' ? 'bg-emerald-500' : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              <User size={20} />
              <span className="hidden sm:inline">Perfil</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'security' ? 'bg-emerald-500' : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              <Lock size={20} />
              <span className="hidden sm:inline">Segurança</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'notifications' ? 'bg-emerald-500' : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              <Bell size={20} />
              <span className="hidden sm:inline">Notificações</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'export' ? 'bg-emerald-500' : 'bg-navy-700 hover:bg-navy-600'
              }`}
            >
              <FileText size={20} />
              <span className="hidden sm:inline">Exportar Dados</span>
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-navy-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-navy-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
                
                {passwordSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 rounded-lg p-4 mb-4 flex items-center gap-2">
                    <Check size={20} />
                    <span>Senha alterada com sucesso!</span>
                  </div>
                )}

                {passwordError && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-4">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="bg-navy-600 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-navy-600 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-navy-600 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {changingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-500 mb-4">Zona de Perigo</h3>
                <p className="text-gray-400 mb-4">
                  Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Excluir Conta
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-navy-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Preferências de Notificação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por Email</h4>
                      <p className="text-sm text-gray-400">Receba atualizações importantes por email</p>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          email: !formData.notifications.email
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        formData.notifications.email ? 'bg-emerald-500' : 'bg-navy-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.notifications.email ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações Push</h4>
                      <p className="text-sm text-gray-400">Receba notificações em tempo real</p>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          push: !formData.notifications.push
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        formData.notifications.push ? 'bg-emerald-500' : 'bg-navy-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.notifications.push ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertas de Segurança</h4>
                      <p className="text-sm text-gray-400">Receba alertas sobre atividades suspeitas</p>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          security: !formData.notifications.security
                        }
                      })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        formData.notifications.security ? ' bg-emerald-500' : 'bg-navy-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.notifications.security ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-navy-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Exportar Dados</h3>
                <p className="text-gray-400 mb-6">
                  Exporte seus dados financeiros em diferentes formatos para melhor controle e análise.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-navy-600 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <FileText className="text-emerald-500" size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Exportar como PDF</h4>
                        <p className="text-sm text-gray-400">Formato ideal para impressão</p>
                      </div>
                    </div>
                    <button
                      onClick={exportToPDF}
                      disabled={exportLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {exportLoading ? (
                        <>
                          <Download className="animate-spin" size={20} />
                          Gerando PDF...
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          Baixar PDF
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-navy-600 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <FileSpreadsheet className="text-emerald-500" size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Exportar como Excel</h4>
                        <p className="text-sm text-gray-400">Ideal para análise detalhada</p>
                      </div>
                    </div>
                    <button
                      onClick={exportToExcel}
                      disabled={exportLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {exportLoading ? (
                        <>
                          <Download className="animate-spin" size={20} />
                          Gerando Excel...
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          Baixar Excel
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-navy-600 rounded-lg">
                  <h4 className="font-semibold mb-2">O que está incluído na exportação?</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Informações do perfil
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Saldo em carteira e staking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Histórico completo de transações
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Ganhos de afiliados
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Posições ativas em staking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Histórico de planos e atualizações
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Ações administrativas
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação é permanente e todos os seus dados serão perdidos.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <X size={20} />
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <AlertTriangle size={20} />
                Excluir Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;