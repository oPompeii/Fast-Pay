import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import useAuthStore from '../store/authStore';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  feature: 'withdrawal' | 'staking' | 'trading' | 'referral';
}

const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({ children, feature }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Check if user is in demo mode
  const isDemo = user?.registration_status === 'demo';

  if (isDemo) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center p-4">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Este recurso está disponível apenas para usuários ativos
            </p>
            <button
              onClick={() => navigate('/dashboard/packages')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Escolher Pacote
            </button>
          </div>
        </div>
        <div className="filter blur-sm">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedFeature;