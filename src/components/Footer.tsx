import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Copy } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-navy-800">
      {/* Partners Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h3 className="text-center text-xl font-bold mb-8">Parceiros Oficiais</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-center">
            Binance
          </a>
          <a href="https://gate.io" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-center">
            Gate.io
          </a>
          <a href="https://www.ledger.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-center">
            Ledger
          </a>
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-center">
            CoinGecko
          </a>
          <a href="https://coinmarketcap.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-center">
            CoinMarketCap
          </a>
          <a href="https://generalbytes.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-center">
            GeneralBytes
          </a>
        </div>
      </div>

      {/* ATM Locators Section */}
      <div className="border-t border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h3 className="text-center text-xl font-bold mb-6">Localizadores de ATM FastCoin</h3>
          <div className="flex justify-center gap-8">
            <a href="#" className="text-emerald-500 hover:text-emerald-400">
              CoinATMRadar
            </a>
            <a href="#" className="text-emerald-500 hover:text-emerald-400">
              Coinhub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-center md:text-left">
              FastPay © 2025 - Todos os Direitos Reservados
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex gap-4">
                <Link to="/tutorial" className="text-gray-400 hover:text-emerald-500 flex items-center gap-1">
                  <Book size={16} />
                  Tutorial
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white">
                  Termos e Privacidade
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/admin/login" className="text-gray-400 hover:text-white">
                  Gerência
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;