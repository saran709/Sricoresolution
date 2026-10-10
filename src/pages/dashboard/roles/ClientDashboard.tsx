import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Enquiry, Project, SupportTicket, Invoice, Payment, Document as AppDocument } from '../../../types';
import { MessageSquare, Briefcase, FileText, CheckCircle, Clock, LifeBuoy, CreditCard, FolderOpen, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';

import { CheckoutButton } from '../../../components/payments/CheckoutButton';

import { useClientDashboard } from '../../../hooks/useDashboardQueries';
import { queryClient } from '../../../lib/queryClient';

export default function ClientDashboard() {
  const { userProfile } = useAuth();
  const { data, isLoading: loading } = useClientDashboard(userProfile?.uid);

  const enquiries = data?.enquiries || [];
  const projects = data?.projects || [];
  const tickets = data?.tickets || [];
  const invoices = data?.invoices || [];
  const documents = data?.documents || [];
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'enquiries' | 'support' | 'invoices' | 'documents'>('overview');
  
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    
    setIsSubmittingTicket(true);
    const formData = new FormData(e.currentTarget);
    const data: Omit<SupportTicket, 'id'> = {
      clientId: userProfile.uid,
      projectId: formData.get('projectId') as string || '',
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      status: 'open',
      priority: formData.get('priority') as any || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    try {
      const docRef = await addDoc(collection(db, 'support_tickets'), data);
      
      await logActivity(
        'SUPPORT_TICKET_CREATED',
        userProfile.uid,
        docRef.id,
        'ticket',
        `Client created support ticket: ${data.subject}`
      );
      
      queryClient.invalidateQueries({ queryKey: ['client-dashboard', userProfile.uid] });
      setShowNewTicketForm(false);
    } catch (err) {
      console.error("Error creating ticket:", err);
      alert("Failed to create ticket.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Overview</button>
        <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>My Projects</button>
        <button onClick={() => setActiveTab('enquiries')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'enquiries' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Enquiries</button>
        <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'invoices' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Invoices</button>
        <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Documents</button>
        <button onClick={() => setActiveTab('support')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'support' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Support</button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('projects')}>
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active Projects</p>
                <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab('enquiries')}>
              <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">My Enquiries</p>
                <p className="text-2xl font-bold text-slate-900">{enquiries.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setActiveTab('invoices')}>
              <div className="p-4 rounded-lg bg-indigo-50 text-indigo-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-slate-900">{invoices.filter(i => i.status !== 'paid').length}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setActiveTab('support')}>
              <div className="p-4 rounded-lg bg-amber-50 text-amber-600">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Open Tickets</p>
                <p className="text-2xl font-bold text-slate-900">{tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 text-center">
            <h3 className="font-semibold text-slate-900 mb-2">Need a new solution?</h3>
            <p className="text-slate-500 text-sm mb-4">Start a conversation with our team to get a project estimate.</p>
            <Button onClick={() => window.location.href = '/enquiry'}>Start New Enquiry</Button>
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">My Projects</h2>
          </div>
          <div className="p-0">
            {projects.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {projects.map(project => (
                  <li key={project.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-slate-900">{project.name}</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {project.projectType}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{project.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5
                          ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'}`}
                        >
                          {project.status === 'active' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stage</p>
                        <p className="text-sm text-slate-900 font-semibold mt-1 bg-white inline-block px-3 py-1 rounded-md border border-slate-200">
                          {project.stage ? project.stage.replace(/_/g, ' ').toUpperCase() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</p>
                        <p className="text-sm text-slate-900 font-medium mt-1">
                          {project.startDate?.toDate ? new Date(project.startDate.toDate()).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Project ID</p>
                        <p className="text-sm text-slate-900 font-mono mt-1">{project.id}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No active projects</h3>
                <p className="text-slate-500">You don't have any active projects with us yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">My Enquiries</h2>
            <Button size="sm" onClick={() => window.location.href = '/enquiry'}>New Enquiry</Button>
          </div>
          <div className="p-0">
            {enquiries.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {enquiries.map(enq => (
                  <li key={enq.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 capitalize text-lg">{enq.serviceInterest}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{enq.enquiryType || 'commercial'}</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium
                        ${enq.status === 'NEW' ? 'bg-amber-100 text-amber-700' :
                          enq.status === 'QUALIFIED' || enq.status === 'PROPOSAL' ? 'bg-blue-100 text-blue-700' :
                          enq.status === 'CONVERTED' || enq.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {String(enq.status).replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{enq.projectDetails || enq.message || ''}</p>
                    </div>
                    <div className="flex gap-6 mt-4 text-sm text-slate-500">
                      <p>Submitted: {enq.createdAt?.toDate ? new Date(enq.createdAt.toDate()).toLocaleDateString() : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No enquiries</h3>
                <p className="text-slate-500 mb-4">You haven't submitted any project enquiries yet.</p>
                <Button onClick={() => window.location.href = '/enquiry'}>Submit Enquiry</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Invoices & Payments</h2>
          </div>
          <div className="p-0">
            {invoices.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {invoices.map(invoice => (
                  <li key={invoice.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">Invoice #{invoice.id?.substring(0, 8)}</h3>
                      <p className="text-sm text-slate-500 mt-1">Due: {invoice.dueDate?.toDate ? new Date(invoice.dueDate.toDate()).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xl font-bold text-slate-900">${invoice.amount?.toFixed(2) || '0.00'}</p>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium uppercase tracking-wider
                        ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'}`}
                      >
                        {invoice.status}
                      </span>
                      {invoice.status !== 'paid' && (
                        <CheckoutButton
                          amount={invoice.total || invoice.amount}
                          purpose={`Payment for Invoice ${invoice.invoiceNumber || invoice.id}`}
                          referenceId={invoice.id!}
                          referenceType="service"
                          onSuccess={() => {
                            if (userProfile?.uid) {
                              queryClient.invalidateQueries({ queryKey: ['client-dashboard', userProfile.uid] });
                            }
                          }}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No invoices</h3>
                <p>You have no active invoices or payment requests.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">My Documents</h2>
            <Button size="sm" variant="outline">Upload File</Button>
          </div>
          <div className="p-0">
            {documents.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <li key={doc.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{doc.documentType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents</h3>
                <p>No project files, agreements, or requirements uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Support Tickets</h2>
            <Button size="sm" onClick={() => setShowNewTicketForm(!showNewTicketForm)}>
              {showNewTicketForm ? 'Cancel' : 'New Ticket'}
            </Button>
          </div>
          
          {showNewTicketForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <form onSubmit={handleCreateTicket} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Related Project (Optional)
                  </label>
                  <select name="projectId" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                    <option value="">-- None --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <Input label="Subject" name="subject" required placeholder="Brief description of the issue" />
                
                <Textarea 
                  label="Detailed Description" 
                  name="description" 
                  required 
                  placeholder="Please provide as much detail as possible..."
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select name="priority" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <Button type="submit" isLoading={isSubmittingTicket}>Submit Ticket</Button>
              </form>
            </div>
          )}
          
          <div className="p-0">
            {tickets.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <li key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 text-lg">{ticket.subject}</h3>
                        <p className="text-xs font-mono text-slate-500 mt-1">ID: {ticket.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider
                          ${ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            ticket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'}`}
                        >
                          {ticket.priority}
                        </span>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium
                          ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                            ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'}`}
                        >
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-100 mt-2">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                    <div className="flex gap-6 mt-4 text-sm text-slate-500">
                      <p>Created: {ticket.createdAt?.toDate ? new Date(ticket.createdAt.toDate()).toLocaleDateString() : ''}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No support tickets</h3>
                <p className="text-slate-500 mb-4">You have no active support tickets.</p>
                <Button variant="outline" onClick={() => setShowNewTicketForm(true)}>Open a Ticket</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
