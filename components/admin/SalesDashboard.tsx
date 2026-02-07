import React, { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SalesData {
  packageType: string;
  currency: string;
  amount: number;
  count: number;
}

interface MonthlySales {
  month: string;
  total: number;
  packages: {
    [key: string]: number;
  };
}

const SalesDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [packageSales, setPackageSales] = useState<{
    [key: string]: {
      [currency: string]: SalesData;
    };
  }>({});

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all crypto payments
        const { data: payments, error: paymentsError } = await supabase
          .from('crypto_payments')
          .select(`
            id,
            plan_id,
            currency,
            amount,
            status,
            created_at
          `)
          .eq('status', 'completed');

        if (paymentsError) throw paymentsError;

        // Process sales data
        const salesByPackage: {
          [key: string]: {
            [currency: string]: SalesData;
          };
        } = {};

        let total = 0;
        const monthlyData: { [key: string]: MonthlySales } = {};

        payments?.forEach(payment => {
          const packageType = payment.plan_id.split('-')[0]; // e.g., "token" from "token-monthly"
          const month = new Date(payment.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });

          // Update package sales
          if (!salesByPackage[packageType]) {
            salesByPackage[packageType] = {};
          }
          if (!salesByPackage[packageType][payment.currency]) {
            salesByPackage[packageType][payment.currency] = {
              packageType,
              currency: payment.currency,
              amount: 0,
              count: 0
            };
          }

          salesByPackage[packageType][payment.currency].amount += payment.amount;
          salesByPackage[packageType][payment.currency].count += 1;

          // Update monthly data
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              total: 0,
              packages: {}
            };
          }
          monthlyData[month].total += payment.amount;
          if (!monthlyData[month].packages[packageType]) {
            monthlyData[month].packages[packageType] = 0;
          }
          monthlyData[month].packages[packageType] += payment.amount;

          total += payment.amount;
        });

        setTotalRevenue(total);
        setPackageSales(salesByPackage);
        setMonthlySales(Object.values(monthlyData).sort((a, b) => 
          new Date(b.month).getTime() - new Date(a.month).getTime()
        ));

      } catch (err) {
        console.error('Error fetching sales data:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados de vendas');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();

    // Subscribe to payment updates
    const subscription = supabase
      .channel('payment_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_payments'
        },
        () => fetchSalesData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Dashboard de Vendas
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Receita Total</h3>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        {Object.entries(packageSales).map(([packageType, currencies]) => {
          const totalSales = Object.values(currencies).reduce((sum, data) => sum + data.count, 0);
          const totalAmount = Object.values(currencies).reduce((sum, data) => sum + data.amount, 0);
          
          return (
            <div key={packageType} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Pacote {packageType.charAt(0).toUpperCase() + packageType.slice(1)}
                </h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalSales}</p>
              <p className="text-sm text-gray-500">${totalAmount.toFixed(2)}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Vendas Mensais</h3>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-gray-500">Últimos 12 meses</span>
          </div>
        </div>

        <div className="space-y-4">
          {monthlySales.map(monthData => (
            <div key={monthData.month} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">{monthData.month}</span>
                <span className="text-sm font-medium text-emerald-600">
                  ${monthData.total.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(monthData.packages).map(([pkg, amount]) => (
                  <div key={pkg} className="bg-gray-50 rounded p-2">
                    <span className="text-xs text-gray-500">{pkg}</span>
                    <p className="text-sm font-medium">${amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales by Currency */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Vendas por Moeda</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pacote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moeda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(packageSales).map(([packageType, currencies]) =>
                Object.values(currencies).map((data, index) => (
                  <tr key={`${packageType}-${data.currency}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {packageType.charAt(0).toUpperCase() + packageType.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{data.currency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                      ${data.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;