import React, { useState, useEffect } from 'react';
import { MapPin, Plus, AlertTriangle, Activity, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CryptoATM {
  id: string;
  location: string;
  city: string;
  country: string;
  supported_currencies: string[];
  operating_hours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  status: 'active' | 'inactive' | 'maintenance';
  transaction_types: string[];
  latitude: number;
  longitude: number;
}

const CryptoATMManager: React.FC = () => {
  const [atms, setAtms] = useState<CryptoATM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedATM, setSelectedATM] = useState<CryptoATM | null>(null);
  const [formData, setFormData] = useState<Partial<CryptoATM>>({
    supported_currencies: ['FST2'],
    transaction_types: ['buy', 'sell', 'withdrawal'],
    status: 'active'
  });

  useEffect(() => {
    fetchATMs();
  }, []);

  const fetchATMs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crypto_atms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAtms(data || []);
    } catch (err) {
      console.error('Error fetching ATMs:', err);
      setError(err instanceof Error ? err.message : 'Error fetching ATMs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('crypto_atms')
        .insert([formData]);

      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        supported_currencies: ['FST2'],
        transaction_types: ['buy', 'sell', 'withdrawal'],
        status: 'active'
      });
      fetchATMs();
    } catch (err) {
      console.error('Error adding ATM:', err);
      setError(err instanceof Error ? err.message : 'Error adding ATM');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (atmId: string, newStatus: 'active' | 'inactive' | 'maintenance') => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('update_atm_status', {
        p_atm_id: atmId,
        p_status: newStatus,
        p_notify_users: true
      });

      if (error) throw error;
      fetchATMs();
    } catch (err) {
      console.error('Error updating ATM status:', err);
      setError(err instanceof Error ? err.message : 'Error updating ATM status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <MapPin className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Caixas Eletrônicos FastPay
          </h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar ATM
        </button>
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

      {/* ATM List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : atms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhum ATM encontrado
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {atms.map((atm) => (
              <li key={atm.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MapPin className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {atm.location}
                        </p>
                        <p className="text-sm text-gray-500">
                          {atm.city}, {atm.country}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            atm.status === 'active' ? 'bg-green-100 text-green-800' :
                            atm.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {atm.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {atm.supported_currencies.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleStatusChange(atm.id, 'maintenance')}
                      className="p-2 text-gray-400 hover:text-gray-500"
                      title="Set Maintenance"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(atm.id, atm.status === 'active' ? 'inactive' : 'active')}
                      className={`p-2 ${
                        atm.status === 'active' ? 'text-green-400 hover:text-green-500' : 'text-red-400 hover:text-red-500'
                      }`}
                      title={atm.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      <Activity className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add ATM Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adicionar Novo ATM
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CryptoATM['status'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Horário de Funcionamento
                </label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 capitalize">{day}</p>
                      <div className="flex space-x-2">
                        <input
                          type="time"
                          onChange={(e) => setFormData({
                            ...formData,
                            operating_hours: {
                              ...formData.operating_hours,
                              [day]: {
                                ...formData.operating_hours?.[day],
                                open: e.target.value
                              }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          required
                        />
                        <input
                          type="time"
                          onChange={(e) => setFormData({
                            ...formData,
                            operating_hours: {
                              ...formData.operating_hours,
                              [day]: {
                                ...formData.operating_hours?.[day],
                                close: e.target.value
                              }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoATMManager;