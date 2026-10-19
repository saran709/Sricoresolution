import { isRouteEligibleForAds, STRICTLY_EXCLUDED_PATTERNS, ELIGIBLE_CONTENT_ROUTES } from '../src/lib/adEligibility';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== [1] TESTING ROUTE-LEVEL AD ELIGIBILITY POLICY ===');

const excludedRoutes = [
  '/login',
  '/register',
  '/setup',
  '/forgot-password',
  '/unauthorized',
  '/dashboard',
  '/dashboard/my-projects',
  '/admin',
  '/admin/settings',
  '/admin/payments',
  '/contact',
  '/enquiry',
  '/internships/apply',
  '/privacy',
  '/terms',
  '/editorial-policy',
  '/non-existent-404-page'
];

for (const route of excludedRoutes) {
  const eligible = isRouteEligibleForAds(route);
  assert(!eligible, `Excluded route '${route}' must NOT be eligible for Google Ads`);
}

const eligibleRoutes = [
  '/projects',
  '/projects/quality-inspection',
  '/projects/iot-dashboard',
  '/projects/health-api',
  '/solutions/software',
  '/solutions/hardware',
  '/solutions/ai-ml',
  '/services/research',
  '/services'
];

for (const route of eligibleRoutes) {
  const eligible = isRouteEligibleForAds(route);
  assert(eligible, `Substantive content route '${route}' must be ELIGIBLE for Google Ads`);
}

console.log('\n=== [2] TESTING INDEX.HTML CLEANLINESS & ADSENSE TAGS ===');
const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

assert(!indexHtml.includes('monetag'), 'index.html must NOT contain Monetag meta or scripts');
assert(!indexHtml.includes('quge5.com'), 'index.html must NOT contain intrusive 3rd-party ad scripts');
assert(indexHtml.includes('ca-pub-5684687588450520'), 'index.html must contain Google AdSense account ID');
assert(indexHtml.includes('adsbygoogle.js'), 'index.html must include official Google AdSense script');

console.log('\n=== [3] TESTING LAYOUT & DASHBOARD INTEGRITY ===');
const mainLayout = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/MainLayout.tsx'), 'utf8');
assert(!mainLayout.includes('<AmpAd'), 'MainLayout.tsx must NOT render global AmpAd');
assert(!mainLayout.includes('<AdUnit'), 'MainLayout.tsx must NOT render global AdUnit');

const myProjects = fs.readFileSync(path.join(process.cwd(), 'src/components/dashboard/MyProjects.tsx'), 'utf8');
assert(!myProjects.includes('AdSlot'), 'MyProjects dashboard component must NOT import or render AdSlot');

console.log('\n=== [4] TESTING PRIVACY & TRUST POLICY DISCLOSURES ===');
const privacyContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/Privacy.tsx'), 'utf8');
assert(privacyContent.includes('Google LLC') || privacyContent.includes('Google AdSense'), 'Privacy.tsx must disclose Google AdSense');
assert(privacyContent.includes('DoubleClick') || privacyContent.includes('advertising cookies'), 'Privacy.tsx must disclose advertising cookies');
assert(privacyContent.includes('google.com/settings/ads'), 'Privacy.tsx must link to Google Ads Settings opt-out');
assert(privacyContent.includes('aboutads.info/choices') || privacyContent.includes('networkadvertising.org'), 'Privacy.tsx must provide industry opt-out links');

const footerContent = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/Footer.tsx'), 'utf8');
assert(footerContent.includes('/privacy'), 'Footer.tsx must link to Privacy Policy');
assert(footerContent.includes('/terms'), 'Footer.tsx must link to Terms of Service');
assert(footerContent.includes('/editorial-policy'), 'Footer.tsx must link to Editorial Policy');

console.log('\n=== [5] TESTING SITEMAP & ROBOTS.TXT ===');
const sitemap = fs.readFileSync(path.join(process.cwd(), 'public/sitemap.xml'), 'utf8');
assert(sitemap.includes('/editorial-policy'), 'sitemap.xml must include /editorial-policy');
assert(sitemap.includes('/internships'), 'sitemap.xml must include /internships');
assert(!sitemap.includes('/admin'), 'sitemap.xml must NOT list /admin');
assert(!sitemap.includes('/dashboard'), 'sitemap.xml must NOT list /dashboard');

const robots = fs.readFileSync(path.join(process.cwd(), 'public/robots.txt'), 'utf8');
assert(robots.includes('Disallow: /admin'), 'robots.txt must disallow /admin');
assert(robots.includes('Disallow: /dashboard'), 'robots.txt must disallow /dashboard');

console.log(`\n========================================`);
console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL ADSENSE POLICY COMPLIANCE TESTS PASSED SUCCESSFULLY!');
}
