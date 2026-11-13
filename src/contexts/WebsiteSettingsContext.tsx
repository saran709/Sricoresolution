import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { APP_CONFIG } from '../config';

export interface ThemeColors {
  primary: string;           // e.g. '#2563eb'
  primaryHover: string;      // e.g. '#1d4ed8'
  primaryLight: string;      // e.g. '#eff6ff'
  accent: string;            // e.g. '#3b82f6'
  headerBg: 'light' | 'dark' | 'brand' | 'glass';
  heroBg: 'subtle' | 'gradient' | 'white' | 'dark';
  footerBg: 'dark' | 'midnight' | 'brand' | 'slate';
  borderRadius: 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full';
  fontFamily: 'sans' | 'mono' | 'tech';
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  linkText: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  monitorLabel: string;
  uptime: string;
  cpuLoad: string;
  statsBadges: string[];
}

export interface MetricItem {
  id: string;
  value: string;
  label: string;
  description: string;
}

export interface CoreValueItem {
  id: string;
  title: string;
  description: string;
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  story: string;
  mission: string;
  vision: string;
  coreValues: CoreValueItem[];
}

export interface ServicesContent {
  heroTitle: string;
  heroSubtitle: string;
  introDescription: string;
}

export interface ContactInfo {
  primaryEmail: string;
  supportEmail: string;
  primaryPhone: string;
  altPhone: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string;
}

export interface SocialLinks {
  linkedin: string;
  twitter: string;
  github: string;
  instagram: string;
  youtube: string;
}

export interface WebsiteSettings {
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  logoUrl?: string;
  theme: ThemeColors;
  announcement: AnnouncementSettings;
  hero: HeroContent;
  metrics: MetricItem[];
  about: AboutContent;
  services: ServicesContent;
  contact: ContactInfo;
  socials: SocialLinks;
  footerCopyright: string;
  updatedAt?: any;
  updatedBy?: string;
}

export function normalizeBrandName(raw?: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return 'Sricore Solutions';
  if (/^sri\s*core\s*solutions$/i.test(trimmed)) {
    return 'Sricore Solutions';
  }
  return trimmed;
}

export function formatBrandParts(raw?: string): { primary: string; accent: string } {
  const normalized = normalizeBrandName(raw);
  if (/^sricore\s+solutions$/i.test(normalized)) {
    return { primary: 'SRICORE', accent: 'SOLUTIONS' };
  }
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      primary: parts[0],
      accent: parts.slice(1).join(' '),
    };
  }
  // Single word that isn't Sricore Solutions: don't append duplicate SOLUTIONS if it already ends with solutions
  if (/solutions$/i.test(normalized) && normalized.length > 9) {
    const prefix = normalized.slice(0, normalized.length - 9).trim();
    return {
      primary: prefix || normalized,
      accent: prefix ? 'SOLUTIONS' : '',
    };
  }
  return { primary: normalized, accent: '' };
}

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  brandName: normalizeBrandName(APP_CONFIG.company.name),
  brandTagline: APP_CONFIG.company.tagline || 'Technology Solutions & Services',
  brandDescription: APP_CONFIG.company.description || 'A premier technology partner offering comprehensive solutions in software, hardware, AI/ML, and research.',
  logoUrl: '/logo.png',
  theme: {
    primary: '#d97706',       // CSRi Logo Golden Amber
    primaryHover: '#b45309',  // Deep Amber hover
    primaryLight: '#fffbeb',  // Amber 50 tint
    accent: '#f59e0b',        // Vibrant Logo Gold
    headerBg: 'glass',
    heroBg: 'subtle',
    footerBg: 'dark',
    borderRadius: 'rounded-md',
    fontFamily: 'sans'
  },
  announcement: {
    enabled: true,
    text: '🚀 Applications are open for Summer 2026 Engineering & Research Internships!',
    linkText: 'Apply Today',
    linkUrl: '/internships',
    bgColor: '#b45309',
    textColor: '#ffffff'
  },
  hero: {
    badge: 'Professional Technology Services',
    title: 'Engineering Enterprise',
    titleHighlight: 'Digital Foundations',
    description: 'Sricore Solutions delivers high-performance software development, industrial IoT, and AI-driven research services. We bridge the gap between academic innovation and commercial engineering excellence.',
    primaryCtaText: 'Get a Project Quote',
    primaryCtaLink: '/enquiry',
    secondaryCtaText: 'Apply for Internship',
    secondaryCtaLink: '/internships',
    monitorLabel: 'Live Monitoring Interface',
    uptime: '99.9%',
    cpuLoad: '74%',
    statsBadges: ['ISO Standards', 'Industrial IoT', 'AI Certified']
  },
  metrics: [
    { id: '1', value: '120+', label: 'Delivered Projects', description: 'Enterprise software, embedded systems & AI implementations' },
    { id: '2', value: '50+', label: 'Corporate Clients', description: 'Across manufacturing, healthcare & logistics' },
    { id: '3', value: '99.9%', label: 'Platform Reliability', description: 'High uptime SLA guaranteed for all cloud systems' },
    { id: '4', value: '25+', label: 'Research Publications', description: 'Patents and IEEE conference contributions' }
  ],
  about: {
    heroTitle: 'About Sricore Solutions',
    heroSubtitle: 'We are a team of dedicated engineers, researchers, and technologists committed to solving complex industrial challenges through innovative technical solutions.',
    story: 'Founded with a clear vision to bridge academic research with industrial capability, Sricore Solutions has grown into a versatile engineering partner for organizations worldwide.',
    mission: 'To empower organizations by delivering robust, scalable, and cutting-edge technology solutions that drive efficiency and growth. We strive to bridge the gap between academic research and industrial application.',
    vision: 'To be the premier technology partner recognized globally for excellence in software engineering, embedded systems, artificial intelligence, and applied research.',
    coreValues: [
      { id: '1', title: 'Engineering Excellence', description: 'We maintain the highest standards in our technical architecture, code quality, and system design.' },
      { id: '2', title: 'Innovation First', description: 'We continuously explore emerging technologies to provide forward-thinking solutions that keep our clients ahead.' },
      { id: '3', title: 'Integrity & Trust', description: 'We prioritize transparent communication, data privacy, and ethical practices in every client engagement.' },
      { id: '4', title: 'Continuous Learning', description: 'We nurture young talent through immersive internships, mentoring the next generation of engineers.' }
    ]
  },
  services: {
    heroTitle: 'Cutting-Edge Technical Capabilities',
    heroSubtitle: 'From robust cloud infrastructures to intelligent hardware sensors, we build solutions that endure.',
    introDescription: 'Our interdisciplinary team combines deep theoretical insight with battle-tested industry practices to tackle high-complexity engineering challenges.'
  },
  contact: {
    primaryEmail: APP_CONFIG.company.contact.email || 'contact@sricoresolutions.com',
    supportEmail: 'support@sricoresolutions.com',
    primaryPhone: APP_CONFIG.company.contact.phone || '+91 98402 34567',
    altPhone: '+91 98402 34568',
    address: APP_CONFIG.company.contact.address || 'Namakkal - 637018, Tamil Nadu, India',
    workingHours: 'Monday - Friday: 9:00 AM - 6:30 PM IST',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125302.4342551608!2d78.1009185!3d11.2188849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babce5e5527756f%3A0x6b63c9b74051a89c!2sNamakkal%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000'
  },
  socials: {
    linkedin: 'https://linkedin.com/company/sricore-solutions',
    twitter: 'https://twitter.com/sricoresolutions',
    github: 'https://github.com/sricore-solutions',
    instagram: 'https://instagram.com/sricoresolutions',
    youtube: 'https://youtube.com/@sricoresolutions'
  },
  footerCopyright: '© ' + new Date().getFullYear() + ' Sricore Solutions Pvt Ltd. All rights reserved.'
};

const WEBSITE_SETTINGS_CACHE_KEY = 'sricore_website_settings_cache_v1';
const WEBSITE_SETTINGS_TS_KEY = 'sricore_website_settings_ts_v1';
const SETTINGS_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

function normalizeSettingsPayload(
  parsed: Partial<WebsiteSettings>,
  fallback: WebsiteSettings = DEFAULT_WEBSITE_SETTINGS
): WebsiteSettings {
  const rawTheme = (parsed.theme || {}) as Partial<ThemeColors>;
  const isOldBlue =
    !rawTheme.primary ||
    rawTheme.primary === '#2563eb' ||
    rawTheme.primary === '#1d4ed8' ||
    rawTheme.primary === '#3b82f6';

  const finalTheme = isOldBlue
    ? { ...DEFAULT_WEBSITE_SETTINGS.theme }
    : { ...DEFAULT_WEBSITE_SETTINGS.theme, ...rawTheme };

  return {
    ...fallback,
    ...parsed,
    brandName: normalizeBrandName(parsed.brandName || fallback.brandName),
    theme: finalTheme,
    announcement: {
      ...DEFAULT_WEBSITE_SETTINGS.announcement,
      ...(parsed.announcement || {}),
      bgColor:
        isOldBlue &&
        (parsed.announcement?.bgColor === '#1e40af' ||
          parsed.announcement?.bgColor === '#2563eb')
          ? DEFAULT_WEBSITE_SETTINGS.announcement.bgColor
          : parsed.announcement?.bgColor || DEFAULT_WEBSITE_SETTINGS.announcement.bgColor,
    },
    hero: { ...DEFAULT_WEBSITE_SETTINGS.hero, ...(parsed.hero || {}) },
    metrics:
      Array.isArray(parsed.metrics) && parsed.metrics.length > 0
        ? parsed.metrics
        : fallback.metrics,
    about: { ...DEFAULT_WEBSITE_SETTINGS.about, ...(parsed.about || {}) },
    services: { ...DEFAULT_WEBSITE_SETTINGS.services, ...(parsed.services || {}) },
    contact: { ...DEFAULT_WEBSITE_SETTINGS.contact, ...(parsed.contact || {}) },
    socials: { ...DEFAULT_WEBSITE_SETTINGS.socials, ...(parsed.socials || {}) },
  };
}

function readCachedSettingsState(): {
  settings: WebsiteSettings;
  hasCache: boolean;
  isStale: boolean;
} {
  try {
    const raw = localStorage.getItem(WEBSITE_SETTINGS_CACHE_KEY);
    if (!raw) {
      return { settings: DEFAULT_WEBSITE_SETTINGS, hasCache: false, isStale: true };
    }
    const parsed = JSON.parse(raw) as Partial<WebsiteSettings>;
    const tsRaw = Number(localStorage.getItem(WEBSITE_SETTINGS_TS_KEY) || 0);
    const isStale = !tsRaw || Date.now() - tsRaw > SETTINGS_CACHE_TTL_MS;
    return {
      settings: normalizeSettingsPayload(parsed),
      hasCache: true,
      isStale,
    };
  } catch {
    return { settings: DEFAULT_WEBSITE_SETTINGS, hasCache: false, isStale: true };
  }
}

function writeCachedSettings(next: WebsiteSettings) {
  try {
    const { updatedAt: _u, ...serializable } = next;
    localStorage.setItem(WEBSITE_SETTINGS_CACHE_KEY, JSON.stringify(serializable));
    localStorage.setItem(WEBSITE_SETTINGS_TS_KEY, String(Date.now()));
  } catch {
    // Ignore quota/storage errors
  }
}

export interface WebsiteSettingsContextType {
  settings: WebsiteSettings;
  loading: boolean;
  saveSettings: (newSettings: Partial<WebsiteSettings>, updatedByUid?: string) => Promise<boolean>;
  resetToDefaults: (updatedByUid?: string) => Promise<boolean>;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType>({
  settings: DEFAULT_WEBSITE_SETTINGS,
  loading: false,
  saveSettings: async () => false,
  resetToDefaults: async () => false
});

export function WebsiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const initialCacheRef = useRef(readCachedSettingsState());
  const [settings, setSettings] = useState<WebsiteSettings>(() => initialCacheRef.current.settings);
  const [loading, setLoading] = useState<boolean>(() => !initialCacheRef.current.hasCache);
  const settingsRef = useRef<WebsiteSettings>(settings);
  settingsRef.current = settings;

  // Hydrate fresh CMS settings via one-shot getDoc only when cache is missing or expired,
  // avoiding a persistent Firestore streaming socket on every public visitor boot.
  useEffect(() => {
    let cancelled = false;
    const { hasCache, isStale } = initialCacheRef.current;

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === WEBSITE_SETTINGS_CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Partial<WebsiteSettings>;
          setSettings(normalizeSettingsPayload(parsed, settingsRef.current));
        } catch {
          // Ignore malformed external storage writes
        }
      }
    };
    window.addEventListener('storage', handleStorageSync);

    if (hasCache && !isStale) {
      setLoading(false);
      return () => {
        window.removeEventListener('storage', handleStorageSync);
      };
    }

    const fetchSettingsOnce = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'settings', 'website_cms'));
        if (cancelled) return;

        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<WebsiteSettings>;
          setSettings((prev) => {
            const next = normalizeSettingsPayload(data, prev);
            writeCachedSettings(next);
            return next;
          });
        } else {
          const legacySnap = await getDoc(doc(db, 'settings', 'website_content'));
          if (cancelled) return;
          if (legacySnap.exists()) {
            const legacyData = legacySnap.data();
            setSettings((prev) => {
              const next: WebsiteSettings = {
                ...prev,
                brandDescription: legacyData.companyDescription || prev.brandDescription,
                contact: {
                  ...prev.contact,
                  primaryEmail: legacyData.contactEmail || prev.contact.primaryEmail,
                  primaryPhone: legacyData.contactPhone || prev.contact.primaryPhone,
                  address: legacyData.contactAddress || prev.contact.address
                }
              };
              writeCachedSettings(next);
              return next;
            });
          } else {
            writeCachedSettings(settingsRef.current);
          }
        }
      } catch (error) {
        console.warn('Firestore settings fetch error (retaining cached/defaults):', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!hasCache) {
      void fetchSettingsOnce();
      return () => {
        cancelled = true;
        window.removeEventListener('storage', handleStorageSync);
      };
    }

    const ric = (window as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const cancelRic = (window as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    if (ric) {
      const idleId = ric(() => {
        void fetchSettingsOnce();
      }, { timeout: 2500 });
      return () => {
        cancelled = true;
        cancelRic?.(idleId);
        window.removeEventListener('storage', handleStorageSync);
      };
    }

    const timerId = window.setTimeout(() => {
      void fetchSettingsOnce();
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<WebsiteSettings>, updatedByUid?: string): Promise<boolean> => {
    try {
      const merged: WebsiteSettings = {
        ...settingsRef.current,
        ...newSettings,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || 'admin'
      };

      await Promise.all([
        setDoc(doc(db, 'settings', 'website_cms'), merged, { merge: true }),
        setDoc(doc(db, 'settings', 'website_content'), {
          companyDescription: merged.brandDescription || merged.about.story,
          contactEmail: merged.contact.primaryEmail,
          contactPhone: merged.contact.primaryPhone,
          contactAddress: merged.contact.address,
          updatedAt: serverTimestamp(),
          updatedBy: updatedByUid || 'admin'
        }, { merge: true })
      ]);

      writeCachedSettings(merged);
      setSettings(merged);
      return true;
    } catch (err) {
      console.error('Failed to save website settings:', err);
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(async (updatedByUid?: string): Promise<boolean> => {
    try {
      const defaults = {
        ...DEFAULT_WEBSITE_SETTINGS,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || 'admin'
      };
      await setDoc(doc(db, 'settings', 'website_cms'), defaults);
      writeCachedSettings(DEFAULT_WEBSITE_SETTINGS);
      setSettings(DEFAULT_WEBSITE_SETTINGS);
      return true;
    } catch (err) {
      console.error('Failed to reset website settings:', err);
      return false;
    }
  }, []);

  const value = useMemo<WebsiteSettingsContextType>(
    () => ({ settings, loading, saveSettings, resetToDefaults }),
    [settings, loading, saveSettings, resetToDefaults]
  );

  return (
    <WebsiteSettingsContext.Provider value={value}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(WebsiteSettingsContext);
  if (!context) {
    throw new Error('useWebsiteSettings must be used within a WebsiteSettingsProvider');
  }
  return context;
}
