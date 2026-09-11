import React, { useState, useEffect } from 'react';
import { firebaseService } from '../../lib/firebaseService';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Loader } from './Loader';
import { Button } from './Button';
import { Input } from './Input';

interface Column {
  key: string;
  label: string;
  type?: string;
}

interface CrudTableProps {
  title: string;
  sheetName: string;
  columns: Column[];
  filterLogic?: (item: any) => boolean;
}

export function CrudTable({ title, sheetName, columns, filterLogic }: CrudTableProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = firebaseService.subscribeToCollection(sheetName, (data) => {
      if (filterLogic && data) {
        setItems(data.filter(filterLogic));
      } else {
        setItems(data || []);
      }
      setLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sheetName]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      // Auto-populate role if title implies a specific role
      const initialData: any = {};
      if (title.toLowerCase().includes('mentor')) initialData.role = 'MENTOR';
      if (title.toLowerCase().includes('intern')) initialData.role = 'INTERN';
      if (title.toLowerCase().includes('candidate')) initialData.role = 'CANDIDATE';
      setFormData(initialData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        await firebaseService.update(sheetName, editingItem.id, formData);
      } else {
        await firebaseService.create(sheetName, formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save record:", err);
      alert("Failed to save record. Check console for errors.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // confirm removed
    try {
      await firebaseService.remove(sheetName, id);
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-4">{col.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr key={item.id || i} className="hover:bg-slate-50">
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          {String(item[col.key] || '-')}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-800 p-1">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingItem ? 'Edit Record' : 'Add New'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="crud-form" onSubmit={handleSubmit} className="space-y-4">
                {columns.map((col) => (
                  <Input
                    key={col.key}
                    label={col.label}
                    name={col.key}
                    type={col.type || 'text'}
                    value={formData[col.key] || ''}
                    onChange={handleInputChange}
                    required
                  />
                ))}
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" form="crud-form" isLoading={submitting}>
                {editingItem ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
