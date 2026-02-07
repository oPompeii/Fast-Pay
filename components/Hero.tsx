import React, { useState } from 'react';
import { LogIn, UserPlus, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import useLanguage from '../hooks/useLanguage';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <div className="relative bg-[#1A2141] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Logo className="h-36" />
            </div>
            <p className="text-xl md:text-2xl mb-8">
              A próxima geração de carteira digital e programa de afiliados
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                to="/register"
                className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Criar Conta
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Entrar
              </Link>
              <a
                href="https://chat.whatsapp.com/FaDsqmbw8Wm05zrhFoYMM3"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#22BF5B] transition-colors flex items-center gap-2"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 fill-current"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Grupo WhatsApp
              </a>
              <button
                onClick={() => setShowAbout(true)}
                className="bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2"
              >
                <Info className="w-5 h-5" />
                A FastPay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Sobre o FastPay</h2>
              <button
                onClick={() => setShowAbout(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-8 space-y-8">
              {/* Introduction */}
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  O FastPay nasceu com uma ideia simples, mas poderosa: tornar as finanças mais acessíveis, conectadas e recompensadoras para todos. Em um mundo onde a tecnologia avança rapidamente, percebemos a necessidade de criar uma plataforma que fosse fácil de usar, segura e capaz de oferecer oportunidades reais de crescimento financeiro.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Nossa missão é clara: ajudar pessoas e empresas a administrar melhor suas finanças, investir com confiança e ganhar por fazer parte de uma comunidade global conectada. O FastPay não é apenas uma ferramenta – é um movimento para transformar a forma como as pessoas lidam com dinheiro.
                </p>
              </div>

              {/* What FastPay Offers */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">O que o FastPay oferece</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-600">Carteira Digital Simples e Segura</h4>
                    <p className="text-gray-600">Com o FastPay, você pode guardar, enviar e receber dinheiro de forma rápida e prática. Criamos nossa própria moeda, o FastCoin, que é segura, fácil de usar e tem tudo o que você precisa para fazer transações no mundo digital.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-600">Ganhos com Staking</h4>
                    <p className="text-gray-600">Com o programa de ganhos do FastPay, seus investimentos podem crescer mês a mês. Ao deixar seus FastCoins rendendo, você recebe juros atrativos, ajudando seu dinheiro a trabalhar por você.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-600">Expansão com Caixas Eletrônicos</h4>
                    <p className="text-gray-600">Queremos estar ainda mais perto de você! Por isso, nosso objetivo é instalar caixas eletrônicos de criptomoedas em várias localidades, facilitando saques e depósitos, e tornando o uso de moedas digitais ainda mais simples e acessível.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-600">Pacotes para Começar Agora</h4>
                    <p className="text-gray-600">Oferecemos opções de investimento que começam com valores acessíveis. Todo novo membro pode formar sua própria rede e começar a construir uma base financeira sólida, com benefícios para quem decide crescer junto conosco.</p>
                  </div>
                </div>
              </div>

              {/* Support and Transparency */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-emerald-600">Suporte Completo e Personalizado</h4>
                  <p className="text-gray-600">Cada usuário recebe um código exclusivo e pode gerar links personalizados para compartilhar a plataforma com amigos e conhecidos. Além disso, contamos com um suporte sempre disponível para ajudar você no que precisar.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600">Tudo Transparente e Fácil de Visualizar</h4>
                  <p className="text-gray-600">No FastPay, você pode acompanhar todos os seus ganhos, transações e saques de maneira clara e organizada. Nosso painel mostra gráficos de crescimento semanais e mensais, para que você tenha total controle sobre suas finanças.</p>
                </div>
              </div>

              {/* Why Choose FastPay */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Por que escolher o FastPay?</h3>
                <p className="text-gray-700">O FastPay foi feito para todos, desde quem está começando no mundo das finanças digitais até quem já tem experiência e quer uma plataforma completa. Nós acreditamos que o dinheiro deve ser fácil de entender, seguro de usar e recompensador para quem faz parte da nossa comunidade.</p>
                <p className="text-gray-700">Não importa onde você esteja ou qual seja o seu objetivo financeiro, o FastPay está aqui para ajudar você a conquistar mais. Junte-se a nós nessa jornada e seja parte de um futuro financeiro mais simples, justo e cheio de oportunidades.</p>
              </div>

              <div className="text-center pt-4">
                <p className="text-lg font-semibold text-emerald-600">FastPay: Simples, seguro e feito para você!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;