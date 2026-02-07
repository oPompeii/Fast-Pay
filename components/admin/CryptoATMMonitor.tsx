import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ATMStatus {
  id: string;
  location: string;
  city: string;
  status: 'active' | 'inactive' | 'maintenance';
  last_transaction: string;
  transaction_count: number;
  error_count: number;
  uptime_percentage: number;
}

const CryptoATMMonitor: React.FC = () => {
  const [atmStatuses, setAtmStatuses] = useState<ATMStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchATMStatuses();

    if (autoRefresh) {
      const interval = setInterval(fetchATMStatuses, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchATMStatuses = async () => {
    try {
      setLoading(true);
      const { data: atms, error: atmsError } = await supabase
        .from('crypto_atms')
        .select(`
          id,
          location,
          city,
          status,
          updated_at,
          last_sync_at
        `);

      if (atmsError) throw atmsError;

      // Get transaction stats for each ATM
      const atmStats = await Promise.all(
        atms.map(async (atm) => {
          const { data: logs } = await supabase
            .from('atm_usage_logs')
            .select('*')
            .eq('atm_id', atm.id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          const errorLogs = logs?.filter(log => log.status === 'failed') || [];
          const lastTransaction = logs?.[0]?.created_at;

          // Calculate uptime based on status history
          const { data: statusHistory } = await supabase
            .from('atm_status_history')
            .select('*')
            .eq('atm_id', atm.id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          const totalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const downtime = statusHistory?.reduce((acc, curr) => {
            if (curr.status === 'inactive' || curr.status === 'maintenance') {
              const start = new Date(curr.created_at).getTime();
              const end = curr.resolved_at ? new Date(curr.resolved_at).getTime() : Date.now();
              return acc + (end - start);
            }
            return acc;
          }, 0) || 0;

          const uptime = ((totalTime - downtime) / totalTime) * 100;

          return {
            ...atm,
            last_transaction: lastTransaction,
            transaction_count: logs?.length || 0,
            error_count: errorLogs.length,
            uptime_percentage: Math.round(uptime)
          };
        })
      );

      setAtmStatuses(atmStats);
    } catch (err) {
      console.error('Error fetching ATM statuses:', err);
      setError(err instanceof Error ? err.message : 'Error fetching ATM statuses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">ATM Monitoring</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-500">Auto-refresh</span>
          </label>
          <button
            onClick={fetchATMStatuses}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </button>
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

      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transactions (24h)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Errors (24h)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uptime
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Transaction
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {atmStatuses.map((atm) => (
              <tr key={atm.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {atm.location}
                    </div>
                    <div className="text-sm text-gray-500">
                      {atm.city}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(atm.status)}
                    <span className="ml-2 text-sm text-gray-900">
                      {atm.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {atm.transaction_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    atm.error_count === 0 ? 'bg-green-100 text-green-800' :
                    atm.error_count <= 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {atm.error_count}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          atm.uptime_percentage >= 99 ? 'bg-green-500' :
                          atm.uptime_percentage >= 95 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${atm.uptime_percentage}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {atm.uptime_percentage}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {atm.last_transaction ? (
                    new Date(atm.last_transaction).toLocaleString()
                  ) : (
                    'No transactions'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoATMMonitor;