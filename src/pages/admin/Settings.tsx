import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CompanySettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, Save, Building, QrCode, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function AdminSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Sricore Solutions',
    address: 'Namakkal - 637018, Tamil Nadu, India',
    email: 'contact@sricoresolutions.com',
    phone: '+91 98402 34567',
    taxId: '',
    bankDetails: '',
    termsAndConditions: 'Payment is due within 15 days of invoice date.',
    upiId: '',
    upiName: 'Sricore Solutions',
    qrCodeUrl: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'company_billing'));
      if (snap.exists()) {
        setSettings(prev => ({ ...prev, ...snap.data() } as CompanySettings));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMessage('');
    try {
      await setDoc(doc(db, 'settings', 'company_billing'), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (currentUser) {
        await logActivity('UPDATE_SETTINGS', currentUser.uid, 'company_billing', 'system', 'Updated enterprise organization and billing settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setErrorMessage(err?.message || "Failed to save settings to database.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System & Enterprise Settings</h1>
          <p className="text-sm text-slate-500">Configure global business profile, UPI payment channels and invoice headers</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Organization settings saved and synced successfully to Firestore!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 text-sm">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            Company Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <Input
                value={settings.companyName || ''}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax / GSTIN ID</label>
              <Input
                value={settings.taxId || ''}
                onChange={e => setSettings({ ...settings, taxId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Email</label>
              <Input
                type="email"
                value={settings.email || ''}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <Input
                value={settings.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Office Address</label>
              <Input
                value={settings.address || ''}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* UPI QR Payment Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <QrCode className="w-4 h-4 text-blue-600" />
            UPI Direct QR Code & Banking Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID / VPA *</label>
              <Input
                required
                placeholder="e.g. sricoresolutions@okhdfcbank"
                value={settings.upiId || ''}
                onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payee Name on UPI</label>
              <Input
                placeholder="e.g. Sricore Solutions Pvt Ltd"
                value={settings.upiName || ''}
                onChange={e => setSettings({ ...settings, upiName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Static QR Image URL (Optional)</label>
              <Input
                placeholder="Leave blank to dynamically encode invoice amounts automatically"
                value={settings.qrCodeUrl || ''}
                onChange={e => setSettings({ ...settings, qrCodeUrl: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Wire Instructions (NEFT / RTGS)</label>
              <textarea
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                value={settings.bankDetails || ''}
                onChange={e => setSettings({ ...settings, bankDetails: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} className="flex items-center gap-2 px-6">
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
