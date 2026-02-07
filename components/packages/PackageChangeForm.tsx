import React, { useState, useEffect } from 'react';
import { Package, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Plan } from '../../types';
import CryptoPaymentForm from '../payments/CryptoPaymentForm';
import PaymentProofUpload from '../payments/PaymentProofUpload';
import ConfirmationDialog from '../ConfirmationDialog';
import { useToast } from '../../hooks/useToast';
import useAuthStore from '../../store/authStore';

interface PackageChangeFormProps {
  currentPlan: Plan;
  targetPlan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PackageChangeForm: React.FC<PackageChangeFormProps> = ({
  currentPlan,
  targetPlan,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'confirm' | 'payment' | 'proof'>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const { showToast } = useToast();

  const isUpgrade = targetPlan.price > currentPlan.price;
  const isTypeChange = targetPlan.type !== currentPlan.type;
  const isMonthlyDowngrade = !isUpgrade && currentPlan.type === 'monthly' && targetPlan.type === 'monthly';

  useEffect(() => {
    calculateCost();
  }, []);

  const calculateCost = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: cost, error: costError } = await supabase.rpc(
        'calculate_package_change_cost',
        {
          p_from_package_name: currentPlan.level,
          p_to_package_name: targetPlan.level,
          p_from_type: currentPlan.type,
          p_to_type: targetPlan.type
        }
      );

      if (costError) throw costError;
      setChangeAmount(cost);
    } catch (err) {
      console.error('Error calculating cost:', err);
      setError('Erro ao calcular custo da mudança');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isMonthlyDowngrade) {
        // Handle automatic downgrade for monthly plans
        const { data: result, error: downgradeError } = await supabase.rpc(
          'auto_downgrade_monthly_plan',
          {
            p_user_id: user?.id,
            p_from_package: currentPlan.level,
            p_to_package: targetPlan.level
          }
        );

        if (downgradeError) throw downgradeError;

        showToast('success', 'Downgrade realizado com sucesso!');
        onSuccess();
        return;
      }

      // Create payment record for upgrades
      const { data: payment, error: paymentError } = await supabase
        .from('package_payments')
        .insert({
          user_id: user?.id,
          package_name: targetPlan.level,
          package_type: targetPlan.type,
          amount: changeAmount,
          currency: 'USD'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      setPaymentId(payment.id);
      
      if (changeAmount > 0) {
        setStep('payment');
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error('Error initiating package change:', err);
      setError(err instanceof Error ? err.message : 'Erro ao iniciar mudança de pacote');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handlePaymentComplete = async (txHash: string, currency: string) => {
    if (!paymentId) return;
    
    try {
      const { error: updateError } = await supabase
        .from('package_payments')
        .update({
          currency,
          transaction_hash: txHash
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      setStep('proof');
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pagamento');
    }
  };

  const handleProofUpload = async (proofUrl: string) => {
    if (!paymentId) return;

    try {
      const { error: updateError } = await supabase
        .from('package_payments')
        .update({ proof_url: proofUrl })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      showToast('success', 'Solicitação enviada com sucesso! Em até 6 horas seu upgrade será processado.');
      onSuccess();
    } catch (err) {
      console.error('Error updating proof:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar comprovante');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-emerald-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            {isUpgrade ? 'Upgrade de Pacote' : 'Downgrade de Pacote'}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">Pacote Atual</p>
              <p className="text-lg font-medium text-gray-900">{currentPlan.name}</p>
              <p className="text-sm text-gray-500">{currentPlan.type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Novo Pacote</p>
              <p className="text-lg font-medium text-gray-900">{targetPlan.name}</p>
              <p className="text-sm text-gray-500">{targetPlan.type}</p>
            </div>
          </div>

          {isTypeChange && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Mudança de Tipo de Pacote
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Você está mudando de um plano {currentPlan.type} para {targetPlan.type}.
                    {isUpgrade ? ' O valor total do novo plano será cobrado.' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Valor a Pagar</p>
            <p className="text-2xl font-bold text-gray-900">
              ${changeAmount.toFixed(2)} USD
            </p>
            {changeAmount === 0 && (
              <p className="text-sm text-emerald-600">
                Não há custo para downgrade de pacote mensal
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {isUpgrade ? (
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Fazer Downgrade
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && changeAmount > 0 && (
        <CryptoPaymentForm
          selectedPlan={targetPlan}
          onSuccess={handlePaymentComplete}
          onCancel={() => setStep('confirm')}
        />
      )}

      {step === 'proof' && (
        <PaymentProofUpload
          onUploadComplete={handleProofUpload}
          onCancel={() => setStep('payment')}
        />
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        title={`Confirmar ${isUpgrade ? 'Upgrade' : 'Downgrade'}`}
        message={`Tem certeza que deseja ${isUpgrade ? 'fazer upgrade' : 'fazer downgrade'} do seu pacote? ${
          changeAmount > 0 ? `Será necessário pagar $${changeAmount.toFixed(2)} USD.` : ''
        }`}
        confirmLabel={isUpgrade ? 'Fazer Upgrade' : 'Fazer Downgrade'}
        type={isUpgrade ? 'info' : 'warning'}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default PackageChangeForm;