import React, { useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Client, Project, Enquiry } from '../../types';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Hash,
  Users,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

interface ExtendedClient extends Client {
  companyName: string;
  industry?: string;
  website?: string;
  taxId?: string;
  address?: string;
  city?: string;
  position?: string;
  notes?: string;
}

export default function AdminClients() {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState<ExtendedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ExtendedClient | null>(null);
  
  // Details Modal State
  const [selectedClientForView, setSelectedClientForView] = useState<ExtendedClient | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [loadingLinkedData, setLoadingLinkedData] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Technology & Software',
    website: '',
    taxId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: 'Client Representative',
    address: '',
    notes: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<ExtendedClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch users with role CLIENT
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'CLIENT')));
      const clientMap = new Map<string, ExtendedClient>();

      usersSnap.forEach(d => {
        const data = d.data();
        const compName = data.companyName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Client Enterprise';
        clientMap.set(d.id, {
          id: d.id,
          ...data,
          companyName: compName,
          role: 'CLIENT',
          isActive: data.isActive ?? true
        } as ExtendedClient);
      });

      // 2. Supplement from clients collection if any documents exist there
      try {
        const dedicatedSnap = await getDocs(collection(db, 'clients'));
        dedicatedSnap.forEach(d => {
          const data = d.data();
          const existing = clientMap.get(d.id);
          if (existing) {
            clientMap.set(d.id, { ...existing, ...data });
          } else {
            clientMap.set(d.id, {
              id: d.id,
              ...data,
              role: 'CLIENT',
              companyName: data.companyName || data.name || 'Client Enterprise',
              isActive: data.isActive ?? true
            } as ExtendedClient);
          }
        });
      } catch (dedErr) {
        console.warn("Notice reading clients dedicated collection:", dedErr);
      }

      const clientList = Array.from(clientMap.values()).sort((a, b) => 
        (a.companyName || '').localeCompare(b.companyName || '')
      );
      setClients(clientList);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setFeedback({ message: "Could not load clients from database.", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Open Create Client Modal
  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      companyName: '',
      industry: 'Technology & Software',
      website: '',
      taxId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: 'Client Representative',
      address: '',
      notes: '',
      isActive: true
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit Client Modal
  const openEditModal = (client: ExtendedClient) => {
    setEditingClient(client);
    setFormData({
      companyName: client.companyName || '',
      industry: client.industry || 'Technology & Software',
      website: client.website || '',
      taxId: client.taxId || '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      position: client.position || 'Client Representative',
      address: client.address || '',
      notes: client.notes || '',
      isActive: client.isActive ?? true
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Details Modal and Load Linked Projects
  const openViewDetails = async (client: ExtendedClient) => {
    setSelectedClientForView(client);
    setLoadingLinkedData(true);
    setClientProjects([]);

    try {
      // Fetch projects matching clientId or clientNameSnapshot
      const projPromise = getDocs(collection(db, 'projects'));
      const projSnap = await projPromise;

      const matchedProjects: Project[] = [];
      projSnap.forEach(d => {
        const data = d.data();
        if (
          data.clientId === client.id || 
          (client.companyName && data.clientNameSnapshot?.toLowerCase() === client.companyName.toLowerCase()) ||
          (client.email && data.clientEmail === client.email)
        ) {
          matchedProjects.push({ id: d.id, ...data } as Project);
        }
      });
      setClientProjects(matchedProjects);

    } catch (err) {
      console.warn("Could not load linked data for client:", err);
    } finally {
      setLoadingLinkedData(false);
    }
  };

  // Save (Create or Update) Client
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanCompany = formData.companyName.trim();
    const cleanFirst = formData.firstName.trim();
    const cleanLast = formData.lastName.trim();

    if (!cleanCompany) {
      setFormError('Please enter a company or client organization name.');
      return;
    }

    if (!cleanFirst || !cleanLast) {
      setFormError('Please provide the contact person first and last name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Please provide a valid official email address.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const clientPayload = {
        companyName: cleanCompany,
        firstName: cleanFirst,
        lastName: cleanLast,
        email: cleanEmail,
        phone: formData.phone.trim(),
        role: 'CLIENT',
        industry: formData.industry,
        website: formData.website.trim(),
        taxId: formData.taxId.trim(),
        position: formData.position.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        isActive: formData.isActive,
        updatedAt: serverTimestamp()
      };

      if (editingClient && editingClient.id) {
        // Update existing Client
        await updateDoc(doc(db, 'users', editingClient.id), clientPayload);
        try {
          await setDoc(doc(db, 'clients', editingClient.id), clientPayload, { merge: true });
        } catch {}

        if (currentUser?.uid) {
          await logActivity('CLIENT_UPDATED', currentUser.uid, editingClient.id, 'user', `Updated client profile for ${cleanCompany}`);
        }

        setFeedback({ message: `Client profile "${cleanCompany}" updated successfully!`, type: 'success' });
      } else {
        // Create new Client
        const docRef = doc(collection(db, 'users'));
        const newClientData = {
          ...clientPayload,
          uid: docRef.id,
          id: docRef.id,
          createdAt: serverTimestamp()
        };

        await setDoc(docRef, newClientData);
        try {
          await setDoc(doc(db, 'clients', docRef.id), newClientData);
        } catch {}

        if (currentUser?.uid) {
          await logActivity('CLIENT_CREATED', currentUser.uid, docRef.id, 'user', `Created client account for ${cleanCompany}`);
        }

        setFeedback({ message: `New client "${cleanCompany}" created and saved to database!`, type: 'success' });
      }

      setIsFormModalOpen(false);
      await fetchClients();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Save client error:", err);
      setFormError(err?.message || 'Failed to save client to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Client Active Status
  const handleToggleStatus = async (client: ExtendedClient) => {
    if (!client.id) return;
    const newStatus = !client.isActive;
    try {
      await updateDoc(doc(db, 'users', client.id), {
        isActive: newStatus,
        updatedAt: serverTimestamp()
      });
      try {
        await updateDoc(doc(db, 'clients', client.id), {
          isActive: newStatus,
          updatedAt: serverTimestamp()
        });
      } catch {}

      setClients(prev => prev.map(c => c.id === client.id ? { ...c, isActive: newStatus } : c));
      setFeedback({ 
        message: `Client "${client.companyName}" marked as ${newStatus ? 'Active' : 'Inactive'}.`, 
        type: 'success' 
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error("Error toggling client status:", err);
      setFeedback({ message: `Failed to update status: ${err?.message}`, type: 'error' });
    }
  };

  // Delete Client
  const executeDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', deleteTarget.id));
      try {
        await deleteDoc(doc(db, 'clients', deleteTarget.id));
      } catch {}

      if (currentUser?.uid) {
        await logActivity('CLIENT_DELETED', currentUser.uid, deleteTarget.id, 'user', `Deleted client ${deleteTarget.companyName}`);
      }

      setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
      if (selectedClientForView?.id === deleteTarget.id) {
        setSelectedClientForView(null);
      }

      setFeedback({ message: `Client "${deleteTarget.companyName}" permanently removed.`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Error deleting client:", err);
      setFeedback({ message: err?.message || 'Failed to delete client record.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    const searchTarget = `${c.companyName} ${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.industry} ${c.taxId}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'ALL' || c.industry === industryFilter;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? c.isActive : !c.isActive);
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  // Calculate Metrics
  const metrics = {
    total: clients.length,
    active: clients.filter(c => c.isActive).length,
    inactive: clients.filter(c => !c.isActive).length,
    industriesCount: new Set(clients.map(c => c.industry).filter(Boolean)).size
  };

  const industriesList = [
    'Technology & Software',
    'Embedded Systems & IoT',
    'AI & Data Science',
    'Healthcare & Biotech',
    'Manufacturing & Industrial',
    'Agriculture & AgriTech',
    'Education & Capstones',
    'Financial Services',
    'Retail & E-Commerce',
    'Government & Public Sector',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
          <p className="text-sm text-slate-500">Manage commercial enterprise accounts, procurement partners, and technical clients</p>
        </div>
        <Button 
          onClick={openCreateModal} 
          className="flex items-center gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </Button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border shadow-sm transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ALL' ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Clients</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
            <span className="text-xs text-slate-400">organizations</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('ACTIVE')}
          className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ACTIVE' ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Active Accounts</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-emerald-700">{metrics.active}</p>
            <span className="text-xs text-emerald-600/70">active partners</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('INACTIVE')}
          className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'INACTIVE' ? 'border-slate-400 ring-2 ring-slate-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inactive / On Hold</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-slate-700">{metrics.inactive}</p>
            <span className="text-xs text-slate-400">accounts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Industries Covered</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-extrabold text-indigo-700">{metrics.industriesCount}</p>
            <span className="text-xs text-indigo-500">domains</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company, contact person, email, phone, GSTIN..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Industry:</span>
              <select
                value={industryFilter}
                onChange={e => setIndustryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="ALL">All Industries</option>
                {industriesList.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Client Organization</th>
                <th className="px-6 py-4">Primary Contact</th>
                <th className="px-6 py-4">Contact Channels</th>
                <th className="px-6 py-4">Industry & Tax ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <span className="text-xs font-medium">Loading client directory...</span>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                      <h3 className="font-bold text-slate-700 text-sm">No clients found</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        {searchTerm ? `No client accounts matching "${searchTerm}".` : 'Add your first enterprise or commercial client.'}
                      </p>
                      <Button size="sm" onClick={openCreateModal} className="flex items-center gap-1.5 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Add Client Now
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Organization Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                          {client.companyName ? client.companyName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => openViewDetails(client)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-sm text-left truncate block max-w-xs transition-colors"
                          >
                            {client.companyName}
                          </button>
                          {client.website && (
                            <a 
                              href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{client.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Primary Contact Person */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 text-sm">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {client.position || 'Contact Person'}
                      </div>
                    </td>

                    {/* Contact Channels */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${client.email}`}
                          className="font-mono text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.email}</span>
                        </a>
                        {client.phone && (
                          <a 
                            href={`tel:${client.phone}`}
                            className="font-mono text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.phone}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Industry & Tax ID */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {client.industry || 'General Industry'}
                      </span>
                      {client.taxId && (
                        <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span>{client.taxId}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(client)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          client.isActive 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${client.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openViewDetails(client)}
                          title="View 360° Profile"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(client)}
                          title="Edit Client"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDeleteTarget(client)}
                          title="Delete Client"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT CLIENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingClient ? 'Edit Client Profile' : 'Add New Client Organization'}
                </h2>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs mb-4 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4">
              {/* Organization Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Organization & Entity Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Legal Name *</label>
                    <Input
                      required
                      placeholder="e.g. GreenAgro Technologies Pvt Ltd"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
                    <select
                      value={formData.industry}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {industriesList.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website URL</label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN / Corporate Tax ID</label>
                    <Input
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      value={formData.taxId}
                      onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Contact Person */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Primary Point of Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <Input
                      required
                      placeholder="e.g. Rajesh"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <Input
                      required
                      placeholder="e.g. Kumar"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email *</label>
                    <Input
                      type="email"
                      required
                      disabled={!!editingClient}
                      placeholder="contact@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / Mobile *</label>
                    <Input
                      type="tel"
                      required
                      placeholder="+91 98400 12345"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role Title</label>
                    <Input
                      placeholder="e.g. Chief Technology Officer / Head of Procurement"
                      value={formData.position}
                      onChange={e => setFormData({ ...formData, position: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address & Notes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing & Registered Address</label>
                  <Input
                    placeholder="Plot 42, Tech Park, Chennai, Tamil Nadu - 600096"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Relationship Notes</label>
                  <Textarea
                    rows={2}
                    placeholder="Contract scope, special delivery SLAs, or preferred billing cycle..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="clientIsActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="clientIsActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Client Account is Active and Enabled for Portal Access
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {editingClient ? 'Update Client' : 'Save Client Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CLIENT 360° DETAILS MODAL */}
      {selectedClientForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0">
                  {selectedClientForView.companyName ? selectedClientForView.companyName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedClientForView.companyName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {selectedClientForView.industry || 'Industry Partner'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedClientForView.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedClientForView.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClientForView(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="py-4 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Primary Representative</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedClientForView.firstName} {selectedClientForView.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{selectedClientForView.position || 'Representative'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Communication Channels</p>
                  <div className="mt-0.5 space-y-1">
                    <a href={`mailto:${selectedClientForView.email}`} className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedClientForView.email}
                    </a>
                    {selectedClientForView.phone && (
                      <a href={`tel:${selectedClientForView.phone}`} className="text-xs font-mono text-slate-600 hover:text-blue-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {selectedClientForView.phone}
                      </a>
                    )}
                  </div>
                </div>

                {selectedClientForView.website && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Official Web Domain</p>
                    <a 
                      href={selectedClientForView.website.startsWith('http') ? selectedClientForView.website : `https://${selectedClientForView.website}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {selectedClientForView.website}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                )}

                {selectedClientForView.taxId && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tax Registration / GSTIN</p>
                    <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
                      {selectedClientForView.taxId}
                    </p>
                  </div>
                )}

                {selectedClientForView.address && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registered Address</p>
                    <p className="text-xs text-slate-700 mt-0.5 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      {selectedClientForView.address}
                    </p>
                  </div>
                )}

                {selectedClientForView.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contract & Operational Notes</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed italic">
                      "{selectedClientForView.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Associated Deliverable Projects */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-2.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Active Commercial Engagements & Projects ({clientProjects.length})
                </h3>
                {loadingLinkedData ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 animate-pulse">
                    Querying associated deliverables...
                  </div>
                ) : clientProjects.length > 0 ? (
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {clientProjects.map(p => (
                      <li key={p.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{p.projectTitle || p.name}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">Code: {p.projectCode || 'N/A'} • Stage: {p.projectStage || p.stage || 'Ongoing'}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                          {p.status || 'Active'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                    No active projects tagged under this client ID yet.
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const toDelete = selectedClientForView;
                  setSelectedClientForView(null);
                  setDeleteTarget(toDelete);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClientForView(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const toEdit = selectedClientForView;
                    setSelectedClientForView(null);
                    openEditModal(toEdit);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Client Organization"
        message={`Are you sure you want to permanently delete client "${deleteTarget?.companyName}" (${deleteTarget?.email})? All associated credentials will be revoked.`}
        confirmLabel="Delete Client"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
