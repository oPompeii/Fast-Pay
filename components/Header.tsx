import React, { useState } from 'react';
import { Bell, Settings, User, LogOut, Copy, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Logo from '../Logo';
import LanguageSelector from './LanguageSelector';

// Rest of the file remains the same, just add LanguageSelector component
const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  // Existing code...

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
            <LanguageSelector />
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
            
            {/* Rest of the header code... */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;