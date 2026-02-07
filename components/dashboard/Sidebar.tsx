import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet, Users, BarChart2, CreditCard, Settings, 
  DollarSign, Bell, MessageSquare, Coins 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const menuItems = [
    { id: 'wallet', icon: Wallet, label: 'Wallet', path: '/dashboard' },
    { id: 'earn', icon: Coins, label: 'Earn/Trade', path: '/dashboard/earn' },
    { id: 'withdrawal', icon: DollarSign, label: 'Saque', path: '/dashboard/withdrawal' },
    { id: 'affiliates', icon: Users, label: 'Rede de Afiliados', path: '/dashboard/affiliates' },
    { id: 'reports', icon: BarChart2, label: 'Relatórios', path: '/dashboard/reports' },
    { id: 'packages', icon: CreditCard, label: 'Pacotes', path: '/dashboard/packages' },
    { id: 'support', icon: MessageSquare, label: 'Suporte', path: '/dashboard/support' },
    { id: 'notifications', icon: Bell, label: 'Notificações', path: '/dashboard/notifications' },
    { id: 'settings', icon: Settings, label: 'Configurações', path: '/dashboard/settings' }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Token':
        return 'bg-blue-100 text-blue-800';
      case 'Miner':
        return 'bg-purple-100 text-purple-800';
      case 'Master':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out z-50
        lg:translate-x-0 lg:static lg:h-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-800">Código de Indicação</p>
              <p className="text-lg font-bold text-emerald-900">{user?.referralCode?.replace('FAST-', '')}</p>
              <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(user?.level || '')}`}>
                Nível: {user?.level}
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600">Nível Atual</p>
              <p className={`text-lg font-bold ${getLevelColor(user?.level || '')}`}>{user?.level}</p>
              <Link
                to="/dashboard/packages"
                className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 inline-block"
              >
                Ver planos disponíveis →
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;