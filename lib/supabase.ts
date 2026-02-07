import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      wallets (
        fastcoin_balance
      ),
      user_plans (
        plans (
          name,
          price,
          features
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchUserTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchAffiliateNetwork(userId: string) {
  const { data, error } = await supabase
    .from('affiliate_network')
    .select(`
      *,
      referred:referred_id (
        name,
        email
      )
    `)
    .eq('referrer_id', userId);

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function createWithdrawalRequest(userId: string, amount: number, method: string, details: any) {
  const { error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type: 'WITHDRAW',
      amount,
      status: 'PENDING',
      details
    }]);

  if (error) throw error;
}

export async function createSupportTicket(userId: string, subject: string, message: string) {
  const { error } = await supabase
    .from('tickets')
    .insert([{
      user_id: userId,
      subject,
      message,
      status: 'OPEN'
    }]);

  if (error) throw error;
}

// Add new function to process affiliate registration
export async function processAffiliateRegistration(userId: string, referralCode: string) {
  try {
    // Validate referral code format
    if (!isValidAffiliateCode(referralCode)) {
      throw new Error('Invalid referral code format');
    }

    // Get referrer from affiliate codes
    const { data: referrer, error: referrerError } = await supabase
      .from('affiliate_codes')
      .select('user_id')
      .eq('code', referralCode)
      .single();

    if (referrerError || !referrer) {
      throw new Error('Invalid referral code');
    }

    // Create level 1 connection
    const { error: level1Error } = await supabase
      .from('affiliate_network')
      .insert([{
        referrer_id: referrer.user_id,
        referred_id: userId,
        level: 1
      }]);

    if (level1Error) {
      throw level1Error;
    }

    // Find and create level 2 connection if exists
    const { data: parentReferrer } = await supabase
      .from('affiliate_network')
      .select('referrer_id')
      .eq('referred_id', referrer.user_id)
      .eq('level', 1)
      .single();

    if (parentReferrer) {
      await supabase
        .from('affiliate_network')
        .insert([{
          referrer_id: parentReferrer.referrer_id,
          referred_id: userId,
          level: 2
        }]);
    }

    // Create notification for referrer
    await supabase
      .from('notifications')
      .insert([{
        user_id: referrer.user_id,
        type: 'NEW_REFERRAL',
        title: 'Novo Afiliado',
        message: 'Um novo usuário se juntou à sua rede através do seu código de afiliado',
        read: false
      }]);

    return true;
  } catch (error) {
    console.error('Error processing affiliate registration:', error);
    throw error;
  }
}