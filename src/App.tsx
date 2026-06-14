import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Zap, Shield, Globe2, Gift, X, Menu, Brain, TrendingUp, DollarSign, MessageSquare, Bot } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Withdraw from './pages/Withdraw';
import Packages from './pages/Packages';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Earn from './pages/Earn';
import Terms from './pages/Terms';
import Tutorial from './pages/Tutorial';
import AiAdvisor from './pages/AiAdvisor';
import BuyFastcoin from './pages/BuyFastcoin';
import Invite from './pages/Invite';

function App() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/ai-advisor" element={<AiAdvisor />} />
        <Route path="/buy-fastcoin" element={<BuyFastcoin />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/" element={
          <div className="min-h-screen bg-navy-900 text-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="py-12 md:py-20 px-4">
              <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">
                  <span className="text-emerald-500">Fast</span> Pay
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12">
                  A próxima geração de carteira digital
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                  <Link 
                    to="/register"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    Criar Conta
                  </Link>
                  <Link
                    to="/login" 
                    className="bg-navy-700 hover:bg-navy-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    Entrar
                  </Link>
                  <a 
                    href="https://chat.whatsapp.com/FaDsqmbw8Wm05zrhFoYMM3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    Grupo WhatsApp
                  </a>
                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    A FastPay
                  </button>
                </div>
              </div>
            </section>

            {/* AI Advisor Banner */}
            <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
              <div className="max-w-6xl mx-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <Brain className="text-white w-8 h-8" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold">FastPay AI Advisor</h2>
                    </div>
                    <p className="text-lg md:text-xl text-gray-100 mb-8">
                      Tome decisões mais inteligentes com nosso assistente de IA especializado em finanças e criptomoedas. Análises em tempo real, recomendações personalizadas e insights estratégicos para maximizar seus resultados.
                    </p>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                          <TrendingUp className="text-emerald-300 w-5 h-5" />
                        </div>
                        <span>Análise de mercado em tempo real</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                          <DollarSign className="text-emerald-300 w-5 h-5" />
                        </div>
                        <span>Recomendações de investimento</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                          <MessageSquare className="text-emerald-300 w-5 h-5" />
                        </div>
                        <span>Consultoria personalizada 24/7</span>
                      </li>
                    </ul>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <Brain className="w-5 h-5" />
                      Comece Agora
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="bg-navy-800 rounded-lg p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                          <Brain className="text-emerald-500 w-6 h-6" />
                        </div>
                        <div className="text-lg font-semibold">FastPay AI</div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-navy-700 p-4 rounded-lg">
                          <p className="text-gray-300">Como posso maximizar meus ganhos com staking?</p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-lg">
                          <p className="text-emerald-300">
                            Com base na análise atual do mercado, recomendo:
                            1. Diversificar entre períodos de 30, 60 e 90 dias
                            2. Reinvestir os rendimentos semanais
                            3. Aproveitar o bônus de fidelidade
                            
                            Isso pode aumentar seus ganhos em até 15% ao mês.
                          </p>
                        </div>
                        <div className="bg-navy-700 p-4 rounded-lg">
                          <p className="text-gray-300">Qual a melhor estratégia para investimentos?</p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-lg animate-pulse">
                          <div className="flex items-center gap-2">
                            <Brain className="text-emerald-300 w-5 h-5" />
                            <span className="text-emerald-300">Analisando dados...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Powered by AI
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-12 md:py-20 px-4 bg-navy-800">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Por que escolher o FastPay?</h2>
                <p className="text-lg md:text-xl text-gray-300 text-center mb-12 md:mb-16">
                  Descubra os benefícios que fazem do FastPay a escolha ideal para suas finanças digitais
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  <FeatureCard
                    icon={<Zap className="w-8 h-8 text-emerald-500" />}
                    title="Transações Instantâneas"
                    description="Envie e receba pagamentos em segundos, sem esperas ou complicações"
                  />
                  <FeatureCard
                    icon={<Shield className="w-8 h-8 text-emerald-500" />}
                    title="Máxima Segurança"
                    description="Proteção avançada com autenticação de dois fatores e criptografia"
                  />
                  <FeatureCard
                    icon={<Globe2 className="w-8 h-8 text-emerald-500" />}
                    title="Suporte Global"
                    description="Atendimento em múltiplos idiomas e suporte 24/7 para todos os usuários"
                  />
                  <FeatureCard
                    icon={<Gift className="w-8 h-8 text-emerald-500" />}
                    title="Programa de Recompensas"
                    description="Ganhe recompensas por cada transação e multiplique seus ganhos"
                  />
                </div>
              </div>
            </section>

            {/* Partners Section */}
            <section className="py-12 md:py-20 px-4 bg-navy-900">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Parceiros & Projetos</h2>
                <p className="text-lg text-gray-400 text-center mb-12">
                  Trabalhamos com os melhores para oferecer soluções inovadoras
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ChatGPT Card */}
                  <a 
                    href="https://chat.openai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-navy-800 rounded-lg p-6 hover:bg-navy-700 transition-colors group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-emerald-500/20 p-3 rounded-lg">
                        <Bot className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">ChatGPT</h3>
                        <p className="text-gray-400">Powered by OpenAI</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Inteligência artificial de ponta integrada ao FastPay para análises avançadas de mercado e recomendações personalizadas de investimento.
                    </p>
                    <div className="flex items-center text-emerald-500 group-hover:text-emerald-400">
                      <span>Saiba mais</span>
                      <TrendingUp className="w-5 h-5 ml-2" />
                    </div>
                  </a>

                  {/* AI Services Card */}
                  <div className="bg-navy-800 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-purple-500/20 p-3 rounded-lg">
                        <Brain className="w-8 h-8 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Serviços AI</h3>
                        <p className="text-gray-400">Tecnologia Avançada</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-300">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span>Análise de Dados</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span>Previsões de Mercado</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        <span>Consultoria 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Footer />

            {/* About Modal */}
            {showAboutModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white text-navy-900 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto relative">
                  <button 
                    onClick={() => setShowAboutModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                  
                  <div className="p-6 md:p-8">
                    <h2 className="text-3xl font-bold mb-6">Sobre o FastPay</h2>
                    
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        O FastPay nasceu com uma ideia simples, mas poderosa: tornar as finanças mais acessíveis, conectadas e recompensadoras para todos. Em um mundo onde a tecnologia avança rapidamente, percebemos a necessidade de criar uma plataforma que fosse fácil de usar, segura e capaz de oferecer oportunidades reais de crescimento financeiro.
                      </p>

                      <p className="text-gray-600">
                        Nossa missão é clara: ajudar pessoas e empresas a administrar melhor suas finanças, investir com confiança e ganhar por fazer parte de uma comunidade global conectada. O FastPay não é apenas uma ferramenta – é um movimento para transformar a forma como as pessoas lidam com dinheiro.
                      </p>

                      <h3 className="text-2xl font-bold mt-8 mb-4">O que o FastPay oferece</h3>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-emerald-600 mb-2">Carteira Digital Simples e Segura</h4>
                          <p className="text-gray-600">
                            Com o FastPay, você pode guardar, enviar e receber dinheiro de forma rápida e prática. Criamos nossa própria moeda, o FastCoin, que é segura, fácil de usar e tem tudo o que você precisa para fazer transações no mundo digital.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-emerald-600 mb-2">Ganhos com Staking</h4>
                          <p className="text-gray-600">
                            Com o programa de ganhos do FastPay, seus investimentos podem crescer mês a mês. Ao deixar seus FastCoins rendendo, você recebe juros atrativos, ajudando seu dinheiro a trabalhar por você.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-emerald-600 mb-2">Expansão com Caixas Eletrônicos</h4>
                          <p className="text-gray-600">
                            Queremos estar ainda mais perto de você! Por isso, nosso objetivo é instalar caixas eletrônicos e criptomoedas em várias localidades, facilitando saques e depósitos, e tornando o uso de moedas digitais ainda mais simples e acessível.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-emerald-600 mb-2">Pacotes para Começar Agora</h4>
                          <p className="text-gray-600">
                            Oferecemos opções de investimento que começam com valores acessíveis. Todo novo membro pode começar a construir uma base financeira sólida, com benefícios exclusivos.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-emerald-600 mb-2">Suporte Completo e Personalizado</h4>
                        <p className="text-gray-600">
                          Contamos com um suporte sempre disponível para ajudar você no que precisar.
                        </p>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-emerald-600 mb-2">Tudo Transparente e Fácil de Visualizar</h4>
                        <p className="text-gray-600">
                          No FastPay, você pode acompanhar todos os seus ganhos, transações e saques de maneira clara e organizada. Nosso painel mostra gráficos de crescimento semanais e mensais, para que você tenha total controle sobre suas finanças.
                        </p>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-4">Por que escolher o FastPay?</h3>
                        <p className="text-gray-600">
                          O FastPay foi feito para todos, desde quem está começando no mundo das finanças digitais até quem já tem experiência e quer uma plataforma completa. Nós acreditamos que o dinheiro deve ser fácil de entender, seguro de usar e recompensador.
                        </p>
                        <p className="text-gray-600 mt-4">
                          Não importa onde você esteja ou qual seja o seu objetivo financeiro, o FastPay está aqui para ajudar você a conquistar mais. Junte-se a nós nessa jornada e seja parte de um futuro financeiro mais simples, justo e cheio de oportunidades.
                        </p>
                      </div>

                      <div className="text-center mt-8 text-emerald-600 font-bold text-xl">
                        FastPay: Simples, seguro e feito para você!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        } />
      </Routes>
    </Router>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-navy-700 p-6 rounded-lg text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-navy-600 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export default App;