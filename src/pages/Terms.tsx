import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="bg-navy-800 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <Shield className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Termos e Privacidade</h1>
              <p className="text-gray-400">Políticas do FastPay</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Termos de Uso */}
            <section>
              <h2 className="text-xl font-bold mb-4">Termos de Uso</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Bem-vindo ao FastPay! Ao utilizar nossos serviços, você concorda com estes termos.
                  Por favor, leia-os atentamente.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-2">1. Aceitação dos Termos</h3>
                    <p>
                      Ao acessar e utilizar o FastPay, você concorda em cumprir estes Termos de Uso
                      e todas as leis e regulamentos aplicáveis.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">2. Serviços</h3>
                    <p>
                      O FastPay oferece serviços de carteira digital, transações com FastCoin (FASTC)
                      e programa de afiliados. Reservamo-nos o direito de modificar, suspender ou
                      descontinuar qualquer aspecto do serviço a qualquer momento.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">3. Elegibilidade</h3>
                    <p>
                      Para utilizar o FastPay, você deve ter pelo menos 18 anos de idade e capacidade
                      legal para aceitar estes termos.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">4. Sua Conta</h3>
                    <p>
                      Você é responsável por manter a confidencialidade de sua conta e senha.
                      Notifique-nos imediatamente sobre qualquer uso não autorizado.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">5. Uso Aceitável</h3>
                    <p>
                      Você concorda em não usar o FastPay para atividades ilegais ou proibidas
                      por estes termos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Política de Privacidade */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Lock className="text-emerald-500" size={20} />
                </div>
                <h2 className="text-xl font-bold">Política de Privacidade</h2>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">1. Coleta de Dados</h3>
                  <p>
                    Coletamos informações necessárias para fornecer nossos serviços, incluindo:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Informações de cadastro (nome, email, telefone)</li>
                    <li>Dados de transações</li>
                    <li>Informações de uso do serviço</li>
                    <li>Dados de dispositivo e conexão</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">2. Uso dos Dados</h3>
                  <p>
                    Utilizamos suas informações para:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Processar transações</li>
                    <li>Fornecer suporte ao cliente</li>
                    <li>Melhorar nossos serviços</li>
                    <li>Enviar comunicações importantes</li>
                    <li>Prevenir fraudes e abusos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">3. Proteção de Dados</h3>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais para proteger
                    suas informações contra acesso não autorizado, alteração, divulgação ou
                    destruição.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">4. Seus Direitos</h3>
                  <p>
                    Você tem direito a:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Acessar seus dados pessoais</li>
                    <li>Corrigir dados imprecisos</li>
                    <li>Solicitar a exclusão de dados</li>
                    <li>Opor-se ao processamento</li>
                    <li>Portabilidade dos dados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">5. Contato</h3>
                  <p>
                    Para questões sobre privacidade, entre em contato:
                    <br />
                    Email: privacy@fastpay.com
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-navy-700 pt-6">
              <p className="text-gray-400 text-sm">
                Última atualização: Fevereiro 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}