import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, AlertTriangle } from 'lucide-react';
import { Plan } from '../../types';

interface CryptoPaymentFormProps {
  onSuccess: (txHash: string, currency: string) => void;
  onCancel: () => void;
  selectedPlan: Plan;
}

const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({
  onSuccess,
  onCancel,
  selectedPlan
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cryptoAddresses = {
    BTC: 'bc1qqq03kw4ps7e0gpr9s3txjxjk3vlln92j7z0n9z',
    ETH: '0x1Bed25574e624ddf2F340d55560BD208F089c8D4',
    SOL: 'GYfMyiCwnBGLSvGVHtMcXxv5bjxTm5Ukrk1XwxSTx5Xw'
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!txHash) {
        throw new Error('Por favor, insira o hash da transação');
      }

      // Basic hash format validation
      if (!/^[0-9a-fA-F]{64}$/.test(txHash)) {
        throw new Error('Hash da transação inválido');
      }

      onSuccess(txHash, selectedCrypto);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Pagamento em Crypto
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Selecione a Moeda
        </label>
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="SOL">Solana (SOL)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Valor do Plano
        </label>
        <div className="mt-1 p-3 bg-gray-50 rounded-md">
          <p className="text-lg font-medium text-gray-900">
            ${selectedPlan.price.toFixed(2)} USD
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-center mb-4">
          <QRCodeCanvas
            value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
            size={200}
            level="H"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
            readOnly
            className="block w-full pr-10 py-2 text-sm border-gray-300 rounded-md bg-gray-50"
          />
          <button
            onClick={handleCopyAddress}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            <Copy className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        {copied && (
          <p className="mt-1 text-sm text-emerald-600">
            Endereço copiado!
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Hash da Transação
        </label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Cole o hash da transação aqui"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
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

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {loading ? 'Processando...' : 'Confirmar Pagamento'}
        </button>
      </div>
    </div>
  );
};

export default CryptoPaymentForm;