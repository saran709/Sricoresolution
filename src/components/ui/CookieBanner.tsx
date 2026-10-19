import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Check, X } from 'lucide-react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [adCookiesAllowed, setAdCookiesAllowed] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('sricore_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('sricore_cookie_consent', 'accepted');
    localStorage.setItem('sricore_ads_consent', 'true');
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('sricore_cookie_consent', 'essential_only');
    localStorage.setItem('sricore_ads_consent', 'false');
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('sricore_cookie_consent', 'custom');
    localStorage.setItem('sricore_ads_consent', adCookiesAllowed ? 'true' : 'false');
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              Privacy & Cookie Notice
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">Compliance</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We use essential cookies to maintain secure sessions and analyze site telemetry. Third-party partners, including Google LLC, may use cookies to serve personalized or non-personalized advertisements on eligible public pages. You can manage your preferences or read our full disclosures in our{' '}
              <Link to="/privacy" className="text-amber-400 hover:underline font-semibold">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/editorial-policy" className="text-amber-400 hover:underline font-semibold">
                Editorial Standards
              </Link>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-xs px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 font-medium"
          >
            Preferences
          </button>
          <button
            onClick={handleEssentialOnly}
            className="text-xs px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 font-medium"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="text-xs px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors shadow-xs"
          >
            Accept All
          </button>
        </div>
      </div>

      {/* Preferences Drawer */}
      {showPreferences && (
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Strictly Necessary Cookies</p>
              <p className="text-slate-400 text-[11px]">Authentication tokens, form submission security, theme preferences.</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Always Active
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Advertising & Analytics Cookies</p>
              <p className="text-slate-400 text-[11px]">Google AdSense cookies for relevant advertising and visitor metrics.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={adCookiesAllowed} 
                onChange={e => setAdCookiesAllowed(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end pt-1">
            <button
              onClick={handleSavePreferences}
              className="text-xs px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 font-bold transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
