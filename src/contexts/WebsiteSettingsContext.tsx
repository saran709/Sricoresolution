import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { APP_CONFIG } from '../config';
import { purgeUntrustedClientStorage } from '../lib/securityGuard';

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
    monitorLabel: 'Core Engineering Divisions',
    uptime: '99.9%',
    cpuLoad: '100%',
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

const AUTHORIZED_SITE_OWNER_EMAILS = ['saranramesh709@gmail.com'];

function sanitizeSafeLink(raw: string | undefined, fallback: string): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }
  return fallback;
}

function sanitizeSafeHex(raw: string | undefined, fallback: string): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : fallback;
}

function isVerifiedSiteOwnerClient(): { ok: boolean; email: string; uid: string } {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    return { ok: false, email: '', uid: '' };
  }
  const email = (user.email || '').toLowerCase().trim();
  const isGoogleProvider = user.providerData?.some((p) => p.providerId === 'google.com');
  const isVerified = Boolean(user.emailVerified || isGoogleProvider);
  if (!email || !isVerified || !AUTHORIZED_SITE_OWNER_EMAILS.includes(email)) {
    return { ok: false, email, uid: user.uid };
  }
  return { ok: true, email, uid: user.uid };
}

async function verifyWebsiteWriteWithServer(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return false;
  try {
    const idToken = await user.getIdToken();
    const res = await fetch('/api/rbac/validate-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ action: 'manage' }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.allowed);
  } catch {
    return false;
  }
}

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
    : {
        ...DEFAULT_WEBSITE_SETTINGS.theme,
        ...rawTheme,
        primary: sanitizeSafeHex(rawTheme.primary, DEFAULT_WEBSITE_SETTINGS.theme.primary),
        primaryHover: sanitizeSafeHex(rawTheme.primaryHover, DEFAULT_WEBSITE_SETTINGS.theme.primaryHover),
        primaryLight: sanitizeSafeHex(rawTheme.primaryLight, DEFAULT_WEBSITE_SETTINGS.theme.primaryLight),
        accent: sanitizeSafeHex(rawTheme.accent, DEFAULT_WEBSITE_SETTINGS.theme.accent),
      };

  const mergedHero = { ...DEFAULT_WEBSITE_SETTINGS.hero, ...(parsed.hero || {}) };
  if (mergedHero.monitorLabel === 'Live Monitoring Interface') {
    mergedHero.monitorLabel = DEFAULT_WEBSITE_SETTINGS.hero.monitorLabel;
  }
  if (mergedHero.cpuLoad === '74%') {
    mergedHero.cpuLoad = DEFAULT_WEBSITE_SETTINGS.hero.cpuLoad;
  }
  const mergedContact = { ...DEFAULT_WEBSITE_SETTINGS.contact, ...(parsed.contact || {}) };
  const mergedSocials = { ...DEFAULT_WEBSITE_SETTINGS.socials, ...(parsed.socials || {}) };

  return {
    ...fallback,
    ...parsed,
    brandName: normalizeBrandName(parsed.brandName || fallback.brandName),
    logoUrl: sanitizeSafeLink(parsed.logoUrl, DEFAULT_WEBSITE_SETTINGS.logoUrl || '/logo.png'),
    theme: finalTheme,
    announcement: {
      ...DEFAULT_WEBSITE_SETTINGS.announcement,
      ...(parsed.announcement || {}),
      linkUrl: sanitizeSafeLink(parsed.announcement?.linkUrl, DEFAULT_WEBSITE_SETTINGS.announcement.linkUrl),
      bgColor: sanitizeSafeHex(
        isOldBlue &&
          (parsed.announcement?.bgColor === '#1e40af' ||
            parsed.announcement?.bgColor === '#2563eb')
          ? DEFAULT_WEBSITE_SETTINGS.announcement.bgColor
          : parsed.announcement?.bgColor,
        DEFAULT_WEBSITE_SETTINGS.announcement.bgColor
      ),
      textColor: sanitizeSafeHex(parsed.announcement?.textColor, DEFAULT_WEBSITE_SETTINGS.announcement.textColor),
    },
    hero: {
      ...mergedHero,
      primaryCtaLink: sanitizeSafeLink(mergedHero.primaryCtaLink, DEFAULT_WEBSITE_SETTINGS.hero.primaryCtaLink),
      secondaryCtaLink: sanitizeSafeLink(mergedHero.secondaryCtaLink, DEFAULT_WEBSITE_SETTINGS.hero.secondaryCtaLink),
    },
    metrics:
      Array.isArray(parsed.metrics) && parsed.metrics.length > 0
        ? parsed.metrics
        : fallback.metrics,
    about: { ...DEFAULT_WEBSITE_SETTINGS.about, ...(parsed.about || {}) },
    services: { ...DEFAULT_WEBSITE_SETTINGS.services, ...(parsed.services || {}) },
    contact: {
      ...mergedContact,
      mapEmbedUrl: sanitizeSafeLink(mergedContact.mapEmbedUrl, DEFAULT_WEBSITE_SETTINGS.contact.mapEmbedUrl),
    },
    socials: {
      linkedin: sanitizeSafeLink(mergedSocials.linkedin, DEFAULT_WEBSITE_SETTINGS.socials.linkedin),
      twitter: sanitizeSafeLink(mergedSocials.twitter, DEFAULT_WEBSITE_SETTINGS.socials.twitter),
      github: sanitizeSafeLink(mergedSocials.github, DEFAULT_WEBSITE_SETTINGS.socials.github),
      instagram: sanitizeSafeLink(mergedSocials.instagram, DEFAULT_WEBSITE_SETTINGS.socials.instagram),
      youtube: sanitizeSafeLink(mergedSocials.youtube, DEFAULT_WEBSITE_SETTINGS.socials.youtube),
    },
  };
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
  // Never hydrate or cache website CMS settings in localStorage where DevTools can alter them.
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const settingsRef = useRef<WebsiteSettings>(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let cancelled = false;
    purgeUntrustedClientStorage();

    const fetchSettingsOnce = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'settings', 'website_cms'));
        if (cancelled) return;

        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<WebsiteSettings>;
          setSettings((prev) => normalizeSettingsPayload(data, prev));
        } else {
          const legacySnap = await getDoc(doc(db, 'settings', 'website_content'));
          if (cancelled) return;
          if (legacySnap.exists()) {
            const legacyData = legacySnap.data();
            setSettings((prev) => ({
              ...prev,
              brandDescription: legacyData.companyDescription || prev.brandDescription,
              contact: {
                ...prev.contact,
                primaryEmail: legacyData.contactEmail || prev.contact.primaryEmail,
                primaryPhone: legacyData.contactPhone || prev.contact.primaryPhone,
                address: legacyData.contactAddress || prev.contact.address,
              },
            }));
          }
        }
      } catch (error) {
        console.warn('Firestore settings fetch error (retaining official defaults):', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchSettingsOnce();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<WebsiteSettings>, updatedByUid?: string): Promise<boolean> => {
    const ownerCheck = isVerifiedSiteOwnerClient();
    if (!ownerCheck.ok) {
      return false;
    }

    const serverAllowed = await verifyWebsiteWriteWithServer();
    if (!serverAllowed) {
      return false;
    }

    try {
      const sanitizedNext = normalizeSettingsPayload({
        ...settingsRef.current,
        ...newSettings,
      });
      const merged: WebsiteSettings = {
        ...sanitizedNext,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || ownerCheck.uid,
      };

      await Promise.all([
        setDoc(doc(db, 'settings', 'website_cms'), merged, { merge: true }),
        setDoc(doc(db, 'settings', 'website_content'), {
          companyDescription: merged.brandDescription || merged.about.story,
          contactEmail: merged.contact.primaryEmail,
          contactPhone: merged.contact.primaryPhone,
          contactAddress: merged.contact.address,
          updatedAt: serverTimestamp(),
          updatedBy: updatedByUid || ownerCheck.uid,
        }, { merge: true }),
      ]);

      purgeUntrustedClientStorage();
      setSettings(sanitizedNext);
      return true;
    } catch (err) {
      console.error('Failed to save website settings:', err);
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(async (updatedByUid?: string): Promise<boolean> => {
    const ownerCheck = isVerifiedSiteOwnerClient();
    if (!ownerCheck.ok) {
      return false;
    }

    const serverAllowed = await verifyWebsiteWriteWithServer();
    if (!serverAllowed) {
      return false;
    }

    try {
      const defaults = {
        ...DEFAULT_WEBSITE_SETTINGS,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || ownerCheck.uid,
      };
      await setDoc(doc(db, 'settings', 'website_cms'), defaults);
      purgeUntrustedClientStorage();
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
