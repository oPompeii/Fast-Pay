import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SecurityAlerts from '../SecurityAlerts';
import useAuthStore from '../../store/authStore';
import { AlertTriangle } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Show demo mode banner if user is in demo mode
  const showDemoBanner = user?.registration_status === 'demo';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:ml-64">
          {showDemoBanner && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Você está no modo demonstração. Para acessar todos os recursos, 
                    <button
                      onClick={() => navigate('/dashboard/packages')}
                      className="ml-1 font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      escolha um pacote
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
          <SecurityAlerts />
          <div className="mt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;