import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { CryptoPaymentService } from '../../services/cryptoPaymentService';

interface CryptoPaymentStatusProps {
  paymentId: string;
  onSuccess: () => void;
}

const CryptoPaymentStatus: React.FC<CryptoPaymentStatusProps> = ({
  paymentId,
  onSuccess
}) => {
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const payment = await CryptoPaymentService.getPaymentStatus(paymentId);
        setStatus(payment.status);

        if (payment.status === 'completed') {
          onSuccess();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error checking payment status');
      } finally {
        setLoading(false);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [paymentId, onSuccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Clock className="animate-spin h-5 w-5 text-emerald-600 mr-2" />
        <span className="text-sm text-gray-600">Checking status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-md ${
      status === 'completed' 
        ? 'bg-green-50' 
        : status === 'pending'
        ? 'bg-yellow-50'
        : 'bg-red-50'
    }`}>
      <div className="flex items-center">
        {status === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : status === 'pending' ? (
          <Clock className="h-5 w-5 text-yellow-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        )}
        <span className="ml-2 text-sm font-medium">
          {status === 'completed'
            ? 'Payment confirmed!'
            : status === 'pending'
            ? 'Waiting for payment confirmation...'
            : 'Payment expired or rejected'}
        </span>
      </div>
    </div>
  );
};

export default CryptoPaymentStatus;