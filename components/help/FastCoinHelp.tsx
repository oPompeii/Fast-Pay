import React, { useState, useEffect } from 'react';
import { HelpCircle, ExternalLink, ChevronDown, ChevronUp, CreditCard, Wallet, Receipt, ArrowRight, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HelpContent {
  id: string;
  title: string;
  content: string;
  category: string;
  order_index: number;
}

interface FastCoinHelpProps {
  onClose: () => void;
}

const FastCoinHelp: React.FC<FastCoinHelpProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const steps = [
    {
      id: '1',
      title: 'Criar Conta na Exchange',
      description: 'Crie uma conta na Binance ou outra exchange confiável',
      icon: CreditCard,
      link: 'https://www.binance.com/register',
      linkText: 'Criar Conta na Binance',
      details: [
        'Acesse o site da Binance',
        'Clique em "Criar Conta"',
        'Preencha seus dados pessoais',
        'Verifique seu email',
        'Complete a verificação de identidade (KYC)'
      ]
    },
    {
      id: '2',
      title: 'Depositar Fundos',
      description: 'Deposite dinheiro usando cartão ou transferência bancária',
      icon: DollarSign,
      details: [
        'Escolha o método de pagamento (PIX, cartão, etc)',
        'Siga as instruções de depósito',
        'Aguarde a confirmação do depósito',
        'Os fundos aparecerão em sua conta'
      ]
    },
    {
      id: '3',
      title: 'Comprar Criptomoeda',
      description: 'Compre USDT, BTC, ETH ou SOL para usar no FastPay',
      icon: Wallet,
      details: [
        'Vá para a seção de compra',
        'Escolha a criptomoeda (USDT recomendado)',
        'Insira o valor que deseja comprar',
        'Confirme a transação',
        'Aguarde a confirmação da compra'
      ]
    },
    {
      id: '4',
      title: 'Transferir para FastPay',
      description: 'Envie a criptomoeda para sua carteira FastPay',
      icon: ArrowRight,
      details: [
        'Copie o endereço da sua carteira FastPay',
        'Vá para a seção de saque na exchange',
        'Cole o endereço da carteira FastPay',
        'Confirme os detalhes da transferência',
        'Aguarde a confirmação da blockchain'
      ]
    },
    {
      id: '5',
      title: 'Enviar Comprovante',
      description: 'Envie o comprovante da transação para ativar seu pacote',
      icon: Receipt,
      details: [
        'Salve o hash da transação',
        'Faça um screenshot do comprovante',
        'Envie o comprovante no FastPay',
        'Aguarde a validação do pagamento',
        'Seu pacote será ativado automaticamente'
      ]
    }
  ];

  useEffect(() => {
    const logInitialView = async () => {
      try {
        const { data } = await supabase
          .from('help_content')
          .select('id')
          .eq('category', 'fastcoin')
          .limit(1)
          .single();

        if (data) {
          await supabase.rpc('log_help_access', {
            p_content_id: data.id,
            p_action: 'view'
          });
        }
      } catch (error) {
        console.error('Error logging help access:', error);
      }
    };

    logInitialView();
  }, []);

  const handleSectionClick = async (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);

    try {
      const { data } = await supabase
        .from('help_content')
        .select('id')
        .eq('category', 'fastcoin')
        .limit(1)
        .single();

      if (data) {
        await supabase.rpc('log_help_access', {
          p_content_id: data.id,
          p_action: 'view'
        });
      }
    } catch (error) {
      console.error('Error logging section view:', error);
    }
  };

  const handleSupportClick = async () => {
    try {
      const { data } = await supabase
        .from('help_content')
        .select('id')
        .eq('category', 'fastcoin')
        .limit(1)
        .single();

      if (data) {
        await supabase.rpc('log_help_access', {
          p_content_id: data.id,
          p_action: 'support_request'
        });
      }
    } catch (error) {
      console.error('Error logging support request:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <HelpCircle className="w-6 h-6 text-emerald-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Como Comprar FastCoin
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="relative mb-8">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2" />
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      expandedSection === step.id ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="mt-2 text-xs text-center w-20">{step.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Content */}
            {steps.map((step) => (
              <div
                key={step.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => handleSectionClick(step.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                      <step.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">
                        Passo {step.id}: {step.title}
                      </h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {expandedSection === step.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedSection === step.id && (
                  <div className="p-4 bg-white">
                    <ul className="space-y-2">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 text-sm">
                            {index + 1}
                          </div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {step.linkText}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Support Section */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Precisa de mais ajuda?
              </div>
              <button
                onClick={handleSupportClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Falar com Suporte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FastCoinHelp;