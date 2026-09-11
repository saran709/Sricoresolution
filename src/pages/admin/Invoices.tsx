import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Invoice, CompanySettings, Client } from '../../types';
import { FileText, Plus, Search, Settings, FileDown, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminInvoices() {
  const { userProfile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'settings'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Invoice State
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    items: [{ description: '', quantity: 1, amount: 0 }],
    status: 'draft',
    taxRate: 18, // Default 18% GST for India
  });

  // Settings State
  const [newSettings, setNewSettings] = useState<Partial<CompanySettings>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invSnap, clientSnap, settingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'users'))), // Need to filter by role=client ideally, getting all for now
        getDoc(doc(db, 'settings', 'company_billing'))
      ]);

      setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
      
      const allUsers = clientSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setClients(allUsers.filter(u => u.role === 'CLIENT' || u.role === 'client'));
      
      if (settingsSnap.exists()) {
        const s = settingsSnap.data() as CompanySettings;
        setSettings(s);
        setNewSettings(s);
      }
    } catch (error) {
      console.error("Error fetching invoice data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.clientId || !newInvoice.items || newInvoice.items.length === 0) return;

    try {
      const subtotal = newInvoice.items.reduce((sum, item) => sum + ((item.quantity || 1) * (item.amount || 0)), 0);
      const taxAmount = Math.round((subtotal * ((newInvoice.taxRate || 0) / 100)) * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const invoiceToSave: Omit<Invoice, 'id'> = {
        ...newInvoice as Invoice,
        invoiceNumber,
        amount: subtotal, // Store base amount
        subtotal,
        taxAmount,
        total,
        issueDate: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'invoices'), invoiceToSave);
      
      if (userProfile?.uid) {
        await logActivity('INVOICE_CREATED', userProfile.uid, docRef.id, 'payment', `Generated invoice ${invoiceNumber} for ${total}`);
      }

      setNewInvoice({ items: [{ description: '', quantity: 1, amount: 0 }], status: 'draft', taxRate: 18 });
      setActiveTab('list');
      fetchData();
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'company_billing'), newSettings);
      setSettings(newSettings as CompanySettings);
      alert('Settings updated successfully');
      
      if (userProfile?.uid) {
        await logActivity('SETTINGS_UPDATED', userProfile.uid, 'company_billing', 'user', `Updated company billing settings`);
      }
    } catch (error) {
      console.error("Error saving settings", error);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">Manage billing and receipts</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'list' ? 'primary' : 'outline'} onClick={() => setActiveTab('list')}>
            All Invoices
          </Button>
          <Button variant={activeTab === 'create' ? 'primary' : 'outline'} onClick={() => setActiveTab('create')}>
            <Plus className="w-4 h-4 mr-2" /> Generate
          </Button>
          <Button variant={activeTab === 'settings' ? 'primary' : 'outline'} onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.clientId);
                  return (
                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">{client?.firstName} {client?.lastName} ({client?.companyName})</td>
                      <td className="px-6 py-4">
                        {inv.issueDate?.toDate ? new Date(inv.issueDate.toDate()).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">₹{inv.total?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                          ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 'sent' ? 'bg-amber-100 text-amber-700' :
                            inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm">
                          <FileDown className="w-4 h-4 mr-1" /> PDF
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Create New Invoice</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md"
                value={newInvoice.clientId || ''}
                onChange={e => setNewInvoice({...newInvoice, clientId: e.target.value})}
              >
                <option value="">Select a Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.companyName})</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Items</label>
              {newInvoice.items?.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Description" 
                      className="w-full p-2 border border-slate-300 rounded-md"
                      value={item.description}
                      onChange={e => {
                        const newItems = [...(newInvoice.items || [])];
                        newItems[index].description = e.target.value;
                        setNewInvoice({...newInvoice, items: newItems});
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      placeholder="Qty" 
                      className="w-full p-2 border border-slate-300 rounded-md"
                      value={item.quantity}
                      onChange={e => {
                        const newItems = [...(newInvoice.items || [])];
                        newItems[index].quantity = Number(e.target.value);
                        setNewInvoice({...newInvoice, items: newItems});
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      className="w-full p-2 border border-slate-300 rounded-md"
                      value={item.amount}
                      onChange={e => {
                        const newItems = [...(newInvoice.items || [])];
                        newItems[index].amount = Number(e.target.value);
                        setNewInvoice({...newInvoice, items: newItems});
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNewInvoice({...newInvoice, items: [...(newInvoice.items || []), {description: '', quantity: 1, amount: 0}]})}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={newInvoice.taxRate}
                  onChange={e => setNewInvoice({...newInvoice, taxRate: Number(e.target.value)})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  onChange={e => setNewInvoice({...newInvoice, dueDate: new Date(e.target.value)})}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 mt-6 flex justify-end">
              <Button onClick={handleCreateInvoice} disabled={!newInvoice.clientId}>
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Company Billing Information</h2>
          <p className="text-sm text-slate-500 mb-6">This information will be displayed on all generated invoices and receipts.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-md"
                value={newSettings.companyName || ''}
                onChange={e => setNewSettings({...newSettings, companyName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Legal Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded-md"
                value={newSettings.legalName || ''}
                onChange={e => setNewSettings({...newSettings, legalName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-md"
                rows={3}
                value={newSettings.address || ''}
                onChange={e => setNewSettings({...newSettings, address: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={newSettings.email || ''}
                  onChange={e => setNewSettings({...newSettings, email: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={newSettings.phone || ''}
                  onChange={e => setNewSettings({...newSettings, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID (e.g. GSTIN)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded-md"
                  value={newSettings.taxId || ''}
                  onChange={e => setNewSettings({...newSettings, taxId: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Details (For NEFT/RTGS)</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-md"
                rows={3}
                value={newSettings.bankDetails || ''}
                onChange={e => setNewSettings({...newSettings, bankDetails: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-md"
                rows={2}
                value={newSettings.termsAndConditions || ''}
                onChange={e => setNewSettings({...newSettings, termsAndConditions: e.target.value})}
              />
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-200 mt-6">
              <Button onClick={handleUpdateSettings}>Save Settings</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
