import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Trash2, AlertTriangle, Send, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';

interface Message {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
  user: {
    email: string;
    name: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  user: {
    email: string;
    name: string;
  };
  responses: Array<{
    id: string;
    content: string;
    created_at: string;
    responder: {
      name: string;
      email: string;
    };
  }>;
}

const SupportMessages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'tickets'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [response, setResponse] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    } else {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('admin_messages')
        .select(`
          *,
          user:profiles!admin_messages_user_id_fkey (
            email,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!support_tickets_user_id_fkey (
            email,
            name
          ),
          responses:ticket_responses (
            id,
            content,
            created_at,
            responder:profiles (
              name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'closed',
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      setShowCloseConfirm(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Error closing ticket:', err);
      setError('Erro ao fechar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', selectedTicket.id);

      if (deleteError) throw deleteError;

      setShowDeleteConfirm(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Erro ao excluir ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setLoading(true);
      setError(null);

      // Upload attachments if any
      const attachmentUrls = await Promise.all(
        attachments.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('ticket-attachments')
            .upload(fileName, file);

          if (error) throw error;
          return data.path;
        })
      );

      // Create response
      const { error: responseError } = await supabase
        .from('ticket_responses')
        .insert([{
          ticket_id: selectedTicket.id,
          content: response,
          responder_id: (await supabase.auth.getUser()).data.user?.id,
          attachments: attachmentUrls
        }]);

      if (responseError) throw responseError;

      // Update ticket status
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      // Create notification for user
      const { error: notificationError } = await supabase
        .from('admin_messages')
        .insert([{
          user_id: selectedTicket.user.id,
          title: 'Nova resposta no seu ticket',
          content: response,
          type: 'notification',
          priority: 'medium'
        }]);

      if (notificationError) throw notificationError;

      setResponse('');
      setAttachments([]);
      fetchTickets();
    } catch (err) {
      console.error('Error sending response:', err);
      setError('Erro ao enviar resposta');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Suporte e Mensagens
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messages')}
            className={`${
              activeTab === 'messages'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Mensagens
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`${
              activeTab === 'tickets'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Tickets de Suporte
          </button>
        </nav>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : activeTab === 'messages' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma mensagem encontrada
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {message.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {message.content}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span className="mr-2">
                          Para: {message.user.name || message.user.email}
                        </span>
                        <span>
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      message.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {message.status === 'read' ? 'Lida' : 'Não lida'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {tickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum ticket encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {ticket.subject}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowCloseConfirm(true);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                            title="Fechar Ticket"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-400 hover:text-red-500"
                            title="Excluir Ticket"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {ticket.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        De: {ticket.user.name || ticket.user.email} • {formatDate(ticket.created_at)}
                      </div>

                      {/* Responses */}
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {ticket.responses.map((response) => (
                            <div
                              key={response.id}
                              className="bg-gray-50 p-4 rounded-md"
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-900">
                                  {response.responder.name || response.responder.email}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(response.created_at)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">
                                {response.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Response Form */}
                      {ticket.status !== 'closed' && (
                        <form onSubmit={handleResponse} className="mt-4">
                          <div className="space-y-4">
                            <textarea
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                              rows={3}
                              placeholder="Digite sua resposta..."
                            />
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      setAttachments(files);
                                    }}
                                    className="sr-only"
                                  />
                                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                    <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">
                                      {attachments.length ? `${attachments.length} arquivo(s)` : 'Anexar arquivos'}
                                    </span>
                                  </div>
                                </label>
                              </div>
                              
                              <button
                                type="submit"
                                disabled={!response.trim() || loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {loading ? 'Enviando...' : 'Responder'}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showCloseConfirm}
        title="Fechar Ticket"
        message="Tem certeza que deseja fechar este ticket? Esta ação não pode ser desfeita."
        confirmLabel="Fechar"
        type="warning"
        onConfirm={handleCloseTicket}
        onCancel={() => {
          setShowCloseConfirm(false);
          setSelectedTicket(null);
        }}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Excluir Ticket"
        message="Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        type="danger"
        onConfirm={handleDeleteTicket}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedTicket(null);
        }}
      />
    </div>
  );
};

export default SupportMessages;