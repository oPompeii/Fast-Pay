import React, { useState } from 'react';
import { Bell, Settings, User, LogOut, Copy, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Logo from '../Logo';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    try {
      setShowDropdown(false);
      await logout();
    } catch (error) {
      console.warn('Error during logout:', error);
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 lg:hidden hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <Logo className="h-8" />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.referralCode && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-500">{user.referralCode}</span>
                <button
                  onClick={copyReferralCode}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Copiar código"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                {copied && (
                  <span className="absolute top-16 right-0 bg-black text-white text-xs px-2 py-1 rounded">
                    Código copiado!
                  </span>
                )}
              </div>
            )}
            
            <Link to="/dashboard/notifications" className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </Link>
            
            <Link to="/dashboard/settings" className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Usuário'}
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(user?.level || '')}`}>
                        Nível: {user?.level}
                      </div>
                    </div>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Configurações
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;