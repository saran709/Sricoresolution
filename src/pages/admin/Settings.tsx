import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CompanySettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, Building, QrCode, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { logActivity } from '../../lib/activityLogger';
import { DashboardSuspense } from '../../components/ui/DashboardSuspense';

const PermissionConfiguration = React.lazy(() =>
  import('../../components/PermissionConfiguration').then((m) => ({
    default: m.PermissionConfiguration,
  }))
);

export default function AdminSettings() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const { actualRole, simulatedRole } = useRBAC();
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const isAuthorizedAdmin = Boolean(
    currentUser &&
      !currentUser.isAnonymous &&
      userProfile?.uid === currentUser.uid &&
      isAdmin &&
      actualRole === 'ADMIN' &&
      !simulatedRole
  );
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
    if (isAuthorizedAdmin) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthorizedAdmin]);

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
    if (!isAuthorizedAdmin) {
      setErrorMessage('Administrator authorization is required to modify system settings.');
      return;
    }
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

  if (!isAuthorizedAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Administrator Access Required</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          System configuration and permissions can only be viewed or modified by a verified Administrator account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System, RBAC & Enterprise Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure five-role resource CRUD permissions, global business profile, and UPI payment channels
          </p>
        </div>
      </div>

      {/* Dynamic Five-Role & Resource-Level CRUD Permission Configuration Module */}
      <DashboardSuspense variant="panel" moduleName="Permission Configuration">
        <PermissionConfiguration />
      </DashboardSuspense>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Organization settings saved and synced successfully to Firestore!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 rounded-xl flex items-center gap-2 text-sm">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Company Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            Company Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Legal Name</label>
              <Input
                value={settings.companyName || ''}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tax / GSTIN ID</label>
              <Input
                value={settings.taxId || ''}
                onChange={e => setSettings({ ...settings, taxId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Contact Email</label>
              <Input
                type="email"
                value={settings.email || ''}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <Input
                value={settings.phone || ''}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Office Address</label>
              <Input
                value={settings.address || ''}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* UPI QR Payment Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <QrCode className="w-4 h-4 text-blue-600" />
            UPI Direct QR Code & Banking Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">UPI ID / VPA *</label>
              <Input
                required
                placeholder="e.g. sricoresolutions@okhdfcbank"
                value={settings.upiId || ''}
                onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payee Name on UPI</label>
              <Input
                placeholder="e.g. Sricore Solutions Pvt Ltd"
                value={settings.upiName || ''}
                onChange={e => setSettings({ ...settings, upiName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Static QR Image URL (Optional)</label>
              <Input
                placeholder="Leave blank to dynamically encode invoice amounts automatically"
                value={settings.qrCodeUrl || ''}
                onChange={e => setSettings({ ...settings, qrCodeUrl: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Wire Instructions (NEFT / RTGS)</label>
              <textarea
                rows={3}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
