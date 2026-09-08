import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Project, SupportTicket, Invoice, Document as AppDocument } from '../../../types';
import { MessageSquare, Briefcase, FileText, CheckCircle, Clock, LifeBuoy, CreditCard, FolderOpen, Download, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { logActivity } from '../../../lib/activityLogger';
import { CheckoutButton } from '../../../components/payments/CheckoutButton';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { userProfile } = useAuth();
  const [solutionRequests, setSolutionRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'solution_requests' | 'support' | 'invoices' | 'documents'>('overview');
  
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const fetchData = async () => {
      try {
        const srQuery = query(collection(db, 'solutionRequests'), where('userId', '==', userProfile.uid));
        const srSnap = await getDocs(srQuery);
        setSolutionRequests(srSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const projQuery = query(collection(db, 'projects'), where('clientId', '==', userProfile.uid));
        const projSnap = await getDocs(projQuery);
        setProjects(projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        
        const tickQuery = query(collection(db, 'supportTickets'), where('clientId', '==', userProfile.uid));
        const tickSnap = await getDocs(tickQuery);
        setTickets(tickSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket)));
        
        const invQuery = query(collection(db, 'invoices'), where('clientId', '==', userProfile.uid));
        const invSnap = await getDocs(invQuery);
        setInvoices(invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
        
        const docQuery = query(collection(db, 'documents'), where('ownerId', '==', userProfile.uid));
        const docSnap = await getDocs(docQuery);
        setDocuments(docSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppDocument)));
        
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userProfile]);

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
      const docRef = await addDoc(collection(db, 'supportTickets'), data);
      
      await logActivity(
        'SUPPORT_TICKET_CREATED',
        userProfile.uid,
        docRef.id,
        'ticket',
        `Client created support ticket: ${data.subject}`
      );
      
      setTickets([...tickets, { id: docRef.id, ...data } as SupportTicket]);
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
        <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Project Passport</button>
        <button onClick={() => setActiveTab('solution_requests')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'solution_requests' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Solution Requests</button>
        <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'invoices' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Invoices</button>
        <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Documents</button>
        <button onClick={() => setActiveTab('support')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'support' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Support Tickets</button>
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
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab('solution_requests')}>
              <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Solution Requests</p>
                <p className="text-2xl font-bold text-slate-900">{solutionRequests.length}</p>
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
                <p className="text-2xl font-bold text-slate-900">{tickets.filter(t => t.status === 'open').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Have a new problem to solve?</h3>
              <p className="text-blue-700">Submit a new solution request to our engineering team.</p>
            </div>
            <Link to="/tell-us-your-problem">
              <Button className="bg-blue-600 hover:bg-blue-700">Tell Us Your Problem</Button>
            </Link>
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
                        <Zap className="w-3 h-3" />
                        Project Passport
                      </div>
                      <h2 className="text-2xl font-bold">{project.name}</h2>
                      <p className="text-slate-400 mt-1">{project.description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Milestones & Progress</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {/* Simulated Milestones */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900">Discovery Phase</h4>
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span>
                        </div>
                        <p className="text-sm text-slate-500">Initial technical audit and requirement gathering completed.</p>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900">Architecture & Design</h4>
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">In Progress</span>
                        </div>
                        <p className="text-sm text-slate-500">Drafting system architecture and infrastructure requirements.</p>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm opacity-60">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900">Development</h4>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Upcoming</span>
                        </div>
                        <p className="text-sm text-slate-500">Core engineering and sprint execution.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Projects</h3>
              <p className="text-slate-500 mb-6">You don't have any active projects right now.</p>
              <Link to="/tell-us-your-problem">
                <Button>Tell Us Your Problem</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'solution_requests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">My Solution Requests</h2>
            <Link to="/tell-us-your-problem">
              <Button size="sm">New Request</Button>
            </Link>
          </div>
          <div className="p-0">
            {solutionRequests.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {solutionRequests.map(req => (
                  <li key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-900 text-lg">{req.requestId}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${req.status === 'NEW' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{req.problem}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Submitted: {req.createdAt?.toDate ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
                      <span>Industry: {req.industry}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Solution Requests</h3>
                <p>You haven't submitted any problems for us to solve.</p>
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
                  <li key={invoice.id} className="p-6 hover:bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-slate-900">{invoice.title || `Invoice #${invoice.invoiceNumber || invoice.id}`}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize                          ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :                            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :                            'bg-amber-100 text-amber-700'}`}                        >                          {invoice.status}                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Due: {invoice.dueDate?.toDate ? new Date(invoice.dueDate.toDate()).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-xl font-bold text-slate-900">${(invoice.total || invoice.amount || 0).toLocaleString()}</span>
                      {invoice.status !== 'paid' && (
                        <CheckoutButton
                          amount={invoice.total || invoice.amount}
                          purpose={`Payment for Invoice ${invoice.invoiceNumber || invoice.id}`}
                          referenceId={invoice.id!}
                          referenceType="service"
                          onSuccess={() => {
                            setInvoices(invoices.map(i => i.id === invoice.id ? {...i, status: 'paid'} : i));
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
