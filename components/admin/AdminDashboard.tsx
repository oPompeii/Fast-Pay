import React, { useState, useEffect } from 'react';
import { Users, Network, TrendingUp, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNetworks: number;
  usersByLevel: {
    Token: number;
    Miner: number;
    Master: number;
  };
  networkStats: {
    totalVolume: number;
    averageSize: number;
    largestNetwork: number;
  };
  recentActivity: {
    newUsers: number;
    newNetworks: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNetworks: 0,
    usersByLevel: {
      Token: 0,
      Miner: 0,
      Master: 0
    },
    networkStats: {
      totalVolume: 0,
      averageSize: 0,
      largestNetwork: 0
    },
    recentActivity: {
      newUsers: 0,
      newNetworks: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('dashboard_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total and active users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, is_active, level, created_at')
        .neq('role', 'admin');

      if (usersError) throw usersError;

      // Calculate user statistics
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(user => user.is_active).length || 0;
      
      // Calculate users by level
      const usersByLevel = {
        Token: usersData?.filter(user => user.level === 'Token').length || 0,
        Miner: usersData?.filter(user => user.level === 'Miner').length || 0,
        Master: usersData?.filter(user => user.level === 'Master').length || 0
      };

      // Get network statistics
      const { data: networkData, error: networkError } = await supabase
        .from('referral_network')
        .select('*');

      if (networkError) throw networkError;

      const totalNetworks = new Set(networkData?.map(n => n.upline_id)).size;
      const networkSizes = new Map<string, number>();
      
      networkData?.forEach(network => {
        const currentSize = networkSizes.get(network.upline_id) || 0;
        networkSizes.set(network.upline_id, currentSize + 1);
      });

      const largestNetwork = Math.max(...Array.from(networkSizes.values()), 0);
      const averageSize = totalNetworks ? 
        Array.from(networkSizes.values()).reduce((a, b) => a + b, 0) / totalNetworks : 
        0;

      // Calculate recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const newUsers = usersData?.filter(
        user => new Date(user.created_at) > yesterday
      ).length || 0;

      const newNetworks = networkData?.filter(
        network => new Date(network.created_at) > yesterday
      ).length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalNetworks,
        usersByLevel,
        networkStats: {
          totalVolume: networkData?.length || 0,
          averageSize: Math.round(averageSize * 10) / 10,
          largestNetwork
        },
        recentActivity: {
          newUsers,
          newNetworks
        }
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Error fetching statistics');
    } finally {
      setLoading(false);
    }
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-sm text-emerald-600">
            {stats.activeUsers} active users
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Networks</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Network className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalNetworks}</p>
          <p className="text-sm text-blue-600">
            Avg. size: {stats.networkStats.averageSize}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">User Levels</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Token</span>
              <span className="text-sm font-medium">{stats.usersByLevel.Token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Miner</span>
              <span className="text-sm font-medium">{stats.usersByLevel.Miner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Master</span>
              <span className="text-sm font-medium">{stats.usersByLevel.Master}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">New Users (24h)</span>
              <span className="text-sm font-medium">{stats.recentActivity.newUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">New Networks (24h)</span>
              <span className="text-sm font-medium">{stats.recentActivity.newNetworks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Network Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900">{stats.networkStats.totalVolume}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Average Network Size</p>
            <p className="text-2xl font-bold text-gray-900">{stats.networkStats.averageSize}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Largest Network</p>
            <p className="text-2xl font-bold text-gray-900">{stats.networkStats.largestNetwork}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;