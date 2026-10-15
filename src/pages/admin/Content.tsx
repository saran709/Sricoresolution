import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { 
  Save, 
  CheckCircle, 
  Palette, 
  Layout, 
  Megaphone, 
  Building2, 
  Phone, 
  FileText, 
  RotateCcw, 
  Eye, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
  HelpCircle,
  Copy
} from 'lucide-react';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useWebsiteSettings, 
  WebsiteSettings, 
  DEFAULT_WEBSITE_SETTINGS, 
  CoreValueItem, 
  MetricItem 
} from '../../contexts/WebsiteSettingsContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

// Preset color palettes
const COLOR_PRESETS = [
  {
    name: 'CSRi Official Gold (Logo Match)',
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#fffbeb',
    accent: '#f59e0b',
    description: 'Official brand palette calibrated to the CSRi logo emblem & typography'
  },
  {
    name: 'Sricore Royal Blue',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#eff6ff',
    accent: '#3b82f6',
    description: 'Crisp, high-trust engineering blue'
  },
  {
    name: 'Emerald Tech',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    accent: '#10b981',
    description: 'Modern, clean environmental & deep-tech emerald'
  },
  {
    name: 'Cyber Violet',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#f5f3ff',
    accent: '#8b5cf6',
    description: 'Cutting-edge AI and advanced neural aesthetics'
  },
  {
    name: 'Sunset Amber',
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#fffbeb',
    accent: '#f59e0b',
    description: 'High energy, industrial hardware & solar focus'
  },
  {
    name: 'Crimson Enterprise',
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryLight: '#fef2f2',
    accent: '#ef4444',
    description: 'Bold, commanding corporate executive styling'
  },
  {
    name: 'Ocean Teal',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#f0fdfa',
    accent: '#14b8a6',
    description: 'Sleek, algorithmic, precision-engineered teal'
  },
  {
    name: 'Midnight Indigo',
    primary: '#4338ca',
    primaryHover: '#3730a3',
    primaryLight: '#eef2ff',
    accent: '#6366f1',
    description: 'Sophisticated deep indigo for enterprise software'
  },
  {
    name: 'Modern Charcoal',
    primary: '#334155',
    primaryHover: '#1e293b',
    primaryLight: '#f8fafc',
    accent: '#475569',
    description: 'Minimalist industrial monochrome'
  }
];

type ActiveTab = 'theme' | 'announcement' | 'branding' | 'home' | 'about' | 'contact' | 'preview';

export default function AdminContent() {
  const { currentUser } = useAuth();
  const { settings, loading, saveSettings, resetToDefaults } = useWebsiteSettings();

  const [activeTab, setActiveTab] = useState<ActiveTab>('theme');
  const [formData, setFormData] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modals & previews
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Load from context into form state
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handlePresetSelect = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        primary: preset.primary,
        primaryHover: preset.primaryHover,
        primaryLight: preset.primaryLight,
        accent: preset.accent
      }
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const ok = await saveSettings(formData, currentUser?.uid);
      if (ok) {
        if (currentUser) {
          await logActivity(
            'UPDATED_CONTENT',
            currentUser.uid,
            'website_cms',
            'user',
            `Updated website content & theme colors (Primary: ${formData.theme.primary})`
          );
        }
        setSuccessMessage('Website theme, colors & content saved and published across the entire site successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('Failed to save website content. Please check permissions.');
      }
    } catch (err: any) {
      console.error('Error saving content:', err);
      setErrorMessage(err?.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setSaving(true);
    try {
      const ok = await resetToDefaults(currentUser?.uid);
      if (ok) {
        setFormData(DEFAULT_WEBSITE_SETTINGS);
        setSuccessMessage('Successfully reset all website themes and content to official defaults.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage('Failed to reset settings.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error resetting.');
    } finally {
      setSaving(false);
      setIsResetModalOpen(false);
    }
  };

  const handleExportJson = () => {
    setJsonText(JSON.stringify(formData, null, 2));
    setIsJsonModalOpen(true);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setFormData({
        ...DEFAULT_WEBSITE_SETTINGS,
        ...parsed,
        theme: { ...DEFAULT_WEBSITE_SETTINGS.theme, ...parsed.theme },
        announcement: { ...DEFAULT_WEBSITE_SETTINGS.announcement, ...parsed.announcement },
        hero: { ...DEFAULT_WEBSITE_SETTINGS.hero, ...parsed.hero },
        about: { ...DEFAULT_WEBSITE_SETTINGS.about, ...parsed.about },
        contact: { ...DEFAULT_WEBSITE_SETTINGS.contact, ...parsed.contact },
        socials: { ...DEFAULT_WEBSITE_SETTINGS.socials, ...parsed.socials }
      });
      setIsJsonModalOpen(false);
      setSuccessMessage('Configuration imported into editor. Click "Save & Publish" to push changes live.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e: any) {
      alert('Invalid JSON format: ' + e.message);
    }
  };

  // Helpers for Core Values array
  const handleAddCoreValue = () => {
    const newItem: CoreValueItem = {
      id: Date.now().toString(),
      title: 'New Core Value',
      description: 'Describe the guiding philosophy or operational standard.'
    };
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        coreValues: [...(prev.about.coreValues || []), newItem]
      }
    }));
  };

  const handleRemoveCoreValue = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        coreValues: prev.about.coreValues.filter((v) => v.id !== id)
      }
    }));
  };

  const handleUpdateCoreValue = (id: string, field: 'title' | 'description', value: string) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        coreValues: prev.about.coreValues.map((v) => (v.id === id ? { ...v, [field]: value } : v))
      }
    }));
  };

  // Helpers for Metrics array
  const handleUpdateMetric = (id: string, field: keyof MetricItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded"></div>
        <div className="h-96 w-full bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const primaryColor = formData.theme.primary || '#d97706';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website Content & Theme Studio</h1>
              <p className="text-sm text-slate-500">
                Modify entire site colors, typography, page copy, metrics, announcement banner & footer in real-time
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export / Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            leftIcon={<RotateCcw className="w-4 h-4 text-slate-400" />}
          >
            Reset Defaults
          </Button>

          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Save & Publish Live'}
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium text-sm">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <Info className="w-5 h-5 text-red-500 shrink-0" />
          <div className="font-medium text-sm">{errorMessage}</div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-1 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'theme'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeTab === 'theme' ? primaryColor : undefined }}
        >
          <Palette className="w-4 h-4" style={{ color: activeTab === 'theme' ? primaryColor : undefined }} />
          Colors & Theme
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'announcement'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeTab === 'announcement' ? primaryColor : undefined }}
        >
          <Megaphone className="w-4 h-4" style={{ color: activeTab === 'announcement' ? primaryColor : undefined }} />
          Announcement Bar
          {formData.announcement.enabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'branding'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeTab === 'branding' ? primaryColor : undefined }}
        >
          <Building2 className="w-4 h-4" style={{ color: activeTab === 'branding' ? primaryColor : undefined }} />
          Branding & Identity
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'home'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeTab === 'home' ? primaryColor : undefined }}
        >
          <Layout className="w-4 h-4" style={{ color: activeTab === 'home' ? primaryColor : undefined }} />
          Home Page
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'about'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeTab === 'about' ? primaryColor : undefined }}
        >
          <FileText className="w-4 h-4" style={{ color: activeTab === 'about' ? primaryColor : undefined }} />
          About Page & Values
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'contact'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeTab === 'contact' ? primaryColor : undefined }}
        >
          <Phone className="w-4 h-4" style={{ color: activeTab === 'contact' ? primaryColor : undefined }} />
          Contact & Footer
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap ml-auto transition-colors ${
            activeTab === 'preview'
              ? 'border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg'
              : 'border-transparent text-blue-600 hover:text-blue-700'
          }`}
          style={{ borderColor: activeTab === 'preview' ? primaryColor : undefined }}
        >
          <Eye className="w-4 h-4" />
          Interactive Preview
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* TAB 1: THEME & COLORS */}
        {activeTab === 'theme' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900">1-Click Color Palettes</h3>
                <span className="text-xs text-slate-500">Click any preset to apply across the theme</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Choose a pre-tested engineering aesthetic or configure bespoke custom hex values below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = formData.theme.primary.toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <div
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                        isSelected 
                          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-md bg-slate-50/50' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-900">{preset.name}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: preset.primary }} title="Primary" />
                        <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: preset.primaryHover }} title="Primary Hover" />
                        <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: preset.accent }} title="Accent" />
                        <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: preset.primaryLight }} title="Light Tint" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Custom Color Inputs</h3>
              <p className="text-sm text-slate-500 mb-6">Fine-tune the precise HEX color codes for your brand</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Primary Color */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.theme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primary: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer border border-slate-300"
                    />
                    <Input
                      value={formData.theme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primary: e.target.value }
                      })}
                      placeholder="#2563eb"
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Applied to main buttons, highlights, active nav tabs, hero text</span>
                </div>

                {/* Primary Hover Color */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Primary Hover Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.theme.primaryHover}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryHover: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer border border-slate-300"
                    />
                    <Input
                      value={formData.theme.primaryHover}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryHover: e.target.value }
                      })}
                      placeholder="#1d4ed8"
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Used for interactive hover states and active button clicks</span>
                </div>

                {/* Accent Color */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Secondary / Accent
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.theme.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, accent: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer border border-slate-300"
                    />
                    <Input
                      value={formData.theme.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, accent: e.target.value }
                      })}
                      placeholder="#3b82f6"
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Used for secondary badges, subtle borders, and gradients</span>
                </div>

                {/* Light Tint Background */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Light Tint Background
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.theme.primaryLight}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryLight: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer border border-slate-300"
                    />
                    <Input
                      value={formData.theme.primaryLight}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryLight: e.target.value }
                      })}
                      placeholder="#eff6ff"
                      className="font-mono text-sm uppercase"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Used for pill tags, icon container backgrounds, soft cards</span>
                </div>
              </div>
            </div>

            {/* Typography & Corner Radiuses */}
            <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Button & Card Corner Radius</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Subtle (md)', value: 'rounded-md' },
                    { label: 'Modern (xl)', value: 'rounded-xl' },
                    { label: 'Sharp (none)', value: 'rounded-none' }
                  ].map((rad) => (
                    <button
                      key={rad.value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        theme: { ...formData.theme, borderRadius: rad.value as any }
                      })}
                      className={`px-3 py-2 text-xs font-medium border text-center ${rad.value} transition-colors ${
                        formData.theme.borderRadius === rad.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {rad.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Typography & Font Styling</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Inter Sans', value: 'sans' },
                    { label: 'Technical Mono', value: 'mono' },
                    { label: 'Modern Tech', value: 'tech' }
                  ].map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        theme: { ...formData.theme, fontFamily: font.value as any }
                      })}
                      className={`px-3 py-2 text-xs font-medium border rounded-md text-center transition-colors ${
                        formData.theme.fontFamily === font.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANNOUNCEMENT BAR */}
        {activeTab === 'announcement' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm">Top Announcement Bar Status</div>
                <div className="text-xs text-slate-500">
                  Displays an alert or promotion across every public page at the very top of the site.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcement.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    announcement: { ...formData.announcement, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Live banner preview */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Announcement Live Preview</span>
              <div 
                className="w-full py-2.5 px-4 rounded-lg flex items-center justify-between text-xs sm:text-sm font-medium shadow-inner transition-colors"
                style={{ 
                  backgroundColor: formData.announcement.bgColor || primaryColor,
                  color: formData.announcement.textColor || '#ffffff'
                }}
              >
                <span>{formData.announcement.text || 'Announcement message text appears here'}</span>
                {formData.announcement.linkText && (
                  <span className="underline font-bold cursor-pointer hover:opacity-80">
                    {formData.announcement.linkText} →
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Textarea
                  label="Announcement Message Text"
                  rows={2}
                  value={formData.announcement.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    announcement: { ...formData.announcement, text: e.target.value }
                  })}
                  placeholder="e.g. 🚀 Summer 2026 Engineering Internships are now accepting applications! Deadline approaching."
                />
              </div>

              <Input
                label="Call to Action Link Text"
                value={formData.announcement.linkText}
                onChange={(e) => setFormData({
                  ...formData,
                  announcement: { ...formData.announcement, linkText: e.target.value }
                })}
                placeholder="e.g. Apply Now"
              />

              <Input
                label="Destination Link URL"
                value={formData.announcement.linkUrl}
                onChange={(e) => setFormData({
                  ...formData,
                  announcement: { ...formData.announcement, linkUrl: e.target.value }
                })}
                placeholder="e.g. /internships or https://forms.gle/..."
              />

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bar Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.announcement.bgColor}
                    onChange={(e) => setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, bgColor: e.target.value }
                    })}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <Input
                    value={formData.announcement.bgColor}
                    onChange={(e) => setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, bgColor: e.target.value }
                    })}
                    placeholder="#1e40af"
                    className="font-mono text-sm uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.announcement.textColor}
                    onChange={(e) => setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, textColor: e.target.value }
                    })}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-300"
                  />
                  <Input
                    value={formData.announcement.textColor}
                    onChange={(e) => setFormData({
                      ...formData,
                      announcement: { ...formData.announcement, textColor: e.target.value }
                    })}
                    placeholder="#ffffff"
                    className="font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BRANDING & IDENTITY */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Brand Name"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="Sricore Solutions"
              />

              <Input
                label="Official Tagline"
                value={formData.brandTagline}
                onChange={(e) => setFormData({ ...formData, brandTagline: e.target.value })}
                placeholder="Technology Solutions & Services"
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Global Company Description"
                  rows={3}
                  value={formData.brandDescription}
                  onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
                  placeholder="A premier technology partner offering comprehensive solutions..."
                />
              </div>

              <Input
                label="Logo Image URL (relative or https://)"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="/logo.png"
              />

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Logo Preview</span>
                <div className="h-10 p-2 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
                  <img src={formData.logoUrl || '/logo.png'} alt="Preview" className="h-8 object-contain" />
                  <span className="text-xs text-slate-500 font-mono">{formData.logoUrl}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-base font-bold text-slate-900 mb-4">Official Social Media Profiles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn Profile URL"
                  value={formData.socials.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socials: { ...formData.socials, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/company/sricore-solutions"
                />

                <Input
                  label="GitHub Organization URL"
                  value={formData.socials.github}
                  onChange={(e) => setFormData({
                    ...formData,
                    socials: { ...formData.socials, github: e.target.value }
                  })}
                  placeholder="https://github.com/sricore-solutions"
                />

                <Input
                  label="Twitter / X Profile URL"
                  value={formData.socials.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    socials: { ...formData.socials, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/sricoresolutions"
                />

                <Input
                  label="Instagram Profile URL"
                  value={formData.socials.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socials: { ...formData.socials, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/sricoresolutions"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Hero Section Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Hero Pill Badge"
                  value={formData.hero.badge}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, badge: e.target.value }
                  })}
                  placeholder="Professional Technology Services"
                />

                <Input
                  label="Hero Highlight Phrase (Colored)"
                  value={formData.hero.titleHighlight}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, titleHighlight: e.target.value }
                  })}
                  placeholder="Digital Foundations"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Hero Main Heading (First Line)"
                    value={formData.hero.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, title: e.target.value }
                    })}
                    placeholder="Engineering Enterprise"
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Hero Description"
                    rows={3}
                    value={formData.hero.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, description: e.target.value }
                    })}
                    placeholder="Sricore Solutions delivers high-performance software development..."
                  />
                </div>

                <Input
                  label="Primary Button Text"
                  value={formData.hero.primaryCtaText}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, primaryCtaText: e.target.value }
                  })}
                  placeholder="Get a Project Quote"
                />

                <Input
                  label="Primary Button Destination"
                  value={formData.hero.primaryCtaLink}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, primaryCtaLink: e.target.value }
                  })}
                  placeholder="/enquiry"
                />

                <Input
                  label="Secondary Button Text"
                  value={formData.hero.secondaryCtaText}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, secondaryCtaText: e.target.value }
                  })}
                  placeholder="Apply for Internship"
                />

                <Input
                  label="Secondary Button Destination"
                  value={formData.hero.secondaryCtaLink}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, secondaryCtaLink: e.target.value }
                  })}
                  placeholder="/internships"
                />
              </div>
            </div>

            {/* Metrics & Milestones Section */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Homepage Key Metrics (Counters)</h3>
                  <p className="text-xs text-slate-500">Live statistics displayed beneath the Hero section</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {formData.metrics.map((metric, idx) => (
                  <div key={metric.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase">Metric #{idx + 1}</span>
                    <Input
                      label="Value"
                      value={metric.value}
                      onChange={(e) => handleUpdateMetric(metric.id, 'value', e.target.value)}
                      placeholder="120+"
                      className="font-bold text-lg"
                    />
                    <Input
                      label="Label"
                      value={metric.label}
                      onChange={(e) => handleUpdateMetric(metric.id, 'label', e.target.value)}
                      placeholder="Delivered Projects"
                    />
                    <Input
                      label="Subtitle"
                      value={metric.description}
                      onChange={(e) => handleUpdateMetric(metric.id, 'description', e.target.value)}
                      placeholder="Enterprise software"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Monitoring Interface Settings */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Hero Interactive Mock Values</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Monitor Interface Label"
                  value={formData.hero.monitorLabel}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, monitorLabel: e.target.value }
                  })}
                  placeholder="Live Monitoring Interface"
                />

                <Input
                  label="CPU Load % Display"
                  value={formData.hero.cpuLoad}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, cpuLoad: e.target.value }
                  })}
                  placeholder="74%"
                />

                <Input
                  label="Uptime SLA Display"
                  value={formData.hero.uptime}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, uptime: e.target.value }
                  })}
                  placeholder="99.9%"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT PAGE & VALUES */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">About Page Headings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="About Hero Title"
                  value={formData.about.heroTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    about: { ...formData.about, heroTitle: e.target.value }
                  })}
                  placeholder="About Sricore Solutions"
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="About Hero Subtitle / Lead Story"
                    rows={2}
                    value={formData.about.heroSubtitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: { ...formData.about, heroSubtitle: e.target.value }
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Genesis & Company Background Story"
                    rows={3}
                    value={formData.about.story}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: { ...formData.about, story: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Textarea
                    label="Mission Statement"
                    rows={3}
                    value={formData.about.mission}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: { ...formData.about, mission: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Textarea
                    label="Vision Statement"
                    rows={3}
                    value={formData.about.vision}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: { ...formData.about, vision: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Core Values Management */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Core Values & Operational Principles</h3>
                  <p className="text-xs text-slate-500">Displayed in the Core Values card grid on the About page</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddCoreValue}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Core Value
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.about.coreValues.map((val, idx) => (
                  <div key={val.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Value #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoreValue(val.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Value"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      label="Value Title"
                      value={val.title}
                      onChange={(e) => handleUpdateCoreValue(val.id, 'title', e.target.value)}
                      placeholder="Engineering Excellence"
                    />
                    <Textarea
                      label="Description"
                      rows={2}
                      value={val.description}
                      onChange={(e) => handleUpdateCoreValue(val.id, 'description', e.target.value)}
                      placeholder="We maintain the highest standards..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONTACT & FOOTER */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Public Contact Coordinates</h3>
            <p className="text-sm text-slate-500 mb-6">
              Displayed in the Contact page, Footer address section, and automated email footers
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Primary Contact Email"
                type="email"
                value={formData.contact.primaryEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, primaryEmail: e.target.value }
                })}
                placeholder="contact@sricoresolutions.com"
              />

              <Input
                label="Customer Support Email"
                type="email"
                value={formData.contact.supportEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, supportEmail: e.target.value }
                })}
                placeholder="support@sricoresolutions.com"
              />

              <Input
                label="Primary Phone / Hotline"
                value={formData.contact.primaryPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, primaryPhone: e.target.value }
                })}
                placeholder="+91 98402 34567"
              />

              <Input
                label="Alternate Phone / WhatsApp"
                value={formData.contact.altPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, altPhone: e.target.value }
                })}
                placeholder="+91 98402 34568"
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Registered Physical Office Address"
                  rows={2}
                  value={formData.contact.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, address: e.target.value }
                  })}
                  placeholder="Namakkal - 637018, Tamil Nadu, India"
                />
              </div>

              <Input
                label="Standard Working Hours"
                value={formData.contact.workingHours}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, workingHours: e.target.value }
                })}
                placeholder="Monday - Friday: 9:00 AM - 6:30 PM IST"
              />

              <Input
                label="Google Maps Embed URL"
                value={formData.contact.mapEmbedUrl}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, mapEmbedUrl: e.target.value }
                })}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-base font-bold text-slate-900 mb-4">Footer Legal & Copyright</h4>
              <Input
                label="Footer Copyright Text"
                value={formData.footerCopyright}
                onChange={(e) => setFormData({ ...formData, footerCopyright: e.target.value })}
                placeholder="© 2026 Sricore Solutions Pvt Ltd. All rights reserved."
              />
            </div>
          </div>
        )}

        {/* TAB 7: LIVE INTERACTIVE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900">Live Visual Simulation</span>
                <p className="text-xs text-slate-500">
                  See how the header, announcement banner, hero section, and colors look in real-time.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    previewDevice === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  Desktop View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    previewDevice === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile View
                </button>
              </div>
            </div>

            {/* Simulation Canvas Frame */}
            <div className="flex justify-center bg-slate-100 p-4 sm:p-8 rounded-2xl border border-slate-300 overflow-x-auto">
              <div 
                className={`bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                }`}
              >
                {/* Simulated Announcement Bar */}
                {formData.announcement.enabled && formData.announcement.text && (
                  <div 
                    className="py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2"
                    style={{ 
                      backgroundColor: formData.announcement.bgColor || primaryColor, 
                      color: formData.announcement.textColor || '#ffffff' 
                    }}
                  >
                    <span>{formData.announcement.text}</span>
                    {formData.announcement.linkText && (
                      <span className="underline font-bold">{formData.announcement.linkText} →</span>
                    )}
                  </div>
                )}

                {/* Simulated Header */}
                <div className="h-14 px-6 border-b border-slate-200 bg-white/95 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={formData.logoUrl || '/logo.png'} alt="Logo" className="h-7 w-auto object-contain" />
                    <span className="font-bold text-sm tracking-tight text-slate-900">
                      {formData.brandName.split(' ')[0]}
                      <span style={{ color: primaryColor }} className="ml-1">
                        {formData.brandName.split(' ').slice(1).join(' ') || 'SOLUTIONS'}
                      </span>
                    </span>
                  </div>

                  {previewDevice === 'desktop' ? (
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span className="font-semibold" style={{ color: primaryColor }}>Home</span>
                      <span>About</span>
                      <span>Services</span>
                      <span>Internships</span>
                      <span>Contact</span>
                      <button 
                        className="px-3 py-1 rounded text-white text-xs font-semibold shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="w-6 h-4 flex flex-col justify-between">
                      <div className="h-0.5 bg-slate-800 rounded"></div>
                      <div className="h-0.5 bg-slate-800 rounded"></div>
                      <div className="h-0.5 bg-slate-800 rounded"></div>
                    </div>
                  )}
                </div>

                {/* Simulated Hero Section */}
                <div className="p-6 sm:p-10 bg-slate-50 border-b border-slate-200">
                  <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                    <div 
                      className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {formData.hero.badge || 'Professional Technology Services'}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {formData.hero.title}{' '}
                      <span style={{ color: primaryColor }}>
                        {formData.hero.titleHighlight}
                      </span>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                      {formData.hero.description}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button 
                        className="px-4 py-2 rounded text-xs font-semibold text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {formData.hero.primaryCtaText}
                      </button>

                      <button 
                        className="px-4 py-2 rounded text-xs font-semibold border"
                        style={{ color: primaryColor, borderColor: primaryColor }}
                      >
                        {formData.hero.secondaryCtaText}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Metric Badges */}
                <div className="p-4 sm:p-6 bg-white border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.metrics.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                      <div className="text-lg font-bold" style={{ color: primaryColor }}>{m.value}</div>
                      <div className="text-[11px] font-semibold text-slate-800">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Simulated Footer */}
                <div className="bg-slate-900 text-slate-400 p-6 text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
                  <span>{formData.footerCopyright}</span>
                  <div className="flex gap-3">
                    <span>{formData.contact.primaryEmail}</span>
                    <span>•</span>
                    <span>{formData.contact.primaryPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button in Panel Footer */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Changes take effect immediately across all visitors and pages once published.</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setActiveTab('preview')}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {activeTab === 'preview' ? 'In Preview Mode' : 'Preview Changes'}
            </Button>

            <Button
              type="button"
              size="md"
              disabled={saving}
              onClick={() => handleSave()}
              className="flex items-center gap-2 text-white px-6"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Publishing Live...' : 'Publish Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Defaults */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset All Website Settings to Defaults?"
        message="This will overwrite all customized brand colors, announcement message, hero copy, and contact data back to Sricore Solutions standard templates. Are you sure you wish to proceed?"
        confirmText="Yes, Reset to Defaults"
        confirmVariant="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Export / Import Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Website Configuration Backup</h3>
                <p className="text-xs text-slate-500">Copy this JSON configuration to back it up or paste valid JSON to restore.</p>
              </div>
              <button 
                onClick={() => setIsJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <Textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="font-mono text-xs"
              placeholder="Paste valid JSON configuration here..."
            />

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(jsonText);
                  alert('Copied JSON to clipboard!');
                }}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Copy to Clipboard
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJsonModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImportJson}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Load into Editor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
