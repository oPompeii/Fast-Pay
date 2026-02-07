import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Book, Disc as Discord, X, MessageCircle, Instagram, Video } from 'lucide-react';

function Footer() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', contactForm);
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <footer className="bg-navy-800">
      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Entre em Contato</h2>
          <p className="text-gray-400">
            Estamos aqui para ajudar. Envie sua mensagem e responderemos o mais breve possível.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensagem
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-32 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-8 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Enviar Mensagem
          </button>
        </form>
      </div>

      {/* Social Media Section */}
      <div className="border-t border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-center text-xl font-bold mb-12">Siga-nos nas Redes Sociais</h3>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <a
              href="https://discord.com/invite/bsmu4XhC"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="bg-navy-700 p-4 rounded-xl group-hover:bg-[#5865F2] transition-colors">
                <Discord size={32} className="text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-[#5865F2]">Discord</span>
            </a>
            
            <a
              href="https://x.com/i/flow/login?redirect_after_login=%2Ffastpay0"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="bg-navy-700 p-4 rounded-xl group-hover:bg-black transition-colors">
                <X size={32} className="text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white">X (Twitter)</span>
            </a>
            
            <a
              href="https://t.me/+XZJ0O0PnNO4yNjg8"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="bg-navy-700 p-4 rounded-xl group-hover:bg-[#0088cc] transition-colors">
                <MessageCircle size={32} className="text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-[#0088cc]">Telegram</span>
            </a>
            
            <a
              href="https://www.instagram.com/fastpay.io/?igsh=MXEzOHhjZmtkMXQyeA%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="bg-navy-700 p-4 rounded-xl group-hover:bg-[#E4405F] transition-colors">
                <Instagram size={32} className="text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-[#E4405F]">Instagram</span>
            </a>
            
            <a
              href="https://www.tiktok.com/@fastpy?_t=ZN-8tpVcVbVfjK&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="bg-navy-700 p-4 rounded-xl group-hover:bg-black transition-colors">
                <Video size={32} className="text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white">TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="border-t border-navy-700">
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