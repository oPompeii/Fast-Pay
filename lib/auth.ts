import { supabase } from './supabase';
import { useRateLimit } from '../hooks/useRateLimit';

export const MAX_LOGIN_ATTEMPTS = 5;
export const COOLDOWN_PERIOD = 15 * 60 * 1000; // 15 minutes

export async function adminLogin(password: string) {
  try {
    // Check rate limiting
    const rateLimiter = useRateLimit('admin_login', {
      maxAttempts: MAX_LOGIN_ATTEMPTS,
      cooldownPeriod: COOLDOWN_PERIOD
    });

    if (!rateLimiter.attempt()) {
      throw new Error("Too many attempts. Please try again later.");
    }

    // Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'adminfast',
      password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login error');

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) throw new Error('Profile not found');
    if (profile.role !== 'admin' || !profile.is_active) {
      throw new Error('Unauthorized access');
    }

    return authData;
  } catch (error) {
    throw error;
  }
}

export async function verifySession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    return profile?.role === 'admin' && profile.is_active;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}