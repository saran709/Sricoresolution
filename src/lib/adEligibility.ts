/**
 * Google AdSense Publisher Policy Compliance - Ad Eligibility Engine
 * 
 * Strict enforcement of Google AdSense Program Policies:
 * 1. "Google-served ads on screens without publisher content" - NEVER allow ads on:
 *    - Login, register, password reset, authentication screens
 *    - Admin management consoles and private dashboards
 *    - Personal profiles, account settings, payments
 *    - Pure form submission or transactional pages (Contact, Enquiry, Apply)
 *    - Legal trust documents (Privacy Policy, Terms, Editorial Policy)
 *    - 404 / Page Not Found, under construction, or empty search states
 * 
 * 2. "Low-value content" - ONLY allow ads on high-substance public editorial content:
 *    - Detailed Project Case Studies (/projects/:slug) with comprehensive technical documentation
 *    - Engineering Solutions deep-dives (/solutions/software, /solutions/hardware, /solutions/ai-ml)
 *    - Research & Scientific documentation (/services/research)
 *    - Public Technical Portfolio index (/projects)
 */

export interface AdPolicyRouteConfig {
  pathPattern: RegExp;
  description: string;
  isEligible: boolean;
  minWordCountThreshold?: number;
}

// Strict explicit allowlist of high-value public content paths
export const ELIGIBLE_CONTENT_ROUTES: AdPolicyRouteConfig[] = [
  {
    pathPattern: /^\/projects\/[a-zA-Z0-9_-]+$/,
    description: 'Technical Case Study & Architecture Blueprint (>1500 words)',
    isEligible: true,
    minWordCountThreshold: 500
  },
  {
    pathPattern: /^\/projects\/?$/,
    description: 'Engineering Portfolio & Project Directory',
    isEligible: true
  },
  {
    pathPattern: /^\/solutions\/software\/?$/,
    description: 'Enterprise Software Architecture & Engineering Documentation',
    isEligible: true
  },
  {
    pathPattern: /^\/solutions\/hardware\/?$/,
    description: 'IoT & Embedded Systems Hardware Specifications',
    isEligible: true
  },
  {
    pathPattern: /^\/solutions\/ai-ml\/?$/,
    description: 'Artificial Intelligence & Machine Learning Architecture',
    isEligible: true
  },
  {
    pathPattern: /^\/services\/research\/?$/,
    description: 'Academic & Industrial Research Methodologies',
    isEligible: true
  },
  {
    pathPattern: /^\/services\/?$/,
    description: 'Technical Engineering Capabilities Overview',
    isEligible: true
  }
];

// Absolute exclusions: screens without publisher content, private dashboards, or transactional screens
export const STRICTLY_EXCLUDED_PATTERNS: RegExp[] = [
  /^\/admin(\/.*)?$/,            // All admin panels
  /^\/dashboard(\/.*)?$/,        // All private user/client/intern dashboards
  /^\/login\/?$/,                // Authentication screens
  /^\/register\/?$/,
  /^\/setup\/?$/,
  /^\/forgot-password\/?$/,
  /^\/unauthorized\/?$/,
  /^\/contact\/?$/,              // Form / inquiry screens without primary article content
  /^\/enquiry\/?$/,
  /^\/internships\/apply\/?$/,
  /^\/privacy\/?$/,              // Legal policy pages must remain ad-free
  /^\/terms\/?$/,
  /^\/editorial-policy\/?$/,
  /^\/notifications\/?$/
];

/**
 * Checks whether the current path is allowed to request or render Google AdSense ad units.
 */
export function isRouteEligibleForAds(pathname: string): boolean {
  if (!pathname) return false;
  
  // Normalize pathname: remove trailing slash except for root
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  // 1. Immediately reject if matched by any exclusion pattern
  for (const pattern of STRICTLY_EXCLUDED_PATTERNS) {
    if (pattern.test(normalized)) {
      return false;
    }
  }

  // 2. Only allow if explicitly present in the allowlist of substantive content routes
  for (const route of ELIGIBLE_CONTENT_ROUTES) {
    if (route.pathPattern.test(normalized)) {
      return true;
    }
  }

  // Default to false (safe-by-default allowlist model)
  return false;
}

/**
 * Helper to get publisher policy status for debugging and audit logs
 */
export function getAdEligibilityStatus(pathname: string): {
  eligible: boolean;
  reason: string;
} {
  const eligible = isRouteEligibleForAds(pathname);
  if (eligible) {
    return {
      eligible: true,
      reason: 'Route contains substantive publisher content approved in compliance allowlist.'
    };
  }
  return {
    eligible: false,
    reason: 'Screen is excluded per Google AdSense policies (no publisher content, auth, dashboard, legal, or transactional screen).'
  };
}
