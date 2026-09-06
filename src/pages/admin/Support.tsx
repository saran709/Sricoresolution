import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SupportTicket } from '../../types';
import { Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

const STATUSES: { value: SupportTicket['status']; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'client_confirmation', label: 'Client Confirmation' },
  { value: 'closed', label: 'Closed' }
];

export default function AdminSupport() {
  const { userProfile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: SupportTicket[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as SupportTicket);
      });
      setTickets(items);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticket: SupportTicket, newStatus: SupportTicket['status']) => {
    try {
      if (!ticket.id) return;
      await updateDoc(doc(db, 'support_tickets', ticket.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setTickets(tickets.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
      
      if (userProfile?.uid) {
        await logActivity(
          'TICKET_STATUS_UPDATED',
          userProfile.uid,
          ticket.id,
          'ticket',
          `Support ticket status updated from ${ticket.status} to ${newStatus}`
        );
      }
    } catch (error) {
      console.error("Failed to update ticket status", error);
    }
  };

  const filteredTickets = tickets.filter(t => 
    `${t.subject} ${t.description}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support & Maintenance</h1>
          <p className="text-sm text-slate-500">Manage client support tickets</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tickets by subject..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{ticket.subject}</div>
                      <div className="text-slate-500 text-xs mt-1">Client ID: {ticket.clientId?.slice(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                        ${ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          ticket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.createdAt?.toDate ? new Date(ticket.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <select 
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket, e.target.value as any)}
                        className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-[160px]"
                      >
                        {STATUSES.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
