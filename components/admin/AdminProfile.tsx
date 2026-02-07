import React, { useState } from 'react';
import { User, Lock, Shield, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SecurityDashboard from '../dashboard/SecurityDashboard';

const AdminProfile: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'security' | 'activity'>('security');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Verify current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'ld.durval',
        password: currentPassword
      });

      if (authError) throw new Error('Senha atual incorreta');

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Log password change
      await supabase.rpc('log_security_event', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_event_type: 'admin_password_change',
        p_severity: 'info',
        p_details: {
          timestamp: new Date().toISOString()
        }
      });

      setSuccess('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <User className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Perfil do Administrador
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Shield className="w-5 h-5 mr-2" />
            Segurança
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`${
              activeTab === 'activity'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Activity className="w-5 h-5 mr-2" />
            Atividade
          </button>
        </nav>
      </div>

      {activeTab === 'security' ? (
        <div className="space-y-6">
          {/* Password Change Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Alterar Senha
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>

          {/* 2FA Section */}
          <SecurityDashboard />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Histórico de Atividades
            </h3>
            {/* Activity history will be implemented here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;