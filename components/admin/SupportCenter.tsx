import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ConfirmationDialog from '../ConfirmationDialog';

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

const SupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();

    // Subscribe to ticket updates
    const subscription = supabase
      .channel('ticket_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles (
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

      if (ticketsError) throw ticketsError;
      setTickets(tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', selectedTicketId);

      if (deleteError) throw deleteError;

      setTickets(prev => prev.filter(ticket => ticket.id !== selectedTicketId));
      setShowDeleteConfirm(false);
      setSelectedTicketId(null);
      setSelectedTicket(null);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Erro ao excluir ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ... existing header and filters ... */}

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

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhum ticket encontrado
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="hover:bg-gray-50">
                <div className="px-4 py-4">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {ticket.subject}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {ticket.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        De: {ticket.user.name || ticket.user.email}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir ticket"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Excluir Ticket"
        message="Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        type="danger"
        onConfirm={handleDeleteTicket}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedTicketId(null);
        }}
      />
    </div>
  );
};

export default SupportCenter;