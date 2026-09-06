import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Save, CheckCircle } from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminContent() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [content, setContent] = useState({
    companyDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'website_content');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent({
          companyDescription: docSnap.data().companyDescription || '',
          contactEmail: docSnap.data().contactEmail || '',
          contactPhone: docSnap.data().contactPhone || '',
          contactAddress: docSnap.data().contactAddress || '',
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const docRef = doc(db, 'settings', 'website_content');
      await setDoc(docRef, {
        ...content,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.uid
      }, { merge: true });

      if (currentUser) {
        await logActivity(
          'UPDATED_CONTENT',
          currentUser.uid,
          'website_content',
          'user',
          'Updated global website content'
        );
      }
      setSuccessMessage('Website content updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded"></div>
        <div className="h-96 w-full bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Website Content</h1>
          <p className="text-sm text-slate-500">Manage public-facing business content dynamically</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {successMessage && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              {successMessage}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Global Information</h3>
            <Textarea
              label="Company Description (About Us)"
              rows={5}
              value={content.companyDescription}
              onChange={(e) => setContent({...content, companyDescription: e.target.value})}
              placeholder="Enter the main company description shown on the About page..."
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2 mt-8">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Email"
                type="email"
                value={content.contactEmail}
                onChange={(e) => setContent({...content, contactEmail: e.target.value})}
              />
              <Input
                label="Primary Phone"
                type="tel"
                value={content.contactPhone}
                onChange={(e) => setContent({...content, contactPhone: e.target.value})}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Physical Address"
                rows={3}
                value={content.contactAddress}
                onChange={(e) => setContent({...content, contactAddress: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
