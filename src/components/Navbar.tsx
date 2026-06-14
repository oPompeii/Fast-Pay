import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Gift, HelpCircle } from 'lucide-react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-navy-800 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-emerald-500">Fast</span>Pay
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white">
                Entrar
              </Link>
              <Link to="/register" className="text-emerald-500 hover:text-emerald-400">
                Criar Conta
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-64 bg-navy-800 p-6 transform transition-transform duration-200">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold">Menu</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-navy-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={20} />
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={20} />
                    Criar Conta
                  </Link>
                  <Link
                    to="/packages"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-navy-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Gift size={20} />
                    Pacotes
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-navy-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={20} />
                    Configurações
                  </Link>
                  <Link
                    to="/tutorial"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-navy-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle size={20} />
                    Tutorial
                  </Link>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Add logout logic here
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-navy-700 w-full"
                  >
                    <LogOut size={20} />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;