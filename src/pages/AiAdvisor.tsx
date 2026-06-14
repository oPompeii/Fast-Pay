import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateAIResponse } from '../lib/openai';
import { 
  ArrowLeft, Send, Bot, Brain, TrendingUp, 
  Coins, RefreshCw, ChevronDown, ChevronUp 
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const INITIAL_MESSAGES = [
  {
    role: 'assistant' as const,
    content: 'Olá! Eu sou seu Assistente Financeiro FastPay, alimentado por GPT-4. Posso ajudar você com análises de mercado, estratégias de investimento e dúvidas sobre criptomoedas. Como posso ajudar hoje?',
    timestamp: new Date()
  }
];

const SUGGESTED_QUESTIONS = [
  "Como começar a investir em criptomoedas?",
  "Qual a melhor estratégia para staking de FastCoin?",
  "Como funciona o programa de afiliados?",
  "Quais são os riscos do mercado cripto?",
  "Como diversificar meu portfólio?",
  "Explique sobre análise técnica",
  "O que são NFTs?",
  "Como funciona a blockchain?"
];

export default function AiAdvisor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || processing) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setProcessing(true);
    setError(null);

    // Add user message
    const updatedMessages = [
      ...messages,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ];
    setMessages(updatedMessages);

    try {
      // Get AI response
      const response = await generateAIResponse(
        updatedMessages.map(m => ({ role: m.role, content: m.content }))
      );

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error('Error processing message:', error);
      setError(error.message || 'Erro ao processar mensagem. Por favor, tente novamente.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.message || 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
    setShowSuggestions(false);
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

        <div className="bg-navy-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <Brain className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assistente Financeiro FastPay</h1>
              <p className="text-gray-400">Análises de mercado e consultoria em criptomoedas alimentadas por GPT-4</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-navy-700 rounded-lg h-[600px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-4">
                      {error}
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'assistant' 
                          ? 'bg-navy-600 flex items-start gap-3' 
                          : 'bg-emerald-500'
                      }`}>
                        {message.role === 'assistant' && (
                          <Bot className="w-5 h-5 mt-1" />
                        )}
                        <div>
                          <p className="whitespace-pre-line">{message.content}</p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-navy-600">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-navy-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Digite sua mensagem..."
                      disabled={processing}
                    />
                    <button
                      type="submit"
                      disabled={processing}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggested Questions */}
              <div className="bg-navy-700 rounded-lg p-4">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <span className="font-semibold">Perguntas Sugeridas</span>
                  {showSuggestions ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {showSuggestions && (
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="w-full text-left p-2 rounded hover:bg-navy-600 transition-colors text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="bg-navy-700 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Recursos Disponíveis</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Análise de Mercado</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <span>Consultoria em Cripto</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-emerald-500" />
                    <span>IA Avançada GPT-4</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-navy-700 rounded-lg p-4">
                <p className="text-xs text-gray-400">
                  Este assistente fornece informações gerais e educacionais. 
                  Não é aconselhamento financeiro. Faça sua própria pesquisa 
                  antes de tomar decisões de investimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}