import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash, CheckCircle, XCircle, MessageSquare, Wallet, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';
import WalletManager from './WalletManager';
import EarningsManager from './EarningsManager';
import PackageManager from './PackageManager';

interface User {
  id: string;
  email: string;
  name: string;
  level: string;
  is_active: boolean;
  registration_status: string;
  created_at: string;
  payment_proof_url?: string;
  package_type?: string;
  wallet?: {
    balance: number;
    fastcoin_balance: number;
  };
  referral_code: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showPackageManager, setShowPackageManager] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    level: '',
    email: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          wallet:wallets (
            balance,
            fastcoin_balance
          )
        `)
        .neq('role', 'admin')
        .ilike('email', `%${searchTerm}%`)
        .order('created_at', { ascending: true });

      if (profilesError) throw profilesError;
      setUsers(profiles || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

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

      setSuccess('User updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      await fetchUsers();
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user');
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
        
        setSuccess('User deleted successfully!');
      } else {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_active: confirmationAction === 'activate'
          })
          .eq('id', selectedUser.id);

        if (updateError) throw updateError;

        setSuccess(`User ${confirmationAction === 'activate' ? 'activated' : 'deactivated'} successfully!`);
      }

      setTimeout(() => setSuccess(null), 3000);
      
      await fetchUsers();
      setShowConfirmation(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing action');
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
            User Management
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      <p className="text-xs text-gray-400">
                        Level: {user.level} | Code: {user.referral_code}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.payment_proof_url && (
                      <a
                        href={user.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        View Payment Proof
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(user.wallet?.balance || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.wallet?.fastcoin_balance?.toFixed(2) || '0.00'} FST2
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
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
                        title={user.is_active ? 'Deactivate' : 'Activate'}
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
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowWalletManager(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Manage Wallet"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPackageManager(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title="Manage Package"
                      >
                        <Package className="w-4 h-4" />
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
              Edit User
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
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
                  Level
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
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Manager Modal */}
      {showWalletManager && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciar Carteira - {selectedUser.name || selectedUser.email}
              </h3>
              <button
                onClick={() => setShowWalletManager(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              <WalletManager
                userId={selectedUser.id}
                currentBalance={selectedUser.wallet?.balance || 0}
                currentFastcoin={selectedUser.wallet?.fastcoin_balance || 0}
                onUpdate={fetchUsers}
              />
              <EarningsManager
                userId={selectedUser.id}
                onUpdate={fetchUsers}
              />
            </div>
          </div>
        </div>
      )}

      {/* Package Manager Modal */}
      {showPackageManager && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciar Pacote - {selectedUser.name || selectedUser.email}
              </h3>
              <button
                onClick={() => setShowPackageManager(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <PackageManager
              userId={selectedUser.id}
              currentLevel={selectedUser.level}
              currentType={selectedUser.package_type || 'monthly'}
              onUpdate={() => {
                fetchUsers();
                setShowPackageManager(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title={`${
          confirmationAction === 'delete'
            ? 'Delete'
            : confirmationAction === 'activate'
            ? 'Activate'
            : 'Deactivate'
        } User`}
        message={`Are you sure you want to ${
          confirmationAction === 'delete'
            ? 'delete'
            : confirmationAction === 'activate'
            ? 'activate'
            : 'deactivate'
        } this user?`}
        confirmLabel={
          confirmationAction === 'delete'
            ? 'Delete'
            : confirmationAction === 'activate'
            ? 'Activate'
            : 'Deactivate'
        }
        type={confirmationAction === 'delete' ? 'danger' : confirmationAction === 'activate' ? 'info' : 'warning'}
        onConfirm={confirmAction}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default UserList;