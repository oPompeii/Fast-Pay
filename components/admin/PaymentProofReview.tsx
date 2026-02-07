import React, { useState } from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentProofReviewProps {
  proof: {
    id: string;
    user_id: string;
    package_id: string;
    package_type: string;
    amount: number;
    currency: string;
    proof_url: string;
    transaction_hash: string;
    created_at: string;
  };
  onReview: () => void;
}

const PACKAGE_FASTCOINS = {
  'token': 100,
  'miner': 300,
  'master': 1000
};

const PaymentProofReview: React.FC<PaymentProofReviewProps> = ({ proof, onReview }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async (approved: boolean) => {
    try {
      setLoading(true);
      setError(null);

      // Start a Supabase transaction
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Admin não autenticado');

      // 1. Get current user profile and wallet
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          level,
          wallet:wallets (
            id,
            fastcoin_balance
          )
        `)
        .eq('id', proof.user_id)
        .single();

      if (profileError) throw profileError;
      if (!profile || !profile.wallet) throw new Error('Perfil ou carteira não encontrados');

      // 2. Update payment proof status first
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .update({
          status: approved ? 'approved' : 'rejected',
          admin_notes: notes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', proof.id);

      if (proofError) throw proofError;

      if (approved) {
        // 3. Calculate new FastCoin balance
        const packageType = proof.package_id.split('-')[0].toLowerCase();
        const fastcoinsToAdd = PACKAGE_FASTCOINS[packageType as keyof typeof PACKAGE_FASTCOINS] || 0;
        const newBalance = profile.wallet.fastcoin_balance + fastcoinsToAdd;

        // 4. Update wallet balance
        const { error: walletError } = await supabase
          .from('wallets')
          .update({ fastcoin_balance: newBalance })
          .eq('id', profile.wallet.id);

        if (walletError) throw walletError;

        // 5. Update user's level
        const { error: levelError } = await supabase
          .from('profiles')
          .update({
            level: packageType.toUpperCase(),
            payment_proof_url: proof.proof_url
          })
          .eq('id', proof.user_id);

        if (levelError) throw levelError;

        // 6. Create a transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([{
            from_wallet_id: null, // System transaction
            to_wallet_id: profile.wallet.id,
            amount: fastcoinsToAdd,
            currency: 'FST2',
            status: 'completed',
            type: 'package_upgrade',
            description: `Package upgrade to ${packageType.toUpperCase()}`
          }]);

        if (transactionError) throw transactionError;

        // 7. Log the upgrade event
        const { error: logError } = await supabase
          .from('security_logs')
          .insert([{
            user_id: proof.user_id,
            event_type: 'package_upgrade',
            severity: 'info',
            details: {
              from_level: profile.level,
              to_level: packageType.toUpperCase(),
              fastcoins_added: fastcoinsToAdd,
              package_type: proof.package_type,
              approved_by: user.id
            }
          }]);

        if (logError) throw logError;
      }

      onReview();
    } catch (err) {
      console.error('Error reviewing payment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar revisão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Revisar Pagamento
            </h3>
            <p className="text-sm text-gray-500">
              Pacote: {proof.package_id} ({proof.package_type})
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">
              {proof.amount} {proof.currency}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(proof.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {proof.proof_url && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comprovante
            </label>
            <div className="mt-1">
              <a
                href={proof.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver Comprovante
              </a>
            </div>
          </div>
        )}

        {proof.transaction_hash && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hash da Transação
            </label>
            <div className="mt-1 font-mono text-sm break-all">
              {proof.transaction_hash}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            FastCoins a Adicionar
          </label>
          <div className="mt-1 bg-emerald-50 p-3 rounded-md">
            <p className="text-sm text-emerald-700">
              {PACKAGE_FASTCOINS[proof.package_id.split('-')[0].toLowerCase() as keyof typeof PACKAGE_FASTCOINS]} FST2
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            rows={3}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleReview(false)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <X className="h-4 w-4 mr-2" />
            Rejeitar
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Check className="h-4 w-4 mr-2" />
            Aprovar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofReview;