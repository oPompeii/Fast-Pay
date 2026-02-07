import React, { useState, useEffect } from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';

interface WalletConnectorProps {
  onConnect: (address: string, provider: string) => void;
  onDisconnect: () => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, onDisconnect }) => {
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);
  const [isTrustWalletAvailable, setIsTrustWalletAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null);

  useEffect(() => {
    // Check for Phantom Wallet
    if (window.phantom?.solana) {
      setIsPhantomAvailable(true);
    }

    // Check for Trust Wallet
    if (window.ethereum?.isTrust) {
      setIsTrustWalletAvailable(true);
    }
  }, []);

  const connectPhantom = async () => {
    try {
      const resp = await window.phantom?.solana.connect();
      const address = resp.publicKey.toString();
      setConnectedAddress(address);
      setConnectedProvider('phantom');
      onConnect(address, 'phantom');
    } catch (err) {
      console.error('Error connecting to Phantom:', err);
      setError('Error connecting to Phantom wallet');
    }
  };

  const connectTrustWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const address = accounts[0];
      setConnectedAddress(address);
      setConnectedProvider('trust');
      onConnect(address, 'trust');
    } catch (err) {
      console.error('Error connecting to Trust Wallet:', err);
      setError('Error connecting to Trust Wallet');
    }
  };

  const disconnectWallet = () => {
    setConnectedAddress(null);
    setConnectedProvider(null);
    onDisconnect();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Connect Wallet
        </h3>
        <Wallet className="h-6 w-6 text-emerald-600" />
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {connectedAddress ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Connected Wallet</p>
            <p className="mt-1 text-sm font-mono break-all">
              {connectedAddress}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              via {connectedProvider === 'phantom' ? 'Phantom' : 'Trust Wallet'}
            </p>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isPhantomAvailable && (
            <button
              onClick={connectPhantom}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Connect Phantom
            </button>
          )}

          {isTrustWalletAvailable && (
            <button
              onClick={connectTrustWallet}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Connect Trust Wallet
            </button>
          )}

          {!isPhantomAvailable && !isTrustWalletAvailable && (
            <div className="text-center text-gray-500">
              <p>No supported wallets found.</p>
              <div className="mt-4 space-y-2">
                <a 
                  href="https://phantom.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-purple-600 hover:text-purple-700"
                >
                  Install Phantom Wallet
                </a>
                <a 
                  href="https://trustwallet.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  Install Trust Wallet
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;