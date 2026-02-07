import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Zap, Shield, Globe2, Gift, X, Menu } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Withdraw from './pages/Withdraw';
import Affiliates from './pages/Affiliates';
import Packages from './pages/Packages';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Earn from './pages/Earn';
import Terms from './pages/Terms';
import Tutorial from './pages/Tutorial';

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
        <Route path="/affiliates" element={<Affiliates />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/tutorial" element={<Tutorial />} />
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
                  A próxima geração de carteira digital e programa de afiliados
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
                    description="Ganhe recompensas por cada transação e indique amigos para multiplicar seus ganhos"
                  />
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
                    <h2 className="text-3xl font-bold mb-6">White Paper - FastCoin (FSTC)</h2>
                    
                    <div className="space-y-8 text-gray-600">
                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">1. Visão Geral</h3>
                        <p>
                          O <strong>FastCoin (FSTC)</strong> é uma criptomoeda desenvolvida para ser a base do ecossistema financeiro do <strong>FastPay</strong>, uma plataforma de pagamentos digitais e serviços financeiros inovadores. Projetado na rede <strong>Solana</strong>, o FastCoin oferece transações rápidas, seguras e com taxas mínimas, ideal para pagamentos diários, programas de afiliados, recompensas e muito mais.
                        </p>
                        <p className="mt-4">
                          O <strong>FastPay</strong> nasceu com uma ideia simples, mas poderosa: tornar as finanças mais acessíveis, conectadas e recompensadoras para todos. Em um mundo onde a tecnologia avança rapidamente, percebemos a necessidade de criar uma plataforma que fosse fácil de usar, segura e capaz de oferecer oportunidades reais de crescimento financeiro.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">2. Missão do FastCoin e FastPay</h3>
                        <p>
                          Oferecer uma <strong>solução financeira global, acessível e eficiente</strong>, permitindo que indivíduos e empresas realizem transações em qualquer lugar do mundo, com o poder da tecnologia blockchain.
                        </p>
                        <p className="mt-4">
                          O FastPay não é apenas uma ferramenta – é um <strong>movimento para transformar a forma como as pessoas lidam com dinheiro</strong>, promovendo inclusão financeira e oportunidades para todos.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">3. Por Que a Rede Solana?</h3>
                        <p>O FastCoin é construído na <strong>rede Solana</strong> devido às suas vantagens significativas:</p>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                          <li><strong>Alta Escalabilidade:</strong> Capaz de processar até 65.000 transações por segundo (TPS)</li>
                          <li><strong>Baixas Taxas:</strong> Custos de transação quase nulos, tornando micropagamentos viáveis</li>
                          <li><strong>Velocidade:</strong> Confirmação de transações em menos de 1 segundo</li>
                          <li><strong>Segurança:</strong> Estrutura robusta de <strong>Proof-of-History (PoH)</strong> combinada com <strong>Proof-of-Stake (PoS)</strong></li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">4. O que o FastPay oferece</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold">✅ Carteira Digital Simples e Segura</h4>
                            <p>Armazene, envie e receba FastCoin de forma rápida e prática. A carteira do FastPay é intuitiva e segura.</p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">💸 Ganhos com Staking (Earn Program)</h4>
                            <p>Ao participar do programa de staking, seus FastCoins rendem juros de até <strong>9% ao mês</strong>, proporcionando uma fonte de renda passiva.</p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">🏧 Expansão com Caixas Eletrônicos</h4>
                            <p>Instalação de caixas eletrônicos de criptomoedas em diversas localidades, facilitando saques e depósitos.</p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">📊 Pacotes de Investimento</h4>
                            <p>Planos de investimento acessíveis para todos, permitindo que novos usuários construam uma base financeira sólida.</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">5. Tokenomics do FastCoin</h3>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <div className="mb-4">
                            <p><strong>Símbolo do Token:</strong> FSTC</p>
                            <p><strong>Rede:</strong> Solana (SPL Token)</p>
                            <p><strong>Fornecimento Total:</strong> 100.000.000 FSTC</p>
                          </div>
                          <h4 className="font-semibold mb-2">Distribuição de Tokens:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            <li><strong>40%</strong> - Recompensas e Programas de Earn</li>
                            <li><strong>30%</strong> - Liquidez e Exchanges</li>
                            <li><strong>15%</strong> - Equipe e Desenvolvimento</li>
                            <li><strong>10%</strong> - Marketing e Parcerias</li>
                            <li><strong>5%</strong> - Reserva Estratégica</li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">6. Mecanismo de Staking e Earn</h3>
                        <p>O FastCoin oferece um programa de staking inovador, permitindo aos usuários ganhar juros passivos:</p>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                          <li><strong>Taxa de Juros:</strong> Até 9% ao mês</li>
                          <li><strong>Períodos de Bloqueio:</strong> 30, 60 ou 90 dias</li>
                          <li><strong>Flexibilidade:</strong> Os rendimentos podem ser sacados ou reinvestidos automaticamente</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">7. Segurança e Conformidade</h3>
                        <ul className="list-disc list-inside space-y-2">
                          <li><strong>Smart Contracts Auditados:</strong> Garantindo a integridade e segurança do código</li>
                          <li><strong>Conformidade com Leis Internacionais:</strong> Incluindo práticas de KYC e AML</li>
                          <li><strong>Proteção de Dados:</strong> Criptografia avançada para proteger informações dos usuários</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">8. Parcerias Estratégicas</h3>
                        <p>O FastCoin busca parcerias com:</p>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                          <li><strong>Exchanges de Criptomoedas:</strong> Para listagem e liquidez</li>
                          <li><strong>Plataformas de Pagamento:</strong> Integração direta com comércios físicos e online</li>
                          <li><strong>Startups e Projetos DeFi:</strong> Ampliar o uso do token e fomentar o ecossistema</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">9. Roadmap do FastCoin</h3>
                        <ul className="list-disc list-inside space-y-2">
                          <li><strong>Q1 2025:</strong> Lançamento do White Paper e ICO</li>
                          <li><strong>Q2 2025:</strong> Desenvolvimento do Smart Contract na rede Solana</li>
                          <li><strong>Q3 2025:</strong> Integração com o FastPay e lançamento oficial</li>
                          <li><strong>Q4 2025:</strong> Parcerias estratégicas e listagem em exchanges</li>
                          <li><strong>2026:</strong> Expansão global e novos casos de uso</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">10. Equipe de Desenvolvimento</h3>
                        <p>O FastCoin é desenvolvido por uma equipe de especialistas em:</p>
                        <ul className="list-disc list-inside mt-2 space-y-2">
                          <li>Tecnologia Blockchain</li>
                          <li>Segurança Cibernética</li>
                          <li>Finanças Descentralizadas (DeFi)</li>
                          <li>Marketing e Estratégias de Crescimento</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">11. Contato</h3>
                        <ul className="list-none space-y-2">
                          <li>🌐 <strong>Site Oficial:</strong> www.fastpay.com</li>
                          <li>📧 <strong>E-mail:</strong> contact@fastpay.com</li>
                          <li>💬 <strong>Comunidade:</strong> Discord FastPay | Telegram FastPay | Twitter FastPay</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-emerald-600 mb-4">12. Aviso Legal</h3>
                        <p className="bg-gray-50 p-4 rounded-lg">
                          O FastCoin não é um investimento financeiro tradicional. O valor do token pode flutuar de acordo com o mercado. Os usuários são responsáveis por suas decisões financeiras. <strong>Consulte um profissional antes de realizar qualquer investimento.</strong>
                        </p>
                      </section>

                      <div className="text-center text-2xl font-bold text-emerald-600">
                        🚀 FastPay: Simples, seguro e feito para você! 🚀
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