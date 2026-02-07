import React, { useState } from 'react';
import { Package, Upload, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Plan } from '../../types';
import CryptoPaymentForm from './CryptoPaymentForm';
import PaymentProofUpload from './PaymentProofUpload';

interface PackageUpgradeFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PackageUpgradeForm: React.FC<PackageUpgradeFormProps> = ({
  plan,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'payment' | 'proof'>('payment');
  const [txHash, setTxHash] = useState('');
  const [currency, setCurrency] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentComplete = async (hash: string, selectedCurrency: string) => {
    setTxHash(hash);
    setCurrency(selectedCurrency);
    setStep('proof');
  };

  const handleProofUpload = async (proofUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create payment proof record
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .insert([{
          package_id: plan.id,
          package_type: plan.type,
          amount: plan.price,
          currency,
          transaction_hash: txHash,
          proof_url: proofUrl
        }]);

      if (proofError) throw proofError;

      onSuccess();
    } catch (err) {
      console.error('Error submitting proof:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar comprovante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-emerald-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Upgrade para {plan.name}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      {step === 'payment' ? (
        <CryptoPaymentForm
          selectedPlan={plan}
          onSuccess={handlePaymentComplete}
          onCancel={onCancel}
        />
      ) : (
        <PaymentProofUpload
          onUploadComplete={handleProofUpload}
          onCancel={() => setStep('payment')}
        />
      )}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PackageUpgradeForm;