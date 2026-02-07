import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { supabase } from '../lib/supabase';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('No session');
        }

        // Verify admin profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, is_active')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Profile not found');
        }

        if (profile.role !== 'admin' || !profile.is_active || profile.email !== 'adminfast') {
          throw new Error('Unauthorized');
        }

        setSessionChecked(true);
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('adminAuth');
        navigate('/admin-login', { replace: true });
      }
    };

    // Check session immediately
    checkSession();

    // Then check every minute
    const interval = setInterval(checkSession, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [navigate]);

  if (loading || !sessionChecked) {
    return <Loading message="Verificando autenticação..." />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;