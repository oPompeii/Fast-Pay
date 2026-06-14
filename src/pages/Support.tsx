import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MessageSquare, Send, Plus, ChevronDown, ChevronUp, Phone } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [activeTab, setActiveTab] = useState('faq'); // Default to FAQ tab
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'MEDIUM'
  });

  const faqData = [
    {
      category: "Conta e Segurança",
      items: [
        {
          question: "Como criar uma conta no FastPay?",
          answer: "Clique em 'Criar Conta', preencha seus dados pessoais e siga as instruções para ativar sua conta."
        },
        {
          question: "Esqueci minha senha. O que devo fazer?",
          answer: "Na página de login, clique em 'Esqueci minha senha' e siga as instruções para redefini-la."
        },
        {
          question: "Meus dados estão seguros no FastPay?",
          answer: "Sim. O FastPay adota medidas rigorosas de segurança, incluindo criptografia de dados, para proteger suas informações."
        }
      ]
    },
    {
      category: "Pacotes e Planos",
      items: [
        {
          question: "Quais pacotes estão disponíveis?",
          answer: "Oferecemos os pacotes Starter, Token, Miner, e Master, com opções mensais e vitalícias."
        },
        {
          question: "Como faço o upgrade ou downgrade de um plano?",
          answer: "Acesse a aba 'Pacotes' na sua área do cliente e selecione a opção de upgrade ou downgrade."
        },
        {
          question: "Posso fazer downgrade para o plano Free?",
          answer: "Não. O downgrade só é permitido entre pacotes pagos, exceto para o plano Free."
        }
      ]
    },
    {
      category: "Wallet (Carteira Digital)",
      items: [
        {
          question: "Como posso adicionar saldo na minha carteira FastPay?",
          answer: "Clique em 'Depositar' na aba 'Wallet', escolha o método de pagamento e siga as instruções."
        },
        {
          question: "Posso sacar meu saldo em FastCoin?",
          answer: "Sim. Acesse 'Wallet' > 'Saque', insira o valor e o endereço da sua carteira externa."
        },
        {
          question: "Qual é o valor da FastCoin?",
          answer: "O valor da FastCoin é pareado com o dólar americano (1 FASTC = 1 USD)."
        }
      ]
    },
    {
      category: "Programa de Afiliados",
      items: [
        {
          question: "Como funciona o programa de afiliados do FastPay?",
          answer: "Você recebe um código de afiliado exclusivo. Compartilhe com amigos e ganhe comissões de até 6 níveis."
        },
        {
          question: "Onde encontro meu código de afiliado?",
          answer: "Na aba 'Afiliados' da sua área do cliente."
        },
        {
          question: "Como recebo minhas comissões?",
          answer: "As comissões são creditadas automaticamente na sua carteira FastCoin."
        }
      ]
    },
    {
      category: "Earn e Investimentos",
      items: [
        {
          question: "O que é o programa de Earn?",
          answer: "O Earn permite que você bloqueie FastCoins por um período e receba juros de até 9% ao mês."
        },
        {
          question: "Como funciona o bloqueio de saldo para ganhar juros?",
          answer: "Escolha o período de bloqueio (30, 60 ou 90 dias) e o valor que deseja investir. O rendimento é creditado semanalmente."
        }
      ]
    }
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && activeTab === 'tickets') {
      fetchTickets();
    }
  }, [user, activeTab]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_messages (
            id,
            message,
            created_at,
            is_admin,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          user_id: user.id,
          subject: newTicket.subject,
          priority: newTicket.priority,
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: ticket.id,
          user_id: user.id,
          message: newTicket.message,
          is_admin: false,
        }]);

      if (messageError) throw messageError;

      setShowNewTicketForm(false);
      setNewTicket({
        subject: '',
        message: '',
        priority: 'MEDIUM'
      });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Erro ao criar ticket. Tente novamente.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: newMessage,
          is_admin: false,
        }]);

      if (error) throw error;

      setNewMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-emerald-500">Carregando...</div>
      </div>
    );
  }

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

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <MessageSquare className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Central de Suporte</h1>
              <p className="text-gray-400">Tire suas dúvidas ou abra um ticket de suporte</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/32472669126"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Phone size={20} />
              Suporte WhatsApp
            </a>
            {activeTab === 'tickets' && (
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Novo Ticket
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'faq'
                ? 'bg-emerald-500 text-white'
                : 'bg-navy-800 text-gray-400 hover:bg-navy-700'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-emerald-500 text-white'
                : 'bg-navy-800 text-gray-400 hover:bg-navy-700'
            }`}
          >
            Meus Tickets
          </button>
        </div>

        {activeTab === 'faq' ? (
          <div className="space-y-6">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-navy-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">{category.category}</h2>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-navy-700 rounded-lg">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === `${categoryIndex}-${itemIndex}` ? null : `${categoryIndex}-${itemIndex}`)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                      >
                        <span className="font-medium">{item.question}</span>
                        {expandedFaq === `${categoryIndex}-${itemIndex}` ? (
                          <ChevronUp size={20} className="text-emerald-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </button>
                      {expandedFaq === `${categoryIndex}-${itemIndex}` && (
                        <div className="px-4 pb-3 text-gray-400">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Tickets List */}
            <div className="col-span-4">
              <div className="bg-navy-800 rounded-lg p-4">
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-emerald-500'
                          : 'bg-navy-700 hover:bg-navy-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === 'OPEN'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : ticket.status === 'IN_PROGRESS'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className={`font-medium ${
                        selectedTicket?.id === ticket.id ? 'text-white' : ''
                      }`}>
                        {ticket.subject}
                      </h3>
                      <p className={`text-sm ${
                        selectedTicket?.id === ticket.id ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {ticket.ticket_messages?.[0]?.message.substring(0, 50)}...
                      </p>
                    </button>
                  ))}
                  {tickets.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Nenhum ticket encontrado</p>
                      <p>Crie um novo ticket para obter ajuda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-8">
              <div className="bg-navy-800 rounded-lg h-[600px] flex flex-col">
                {selectedTicket ? (
                  <>
                    <div className="p-4 border-b border-navy-700">
                      <h2 className="font-semibold">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Ticket #{selectedTicket.id.substring(0, 8)}</span>
                        <span>•</span>
                        <span>{selectedTicket.status}</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedTicket.ticket_messages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-4 ${
                            message.is_admin ? 'bg-navy-700' : 'bg-emerald-500'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <span className="text-xs text-gray-400 mt-2 block">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-navy-700">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 bg-navy-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="Digite sua mensagem..."
                        />
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Selecione um ticket para ver a conversa</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Ticket Modal */}
        {showNewTicketForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-navy-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-6">Novo Ticket</h2>
              
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-32 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="bg-navy-700 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="px-4 py-2 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Criar Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}