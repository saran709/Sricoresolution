import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  brandName: APP_CONFIG.company.name || 'Sri core solutions',
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

export interface WebsiteSettingsContextType {
  settings: WebsiteSettings;
  loading: boolean;
  saveSettings: (newSettings: Partial<WebsiteSettings>, updatedByUid?: string) => Promise<boolean>;
  resetToDefaults: (updatedByUid?: string) => Promise<boolean>;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType>({
  settings: DEFAULT_WEBSITE_SETTINGS,
  loading: true,
  saveSettings: async () => false,
  resetToDefaults: async () => false
});

export function WebsiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_WEBSITE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // CSS custom properties are dynamically managed and calibrated in ThemeProvider

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const docRef = doc(db, 'settings', 'website_cms');
    
    // Also check legacy doc 'website_content' to hydrate if new doc does not exist yet
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<WebsiteSettings>;
        const rawTheme = (data.theme || {}) as Partial<ThemeColors>;
        const isOldBlue = !rawTheme.primary || 
          rawTheme.primary === '#2563eb' || 
          rawTheme.primary === '#1d4ed8' || 
          rawTheme.primary === '#3b82f6';
        
        const finalTheme = isOldBlue 
          ? { ...DEFAULT_WEBSITE_SETTINGS.theme } 
          : { ...DEFAULT_WEBSITE_SETTINGS.theme, ...rawTheme };

        setSettings((prev) => ({
          ...prev,
          ...data,
          theme: finalTheme,
          announcement: { 
            ...DEFAULT_WEBSITE_SETTINGS.announcement, 
            ...data.announcement,
            bgColor: isOldBlue && (data.announcement?.bgColor === '#1e40af' || data.announcement?.bgColor === '#2563eb')
              ? DEFAULT_WEBSITE_SETTINGS.announcement.bgColor 
              : (data.announcement?.bgColor || DEFAULT_WEBSITE_SETTINGS.announcement.bgColor)
          },
          hero: { ...DEFAULT_WEBSITE_SETTINGS.hero, ...data.hero },
          metrics: Array.isArray(data.metrics) && data.metrics.length > 0 ? data.metrics : DEFAULT_WEBSITE_SETTINGS.metrics,
          about: { ...DEFAULT_WEBSITE_SETTINGS.about, ...data.about },
          services: { ...DEFAULT_WEBSITE_SETTINGS.services, ...data.services },
          contact: { ...DEFAULT_WEBSITE_SETTINGS.contact, ...data.contact },
          socials: { ...DEFAULT_WEBSITE_SETTINGS.socials, ...data.socials }
        }));
        setLoading(false);
      } else {
        // Fallback: check legacy doc 'settings/website_content'
        try {
          const legacyRef = doc(db, 'settings', 'website_content');
          const legacySnap = await getDoc(legacyRef);
          if (legacySnap.exists()) {
            const legacyData = legacySnap.data();
            setSettings((prev) => ({
              ...prev,
              brandDescription: legacyData.companyDescription || prev.brandDescription,
              contact: {
                ...prev.contact,
                primaryEmail: legacyData.contactEmail || prev.contact.primaryEmail,
                primaryPhone: legacyData.contactPhone || prev.contact.primaryPhone,
                address: legacyData.contactAddress || prev.contact.address
              }
            }));
          }
        } catch (e) {
          console.warn('Could not read legacy website_content doc:', e);
        } finally {
          setLoading(false);
        }
      }
    }, (error) => {
      console.warn('Firestore settings listener error (falling back to defaults):', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveSettings = async (newSettings: Partial<WebsiteSettings>, updatedByUid?: string): Promise<boolean> => {
    try {
      const merged: WebsiteSettings = {
        ...settings,
        ...newSettings,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || 'admin'
      };

      // Save to website_cms doc
      await setDoc(doc(db, 'settings', 'website_cms'), merged, { merge: true });

      // Also sync to legacy website_content for backwards compatibility with any existing components
      await setDoc(doc(db, 'settings', 'website_content'), {
        companyDescription: merged.brandDescription || merged.about.story,
        contactEmail: merged.contact.primaryEmail,
        contactPhone: merged.contact.primaryPhone,
        contactAddress: merged.contact.address,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || 'admin'
      }, { merge: true });

      setSettings(merged);
      return true;
    } catch (err) {
      console.error('Failed to save website settings:', err);
      return false;
    }
  };

  const resetToDefaults = async (updatedByUid?: string): Promise<boolean> => {
    try {
      const defaults = {
        ...DEFAULT_WEBSITE_SETTINGS,
        updatedAt: serverTimestamp(),
        updatedBy: updatedByUid || 'admin'
      };
      await setDoc(doc(db, 'settings', 'website_cms'), defaults);
      setSettings(DEFAULT_WEBSITE_SETTINGS);
      return true;
    } catch (err) {
      console.error('Failed to reset website settings:', err);
      return false;
    }
  };

  return (
    <WebsiteSettingsContext.Provider value={{ settings, loading, saveSettings, resetToDefaults }}>
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
