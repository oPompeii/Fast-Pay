import React, { useState } from 'react';
import { Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';
import { useToast } from '../../hooks/useToast';

interface PackageManagerProps {
  userId: string;
  currentLevel: string;
  currentType: string;
  onUpdate: () => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({
  userId,
  currentLevel,
  currentType,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState({
    level: '',
    type: currentType
  });
  const { showToast } = useToast();

  const handlePackageChange = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update user's package directly since it's an admin action
      const { error: updateError } = await supabase.rpc(
        'update_user_package',
        {
          p_user_id: userId,
          p_new_level: selectedPackage.level,
          p_package_type: selectedPackage.type
        }
      );

      if (updateError) throw updateError;

      showToast('success', 'Pacote atualizado com sucesso!');
      setShowConfirm(false);
      onUpdate();
    } catch (err) {
      console.error('Error changing package:', err);
      setError(err instanceof Error ? err.message : 'Erro ao alterar pacote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-emerald-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Gerenciar Pacote
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Atual:</span>
          <span className="text-sm font-medium text-gray-900">
            {currentLevel} ({currentType})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Novo Pacote
          </label>
          <select
            value={selectedPackage.level}
            onChange={(e) => setSelectedPackage(prev => ({ ...prev, level: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Selecione um pacote</option>
            <option value="Token">Token</option>
            <option value="Miner">Miner</option>
            <option value="Master">Master</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={selectedPackage.type}
            onChange={(e) => setSelectedPackage(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="monthly">Mensal</option>
            <option value="lifetime">Vitalício</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || !selectedPackage.level}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {selectedPackage.level > currentLevel ? (
            <ArrowUpRight className="w-4 h-4 mr-2" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Processando...' : 'Alterar Pacote'}
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Confirmar Alteração"
        message={`Tem certeza que deseja alterar o pacote para ${selectedPackage.level} (${selectedPackage.type})?`}
        confirmLabel="Confirmar"
        type="warning"
        onConfirm={handlePackageChange}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default PackageManager;