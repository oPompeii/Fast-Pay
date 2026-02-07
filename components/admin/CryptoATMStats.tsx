import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ATMStats {
  total_atms: number;
  active_atms: number;
  maintenance_atms: number;
  total_transactions: number;
  total_volume: number;
  unique_users: number;
  most_active_city: string;
  most_used_atm: {
    location: string;
    transactions: number;
  };
}

const CryptoATMStats: React.FC = () => {
  const [stats, setStats] = useState<ATMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atm_usage_logs')
        .select(`
          *,
          atm:crypto_atms(
            location,
            city,
            status
          )
        `)
        .gte('created_at', getTimeRangeDate());

      if (error) throw error;

      // Calculate statistics
      const stats: ATMStats = {
        total_atms: 0,
        active_atms: 0,
        maintenance_atms: 0,
        total_transactions: data?.length || 0,
        total_volume: data?.reduce((sum, tx) => sum + tx.amount, 0) || 0,
        unique_users: new Set(data?.map(tx => tx.user_id)).size,
        most_active_city: '',
        most_used_atm: {
          location: '',
          transactions: 0
        }
      };

      // Get ATM counts
      const { data: atmData } = await supabase
        .from('crypto_atms')
        .select('status, city')
        .order('created_at', { ascending: false });

      if (atmData) {
        stats.total_atms = atmData.length;
        stats.active_atms = atmData.filter(atm => atm.status === 'active').length;
        stats.maintenance_atms = atmData.filter(atm => atm.status === 'maintenance').length;

        // Calculate most active city
        const cityTransactions = atmData.reduce((acc: {[key: string]: number}, atm) => {
          acc[atm.city] = (acc[atm.city] || 0) + 1;
          return acc;
        }, {});

        stats.most_active_city = Object.entries(cityTransactions)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
      }

      // Calculate most used ATM
      if (data) {
        const atmUsage = data.reduce((acc: {[key: string]: number}, tx) => {
          const atmId = tx.atm_id;
          acc[atmId] = (acc[atmId] || 0) + 1;
          return acc;
        }, {});

        const mostUsedAtmId = Object.entries(atmUsage)
          .sort(([,a], [,b]) => b - a)[0]?.[0];

        if (mostUsedAtmId) {
          const mostUsedAtm = data.find(tx => tx.atm_id === mostUsedAtmId)?.atm;
          if (mostUsedAtm) {
            stats.most_used_atm = {
              location: mostUsedAtm.location,
              transactions: atmUsage[mostUsedAtmId]
            };
          }
        }
      }

      setStats(stats);
    } catch (err) {
      console.error('Error fetching ATM stats:', err);
      setError(err instanceof Error ? err.message : 'Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeDate = () => {
    const date = new Date();
    switch (timeRange) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      default:
        date.setDate(date.getDate() - 1);
    }
    return date.toISOString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">ATM Statistics</h2>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">ATMs Status</h3>
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-sm font-medium text-gray-900">{stats?.total_atms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Active</span>
              <span className="text-sm font-medium text-green-600">{stats?.active_atms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Maintenance</span>
              <span className="text-sm font-medium text-yellow-600">{stats?.maintenance_atms}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.total_transactions}
          </p>
          <p className="text-sm text-gray-500">
            Volume: ${stats?.total_volume.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Users</h3>
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.unique_users}
          </p>
          <p className="text-sm text-gray-500">
            Unique users in period
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Most Active</h3>
            <MapPin className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="mt-2 space-y-2">
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="text-lg font-medium text-gray-900">{stats?.most_active_city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ATM</p>
              <p className="text-sm font-medium text-gray-900">{stats?.most_used_atm.location}</p>
              <p className="text-xs text-gray-500">{stats?.most_used_atm.transactions} transactions</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoATMStats;