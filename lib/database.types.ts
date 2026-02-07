export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          birth_date: string | null
          referral_code: string | null
          two_factor_enabled: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          birth_date?: string | null
          referral_code?: string | null
          two_factor_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          birth_date?: string | null
          referral_code?: string | null
          two_factor_enabled?: boolean
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          fastcoin_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fastcoin_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fastcoin_balance?: number
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'
          amount: number
          status: 'PENDING' | 'COMPLETED' | 'FAILED'
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'
          amount: number
          status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'
          amount?: number
          status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          details?: Json
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      affiliate_network: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          level: number
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          level?: number
          created_at?: string
        }
      }
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          start_date: string
          end_date: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          start_date?: string
          end_date?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          start_date?: string
          end_date?: string | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}