import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Vendor } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function Vendors() {
  const { currentUser } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    servicesProvided: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'vendors'));
      setVendors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vendor)));
    } catch (err) {
      console.error("Failed to load vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      servicesProvided: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vendor) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      contactPerson: v.contactPerson,
      email: v.email,
      phone: v.phone,
      servicesProvided: v.servicesProvided
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a vendor company name.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingVendor && editingVendor.id) {
        await updateDoc(doc(db, 'vendors', editingVendor.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        if (currentUser) {
          await logActivity('UPDATE_VENDOR', currentUser.uid, editingVendor.id, 'user', `Updated vendor: ${formData.name}`);
        }
      } else {
        const docRef = await addDoc(collection(db, 'vendors'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        if (currentUser) {
          await logActivity('CREATE_VENDOR', currentUser.uid, docRef.id, 'user', `Added vendor: ${formData.name}`);
        }
      }
      setIsModalOpen(false);
      fetchVendors();
    } catch (err: any) {
      console.error("Error saving vendor:", err);
      setError(err?.message || 'Failed to save vendor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v: Vendor) => {
    if (!v.id) return;
    if (!confirm(`Delete vendor record for "${v.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'vendors', v.id));
      if (currentUser) {
        await logActivity('DELETE_VENDOR', currentUser.uid, v.id, 'user', `Deleted vendor: ${v.name}`);
      }
      fetchVendors();
    } catch (err) {
      console.error("Failed to delete vendor:", err);
      alert("Failed to delete vendor.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-sm text-slate-500">Manage hardware component suppliers, cloud providers, and contracted service partners</p>
        </div>
        <Button className="flex items-center gap-2" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            Loading vendors...
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500 p-8">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No vendors registered yet</p>
            <p className="text-sm text-slate-500 mt-1">Add hardware component distributors, PCB manufacturers or external cloud vendors.</p>
            <Button size="sm" className="mt-4" onClick={openAddModal}>Register First Vendor</Button>
          </div>
        ) : (
          vendors.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(v)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-50"
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(v)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900">{v.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Contact: {v.contactPerson || 'General'}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  {v.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.email}</span>
                    </div>
                  )}
                  {v.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{v.phone}</span>
                    </div>
                  )}
                  {v.servicesProvided && (
                    <div className="flex items-start gap-2 pt-1 text-slate-700">
                      <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{v.servicesProvided}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Vendor Name *</label>
                <Input
                  required
                  placeholder="e.g. DigiKey Electronics / AWS Cloud"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="sales@vendor.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <Input
                    placeholder="+91-..."
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Services / Goods Provided</label>
                <textarea
                  rows={2}
                  placeholder="e.g. PCB fabrication, microcontrollers, IoT sensor modules"
                  value={formData.servicesProvided}
                  onChange={e => setFormData({ ...formData, servicesProvided: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
