import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Search, Filter, AlertTriangle, Trash2, RefreshCw, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';
import { useToast } from '../../hooks/useToast';

interface Message {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
  attachments?: string[];
  user: {
    email: string;
    name: string;
  };
}

const MessageCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    type: 'notification',
    priority: 'medium',
    recipients: [] as string[],
    attachments: [] as File[]
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchMessages();

    // Subscribe to message updates
    const subscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages'
        },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedType, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('admin_messages')
        .select(`
          *,
          user:profiles!admin_messages_user_id_fkey (
            email,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Upload attachments first
      const attachmentUrls = await Promise.all(
        newMessage.attachments.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('message-attachments')
            .upload(fileName, file);

          if (error) throw error;
          return data.path;
        })
      );

      // Send message to each recipient
      await Promise.all(
        newMessage.recipients.map(async (userId) => {
          const { error: sendError } = await supabase
            .from('admin_messages')
            .insert({
              user_id: userId,
              title: newMessage.title,
              content: newMessage.content,
              type: newMessage.type,
              priority: newMessage.priority,
              attachments: attachmentUrls
            });

          if (sendError) throw sendError;
        })
      );

      showToast('success', 'Mensagem enviada com sucesso!');
      setShowNewMessage(false);
      setNewMessage({
        title: '',
        content: '',
        type: 'notification',
        priority: 'medium',
        recipients: [],
        attachments: []
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessageId) return;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('admin_messages')
        .delete()
        .eq('id', selectedMessageId);

      if (deleteError) throw deleteError;

      showToast('success', 'Mensagem excluída com sucesso!');
      setShowDeleteConfirm(false);
      setSelectedMessageId(null);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Erro ao excluir mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleClearMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: clearError } = await supabase.rpc('clear_admin_messages');

      if (clearError) throw clearError;

      showToast('success', 'Todas as mensagens foram excluídas!');
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Error clearing messages:', err);
      setError('Erro ao limpar mensagens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            Central de Mensagens
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Tudo
          </button>
          <button
            onClick={() => setShowNewMessage(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Nova Mensagem
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="notification">Notificações</option>
            <option value="alert">Alertas</option>
            <option value="announcement">Comunicados</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhuma mensagem encontrada
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className="hover:bg-gray-50">
                <div className="px-4 py-4">
                  <div className="flex justify-between">
                    <div className="flex-1">
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
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex items-center">
                          <Paperclip className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {message.attachments.length} anexo(s)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setSelectedMessageId(message.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir mensagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nova Mensagem
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Destinatários
                </label>
                <select
                  multiple
                  value={newMessage.recipients}
                  onChange={(e) => {
                    const options = e.target.options;
                    const values = [];
                    for (let i = 0; i < options.length; i++) {
                      if (options[i].selected) {
                        values.push(options[i].value);
                      }
                    }
                    setNewMessage({ ...newMessage, recipients: values });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {/* Add user options here */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Conteúdo
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="notification">Notificação</option>
                    <option value="alert">Alerta</option>
                    <option value="announcement">Comunicado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prioridade
                  </label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Anexos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewMessage({ ...newMessage, attachments: files });
                  }}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-emerald-50 file:text-emerald-700
                    hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.title || !newMessage.content || newMessage.recipients.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Excluir Mensagem"
        message="Tem certeza que deseja excluir esta mensagem?"
        confirmLabel="Excluir"
        type="danger"
        onConfirm={handleDeleteMessage}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedMessageId(null);
        }}
      />

      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Limpar Todas as Mensagens"
        message="Tem certeza que deseja limpar todas as mensagens? Esta ação não pode ser desfeita."
        confirmLabel="Limpar Tudo"
        type="danger"
        onConfirm={handleClearMessages}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default MessageCenter;