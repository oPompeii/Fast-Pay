import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Users, Wallet, BarChart2, Bell, Settings, LogOut, MessageSquare, 
  Gift, Search, Edit, Trash, Ban, CheckCircle, DollarSign, ArrowUpCircle,
  ArrowDownCircle, AlertTriangle, Shield, TrendingUp, Calendar, Tag,
  X, UserCog, Lock
} from 'lucide-react';

type UserStatus = 'ACTIVE' | 'BLOCKED' | 'BANNED';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  fastcoin_balance: number;
  plan_name: string;
  plan_type: string;
  created_at: string;
  phone?: string;
  address?: string;
}

interface SalesData {
  totalRevenue: number;
  monthlySales: {
    month: string;
    amount: number;
  }[];
  salesByCurrency: {
    package: string;
    currency: string;
    quantity: number;
    total: number;
  }[];
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  expires_at: string;
  max_uses: number;
  uses: number;
  status: 'ACTIVE' | 'EXPIRED';
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract'>('add');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers24h: 0,
    newUsers7d: 0,
    totalBalance: 0,
    totalSales: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
      fetchPlans();
    }
  }, [activeTab]);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        return;
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!admin) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: userStats } = await supabase
        .from('admin_user_stats')
        .select('*')
        .single();

      const { data: walletStats } = await supabase
        .from('admin_wallet_stats')
        .select('*')
        .single();

      setStats({
        totalUsers: userStats?.total_users || 0,
        newUsers24h: userStats?.new_users_24h || 0,
        newUsers7d: userStats?.new_users_7d || 0,
        totalBalance: walletStats?.total_balance || 0,
        totalSales: 0,
        pendingWithdrawals: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setAvailablePlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpdateUserProfile = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editUserData.name,
          phone: editUserData.phone,
          address: editUserData.address
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      if (selectedPlanId) {
        const { error: planError } = await supabase.rpc('admin_update_plan', {
          p_user_id: selectedUser.id,
          p_new_plan_id: selectedPlanId
        });

        if (planError) throw planError;
      }

      alert('Perfil atualizado com sucesso!');
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user profile:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount) return;

    try {
      const { error } = await supabase.rpc('admin_update_balance', {
        p_user_id: selectedUser.id,
        p_amount: parseFloat(balanceAmount),
        p_operation: balanceOperation
      });

      if (error) throw error;

      alert('Saldo atualizado com sucesso!');
      setShowBalanceModal(false);
      setBalanceAmount('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
      alert('Erro ao atualizar saldo');
    }
  };

  const handleUpdateStatus = async (newStatus: UserStatus) => {
    if (!selectedUser || !actionReason) return;

    try {
      const { error } = await supabase.rpc('admin_update_user_status', {
        p_user_id: selectedUser.id,
        p_new_status: newStatus,
        p_reason: actionReason
      });

      if (error) throw error;

      alert('Status atualizado com sucesso!');
      setShowBlockModal(false);
      setShowBanModal(false);
      setActionReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedUser) return;

    try {
      const { error: dataError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);

      if (dataError) throw dataError;

      alert('Conta excluída com sucesso!');
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao excluir conta');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
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
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-navy-800 p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-emerald-500">Fast</span>Pay
          </h1>
          <p className="text-sm text-gray-400">Painel Administrativo</p>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'dashboard' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-navy-700'
            }`}
          >
            <BarChart2 size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'users' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-navy-700'
            }`}
          >
            <Users size={20} />
            Usuários
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Visão Geral do Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-navy-800 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <Users className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Total de Usuários</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  +{stats.newUsers24h} nas últimas 24h
                </div>
              </div>

              <div className="bg-navy-800 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Wallet className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Total em FastCoins</h3>
                    <p className="text-3xl font-bold">{stats.totalBalance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Em circulação
                </div>
              </div>

              <div className="bg-navy-800 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <TrendingUp className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Total de Vendas</h3>
                    <p className="text-3xl font-bold">${stats.totalSales.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Receita total
                </div>
              </div>

              <div className="bg-navy-800 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <Calendar className="text-yellow-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Novos Usuários (7d)</h3>
                    <p className="text-3xl font-bold">{stats.newUsers7d}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Crescimento semanal
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-navy-700 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-navy-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-700">
                    <th className="text-left p-4">Usuário</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Saldo</th>
                    <th className="text-left p-4">Plano</th>
                    <th className="text-left p-4">Data de Registro</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-navy-700">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : user.status === 'BLOCKED'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.fastcoin_balance?.toFixed(2)} FASTC
                      </td>
                      <td className="p-4">
                        {user.plan_name || 'Free'}
                      </td>
                      <td className="p-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserData({
                                name: user.name,
                                email: user.email,
                                phone: user.phone || '',
                                address: user.address || ''
                              });
                              setShowUserModal(true);
                            }}
                            className="p-2 hover:bg-navy-700 rounded-lg text-emerald-500"
                            title="Editar Usuário"
                          >
                            <UserCog size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBalanceModal(true);
                            }}
                            className="p-2 hover:bg-navy-700 rounded-lg text-blue-500"
                            title="Ajustar Saldo"
                          >
                            <Wallet size={16} />
                          </button>
                          {user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBlockModal(true);
                              }}
                              className="p-2 hover:bg-navy-700 rounded-lg text-yellow-500"
                              title="Bloquear Usuário"
                            >
                              <Lock size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                if (confirm('Deseja desbloquear este usuário?')) {
                                  setSelectedUser(user);
                                  await handleUpdateStatus('ACTIVE');
                                }
                              }}
                              className="p-2 hover:bg-navy-700 rounded-lg text-emerald-500"
                              title="Desbloquear Usuário"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanModal(true);
                            }}
                            className="p-2 hover:bg-navy-700 rounded-lg text-red-500"
                            title="Banir Usuário"
                          >
                            <Shield size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 hover:bg-navy-700 rounded-lg text-red-500"
                            title="Excluir Usuário"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-6">Editar Usuário</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editUserData.name}
                    onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={editUserData.address}
                    onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plano
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Selecione um plano</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateUserProfile}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Modal */}
        {showBalanceModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-6">Ajustar Saldo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operação
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setBalanceOperation('add')}
                      className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                        balanceOperation === 'add'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-navy-700 text-gray-300'
                      }`}
                    >
                      <ArrowUpCircle size={20} />
                      Adicionar
                    </button>
                    <button
                      onClick={() => setBalanceOperation('subtract')}
                      className={`p-2 rounded-lg flex items-center justify-center gap-2 ${
                        balanceOperation === 'subtract'
                          ? 'bg-red-500 text-white'
                          : 'bg-navy-700 text-gray-300'
                      }`}
                    >
                      <ArrowDownCircle size={20} />
                      Subtrair
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor
                  </label>
                  <input
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateBalance}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block Modal */}
        {showBlockModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-6">Bloquear Usuário</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo do Bloqueio
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-32 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateStatus('BLOCKED')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ban Modal */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-6">Banir Usuário</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivo do Banimento
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-32 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateStatus('BANNED')}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Banir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja excluir este usuário? Esta ação é permanente e todos os dados serão perdidos.
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
                  <AlertTriangle size={ 20} />
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;