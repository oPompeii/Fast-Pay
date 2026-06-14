import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Coins, Users, ArrowRight } from 'lucide-react';

export default function Plans() {
  const navigate = useNavigate();

  const features = {
    security: {
      title: 'Segurança Garantida',
      description: 'Proteção total para suas transações',
      icon: <Shield className="text-emerald-500" size={24} />,
    },
    fastcoins: {
      title: 'FastCoins Grátis',
      description: 'Receba FastCoins todo mês',
      icon: <Coins className="text-emerald-500" size={24} />,
    },
    affiliates: {
      title: 'Programa de Afiliados',
      description: 'Ganhe indicando amigos',
      icon: <Users className="text-emerald-500" size={24} />,
    },
    upgrade: {
      title: 'Upgrade Flexível',
      description: 'Mude de plano quando quiser',
      icon: <ArrowRight className="text-emerald-500" size={24} />,
    },
  };

  const plans = [
    {
      name: 'Starter',
      price: 299,
      features: [
        'Carteira Digital',
        'IA ADVISOR',
        'Análise de Carteira AI',
        'Suporte por Email',
        '600 FastCoins',
        'Acesso ao Programa de Indicação',
        '2% Comissão por Indicação',
      ],
    },
    {
      name: 'Token',
      price: 999,
      features: [
        'Carteira Digital',
        'IA ADVISOR',
        'Análise de Carteira AI',
        'Suporte por Email',
        '1100 FastCoins',
        'Acesso ao Programa de Indicação',
        '8% Comissão por Indicação',
      ],
    },
    {
      name: 'Miner',
      price: 2999,
      features: [
        'Carteira Digital',
        'IA ADVISOR',
        'Análise de Carteira AI',
        'Suporte Prioritário 24/5',
        '3300 FastCoins',
        'Acesso ao Programa de Indicação',
        '20% Comissão por Indicação',
        'Acesso a Eventos Exclusivos',
        'Análises de Mercado',
      ],
    },
    {
      name: 'Master',
      price: 9999,
      features: [
        'Carteira Digital',
        'IA ADVISOR',
        'Análise de Carteira AI',
        'Suporte VIP 24/7',
        '11000 FastCoins',
        'Acesso ao Programa de Indicação',
        '30% Comissão por Indicação',
        'Acesso Antecipado a Novidades',
        'Consultoria Financeira Dedicada',
        'Cartão VIP Personalizado',
        'Eventos VIP Exclusivos',
      ],
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano FastPay</h1>
          <p className="text-gray-400">
            Comece sua jornada com o plano que melhor se adapta às suas necessidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {Object.values(features).map((feature) => (
            <div key={feature.title} className="bg-navy-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-navy-800 rounded-lg p-6 ${
                plan.highlight ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              {plan.highlight && (
                <div className="bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                  Mais Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                ${plan.price}
                <span className="text-sm font-normal text-gray-400">
                  {' '}
                  Comissão por Indicação
                </span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-lg font-medium ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-navy-700 hover:bg-navy-600 text-white'
                }`}
              >
                Escolher Plano
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}