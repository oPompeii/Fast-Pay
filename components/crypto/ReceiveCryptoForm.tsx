import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy } from 'lucide-react';

interface ReceiveCryptoFormProps {
  selectedCrypto: string;
  address: string;
  onCopy: (address: string) => void;
  onClose: () => void;
}

const ReceiveCryptoForm: React.FC<ReceiveCryptoFormProps> = ({
  selectedCrypto,
  address,
  onCopy,
  onClose
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Receber {selectedCrypto}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <QRCodeCanvas
            value={address}
            size={200}
            level="H"
            className="mb-4"
          />
          <p className="text-sm text-gray-500">
            Escaneie o código QR para copiar o endereço
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Seu Endereço {selectedCrypto}
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              value={address}
              readOnly
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => onCopy(address)}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-md p-4">
          <p className="text-sm text-yellow-700">
            Importante: Envie apenas {selectedCrypto} para este endereço. Enviar outros ativos pode resultar em perda permanente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiveCryptoForm;