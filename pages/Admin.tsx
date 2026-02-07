import React, { useState } from 'react';
import { Shield, Users, Gift, BarChart2, HelpCircle, Settings, Bell } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import Loading from '../components/Loading';
import UserList from '../components/admin/UserList';
import CouponGenerator from '../components/admin/CouponGenerator';
import AdminProfile from '../components/admin/AdminProfile';
import SalesDashboard from '../components/admin/SalesDashboard';
import SupportMessages from '../components/admin/SupportMessages';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import MessageCenter from '../components/admin/MessageCenter';
import SecurityDashboard from '../components/dashboard/SecurityDashboard';

const Admin: React.FC = () => {
  const { isAdmin, loading: authLoading, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sales' | 'coupons' | 'support' | 'profile' | 'security' | 'messages'>('dashboard');

  if (authLoading) {
    return <Loading message="Verificando autenticação..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-emerald-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BarChart2 className="w-5 h-5 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="w-5 h-5 mr-2" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`${
                activeTab === 'sales'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BarChart2 className="w-5 h-5 mr-2" />
              Vendas
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`${
                activeTab === 'support'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Suporte
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`${
                activeTab === 'coupons'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Gift className="w-5 h-5 mr-2" />
              Cupons
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`${
                activeTab === 'messages'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Bell className="w-5 h-5 mr-2" />
              Mensagens
            </button>
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
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Settings className="w-5 h-5 mr-2" />
              Perfil
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' ? (
          <AdminDashboard />
        ) : activeTab === 'users' ? (
          <UserManagement />
        ) : activeTab === 'sales' ? (
          <SalesDashboard />
        ) : activeTab === 'support' ? (
          <SupportMessages />
        ) : activeTab === 'coupons' ? (
          <CouponGenerator />
        ) : activeTab === 'messages' ? (
          <MessageCenter />
        ) : activeTab === 'security' ? (
          <SecurityDashboard />
        ) : (
          <AdminProfile />
        )}
      </div>
    </div>
  );
};

export default Admin;