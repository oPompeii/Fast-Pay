import React from 'react';
import { CreditCard, ArrowRight, Wallet, Receipt, ExternalLink } from 'lucide-react';

const CryptoTutorial: React.FC = () => {
  const steps = [
    {
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
      title: 'Depositar Fundos',
      description: 'Deposite dinheiro usando cartão ou transferência bancária',
      icon: ArrowRight,
      details: [
        'Escolha o método de pagamento (PIX, cartão, etc)',
        'Siga as instruções de depósito',
        'Aguarde a confirmação do depósito',
        'Os fundos aparecerão em sua conta'
      ]
    },
    {
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Progress Steps */}
      <div className="relative mb-8">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                {index + 1}
              </div>
              <div className="mt-2 text-xs text-center w-20">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Content */}
      {steps.map((step, index) => (
        <div key={index} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                <step.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">
                  Passo {index + 1}: {step.title}
                </h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          </button>
          <div className="p-4 bg-white">
            <ul className="space-y-2">
              {step.details.map((detail, detailIndex) => (
                <li key={detailIndex} className="flex items-center text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 text-sm">
                    {detailIndex + 1}
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
        </div>
      ))}

      {/* Support Section */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Precisa de mais ajuda?
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Falar com Suporte
        </button>
      </div>
    </div>
  );
};

export default CryptoTutorial;