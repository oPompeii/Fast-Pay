import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCryptoPrice } from '../../hooks/useCryptoPrice';

interface CryptoPriceDisplayProps {
  symbol: string;
}

const CryptoPriceDisplay: React.FC<CryptoPriceDisplayProps> = ({ symbol }) => {
  const { prices, loading, error } = useCryptoPrice([symbol]);

  if (loading) {
    return (
      <div className="animate-pulse flex space-x-2">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !prices[symbol]) {
    return (
      <div className="text-sm text-gray-500">
        Price unavailable
      </div>
    );
  }

  const price = prices[symbol];
  const change24h = price.usd_24h_change;
  const isPositive = change24h >= 0;

  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium">${price.usd.toFixed(2)}</span>
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        {Math.abs(change24h).toFixed(2)}%
      </span>
    </div>
  );
};

export default CryptoPriceDisplay;