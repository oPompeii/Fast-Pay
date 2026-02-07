import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Edit, Trash, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDebounce } from '../../hooks/useDebounce';
import ConfirmationDialog from '../ConfirmationDialog';

interface User {
  id: string;
  email: string;
  name: string;
  level: string;
  is_active: boolean;
  created_at: string;
  payment_proof_url?: string;
  wallet?: {
    balance: number;
    fastcoin_balance: number;
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    level: '',
    email: ''
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            name,
            level,
            is_active,
            created_at,
            payment_proof_url,
            wallet:wallets (
              balance,
              fastcoin_balance
            )
          `)
          .neq('role', 'admin')
          .ilike('email', `%${debouncedSearch}%`)
          .order('created_at', { ascending: true });

        if (profilesError) throw profilesError;
        setUsers(profiles || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  const handleUserAction = async (user: User, action: 'activate' | 'deactivate' | 'delete') => {
    setSelectedUser(user);
    setConfirmationAction(action);
    setShowConfirmation(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      level: user.level,
      email: user.email
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          level: editForm.level,
          email: editForm.email
        })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      setSuccess('Usuário atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh user list
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          level,
          is_active,
          created_at,
          payment_proof_url,
          wallet:wallets (
            balance,
            fastcoin_balance
          )
        `)
        .neq('role', 'admin')
        .ilike('email', `%${debouncedSearch}%`)
        .order('created_at', { ascending: true });

      if (profilesError) throw profilesError;
      setUsers(profiles || []);
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);

      if (confirmationAction === 'delete') {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', selectedUser.id);

        if (deleteError) throw deleteError;
        
        setSuccess('Usuário excluído com sucesso!');
      } else {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_active: confirmationAction === 'activate'
          })
          .eq('id', selectedUser.id);

        if (updateError) throw updateError;

        setSuccess(`Usuário ${confirmationAction === 'activate' ? 'ativado' : 'desativado'} com sucesso!`);
      }

      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh user list
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          level,
          is_active,
          created_at,
          payment_proof_url,
          wallet:wallets (
            balance,
            fastcoin_balance
          )
        `)
        .neq('role', 'admin')
        .ilike('email', `%${debouncedSearch}%`)
        .order('created_at', { ascending: true });

      if (profilesError) throw profilesError;
      setUsers(profiles || []);
      setShowConfirmation(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar ação');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Gerenciamento de Usuários
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carteira
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">Nível: {user.level}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatCurrency(user.wallet?.balance || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.wallet?.fastcoin_balance?.toFixed(2) || '0.00'} FST2
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    {user.payment_proof_url && (
                      <a
                        href={user.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        Ver Comprovante
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user, user.is_active ? 'deactivate' : 'activate')}
                        className={`${
                          user.is_active
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={user.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {user.is_active ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleUserAction(user, 'delete')}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Editar Usuário
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nível
                </label>
                <select
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Token">Token</option>
                  <option value="Miner">Miner</option>
                  <option value="Master">Master</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title={`${
          confirmationAction === 'delete'
            ? 'Excluir'
            : confirmationAction === 'activate'
            ? 'Ativar'
            : 'Desativar'
        } Usuário`}
        message={`Tem certeza que deseja ${
          confirmationAction === 'delete'
            ? 'excluir'
            : confirmationAction === 'activate'
            ? 'ativar'
            : 'desativar'
        } este usuário?`}
        confirmLabel={
          confirmationAction === 'delete'
            ? 'Excluir'
            : confirmationAction === 'activate'
            ? 'Ativar'
            : 'Desativar'
        }
        type={confirmationAction === 'delete' ? 'danger' : confirmationAction === 'activate' ? 'info' : 'warning'}
        onConfirm={confirmAction}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default UserManagement;