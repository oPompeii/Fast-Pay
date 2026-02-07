import React from 'react';
import { Shield, Zap, Globe, Gift } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher o FastPay?
          </h2>
          <p className="text-xl text-gray-600">
            Descubra os benefícios que fazem do FastPay a escolha ideal para suas finanças digitais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Transações Instantâneas
            </h3>
            <p className="text-gray-600">
              Envie e receba pagamentos em segundos, sem esperas ou complicações
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Máxima Segurança
            </h3>
            <p className="text-gray-600">
              Proteção avançada com autenticação de dois fatores e criptografia
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Suporte Global
            </h3>
            <p className="text-gray-600">
              Atendimento em múltiplos idiomas e suporte 24/7 para todos os usuários
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Programa de Recompensas
            </h3>
            <p className="text-gray-600">
              Ganhe recompensas por cada transação e indique amigos para multiplicar seus ganhos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;