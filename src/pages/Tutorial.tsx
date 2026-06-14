import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle, Users, HelpCircle } from 'lucide-react';

export default function Tutorial() {
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
              <Book className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tutorial de Compra FastPay</h1>
              <p className="text-gray-400">Aprenda a utilizar a plataforma de forma eficiente</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <HelpCircle className="text-blue-500" size={20} />
                </div>
                <h2 className="text-xl font-semibold">Como Criar uma Conta no FastPay</h2>
              </div>
              <div className="bg-navy-700 rounded-lg p-6">
                <ol className="list-decimal list-inside space-y-4 text-gray-300">
                  <li>Acesse a página inicial do FastPay</li>
                  <li>Clique no botão "Criar Conta"</li>
                  <li>Preencha seus dados pessoais corretamente</li>
                  <li>Verifique seu email para confirmar o cadastro</li>
                  <li>Faça login com suas credenciais</li>
                </ol>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Wallet className="text-emerald-500" size={20} />
                </div>
                <h2 className="text-xl font-semibold">Como Comprar FastCoin (FASTC)</h2>
              </div>
              <div className="bg-navy-700 rounded-lg p-6">
                <ol className="list-decimal list-inside space-y-4 text-gray-300">
                  <li>Acesse sua área do cliente</li>
                  <li>Vá até a aba "Wallet"</li>
                  <li>Clique em "Depositar" e escolha o método de pagamento</li>
                  <li>Copie o endereço da carteira e envie o valor desejado</li>
                  <li>Envie o comprovante para validação</li>
                  <li>Aguarde a confirmação do depósito</li>
                </ol>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <ArrowDownCircle className="text-purple-500" size={20} />
                </div>
                <h2 className="text-xl font-semibold">Como Fazer Depósitos</h2>
              </div>
              <div className="bg-navy-700 rounded-lg p-6">
                <div className="space-y-4 text-gray-300">
                  <p>Métodos de depósito disponíveis:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>PIX (Brasil)</li>
                    <li>MBWAY (Portugal)</li>
                    <li>Transferência Bancária</li>
                    <li>Criptomoedas</li>
                  </ul>
                  <p>Tempo médio de processamento:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>PIX e MBWAY: Até 15 minutos</li>
                    <li>Transferência Bancária: 1-2 dias úteis</li>
                    <li>Criptomoedas: Após 6 confirmações na rede</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <ArrowUpCircle className="text-red-500" size={20} />
                </div>
                <h2 className="text-xl font-semibold">Como Fazer Saques</h2>
              </div>
              <div className="bg-navy-700 rounded-lg p-6">
                <ol className="list-decimal list-inside space-y-4 text-gray-300">
                  <li>Acesse a aba "Wallet"</li>
                  <li>Clique em "Saque"</li>
                  <li>Escolha o método de saque</li>
                  <li>Informe o valor e os dados para recebimento</li>
                  <li>Confirme a solicitação</li>
                  <li>Aguarde a aprovação (até 48h úteis)</li>
                </ol>
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-500">
                    Importante: Certifique-se de informar os dados corretos para evitar atrasos no processamento.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Users className="text-green-500" size={20} />
                </div>
                <h2 className="text-xl font-semibold">Programa de Afiliados</h2>
              </div>
              <div className="bg-navy-700 rounded-lg p-6">
                <div className="space-y-4 text-gray-300">
                  <p>Como participar:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Acesse a aba "Afiliados"</li>
                    <li>Copie seu código de afiliado</li>
                    <li>Compartilhe com amigos e conhecidos</li>
                    <li>Ganhe comissões pelas indicações</li>
                  </ol>
                  <div className="mt-4">
                    <p className="font-medium">Comissões por nível de plano:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Starter: 2% no 1º grau, 2% no 2º grau</li>
                      <li>Token: 8% por indicação</li>
                      <li>Miner: 20% por indicação</li>
                      <li>Master: 35% por indicação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}