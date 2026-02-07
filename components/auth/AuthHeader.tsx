import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const AuthHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link
            to="/"
            className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Voltar para Home
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;