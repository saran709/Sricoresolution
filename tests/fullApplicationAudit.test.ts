import * as fs from 'fs';
import * as path from 'path';

// Load and verify project datasets
import { SELECTED_WORKS, findProjectBySlugOrId } from '../src/data/projectsData';
import { OFFICIAL_GFORM_INTERNSHIPS, GFORM_CONFIG } from '../src/data/internshipsData';
import { OFFICIAL_JOB_OPENINGS } from '../src/data/careersData';
import { APP_CONFIG } from '../src/config/index';
import { isRouteEligibleForAds, getAdEligibilityStatus } from '../src/lib/adEligibility';
import { HISTORICAL_PROJECTS_INVENTORY } from '../src/lib/projectMigration';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalChecks++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedChecks++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) console.error(`    ↳ Error: ${details}`);
    failedChecks++;
  }
}

console.log('====================================================');
console.log('   SRICORE SOLUTIONS - FULL APPLICATION TEST & AUDIT');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. DATA INTEGRITY & MODEL CHECKS
// ----------------------------------------------------
console.log('▶ [1] VERIFYING CORE DATASETS & CASE STUDIES');

assert(SELECTED_WORKS.length >= 3, 'Selected works case studies must have at least 3 flagship items', `Found ${SELECTED_WORKS.length}`);

for (const work of SELECTED_WORKS) {
  assert(!!work.slug && work.slug.length > 2, `Case study '${work.title}' must have a valid slug: ${work.slug}`);
  assert(!!work.problemStatement && work.problemStatement.length > 50, `Case study '${work.slug}' must have substantive problem statement`);
  assert(!!work.proposedSolution && work.proposedSolution.length > 50, `Case study '${work.slug}' must have substantive proposed solution`);
  assert(work.challengePoints.length >= 2, `Case study '${work.slug}' must have >= 2 challenge points`);
  assert(work.technologyStack.length >= 1, `Case study '${work.slug}' must specify technology stack`);
}

// Check findProjectBySlugOrId lookup
for (const work of SELECTED_WORKS) {
  const found = findProjectBySlugOrId(work.slug);
  assert(found !== null && found.slug === work.slug, `findProjectBySlugOrId must find '${work.slug}'`);
}

// Check Historical inventory
assert(HISTORICAL_PROJECTS_INVENTORY.length >= 5, 'Historical inventory must have multiple candidate projects');

// Verify that Paavai HackerRank and Paavai BloodConnect are excluded from public showcase
const hackerrankProject = HISTORICAL_PROJECTS_INVENTORY.find(p => p.canonicalId === 'sri-hackerrank-campus-crew');
assert(hackerrankProject ? !hackerrankProject.portfolioVisibility : true, 'Paavai HackerRank must NOT have portfolioVisibility set to true');

const bloodConnectProject = HISTORICAL_PROJECTS_INVENTORY.find(p => p.canonicalId === 'sri-paavai-bloodconnect');
assert(bloodConnectProject ? !bloodConnectProject.portfolioVisibility : true, 'Paavai BloodConnect must NOT have portfolioVisibility set to true');

// Check Internships data
assert(OFFICIAL_GFORM_INTERNSHIPS.length >= 8, 'Official internships catalog must have >= 8 tracks', `Found ${OFFICIAL_GFORM_INTERNSHIPS.length}`);
for (const track of OFFICIAL_GFORM_INTERNSHIPS) {
  assert(!!track.name && track.name.length > 0, `Track ID '${track.id}' must have a name`);
  assert(track.keyTopics.length >= 3, `Track '${track.name}' must have at least 3 syllabus topics`);
  assert(track.projectExamples.length >= 1, `Track '${track.name}' must provide project examples`);
}

// ----------------------------------------------------
// 2. NAVIGATION & ROUTE CONSISTENCY
// ----------------------------------------------------
console.log('\n▶ [2] VERIFYING NAVIGATION LINKS & ROUTER SYNCHRONIZATION');

const routerFile = fs.readFileSync(path.join(process.cwd(), 'src/router.tsx'), 'utf8');

// Check main navigation links in config
for (const item of APP_CONFIG.navigation.main) {
  if (item.href && item.href !== '#') {
    const routePattern = item.href === '/' ? 'path="/"' : `path="${item.href.replace(/^\//, '')}"`;
    assert(routerFile.includes(routePattern) || routerFile.includes(item.href.replace(/^\//, '')), `Navigation route '${item.href}' must be registered in router.tsx`);
  }
  if (item.children) {
    for (const child of item.children) {
      const childRoute = child.href.replace(/^\//, '');
      assert(routerFile.includes(childRoute), `Child navigation route '${child.href}' must be registered in router.tsx`);
    }
  }
}

// Check legal navigation links
for (const legalItem of APP_CONFIG.navigation.legal) {
  const legalRoute = legalItem.href.replace(/^\//, '');
  assert(routerFile.includes(legalRoute), `Legal navigation route '${legalItem.href}' must be registered in router.tsx`);
}

// ----------------------------------------------------
// 3. ADSENSE POLICY & SECURITY CHECKS
// ----------------------------------------------------
console.log('\n▶ [3] VERIFYING ADSENSE ELIGIBILITY ENGINE & SECURITY');

const excludedRoutes = [
  '/login',
  '/register',
  '/setup',
  '/forgot-password',
  '/unauthorized',
  '/dashboard',
  '/dashboard/projects',
  '/admin',
  '/admin/reports',
  '/admin/settings',
  '/contact',
  '/enquiry',
  '/internships/apply',
  '/privacy',
  '/terms',
  '/editorial-policy',
  '/random-404-not-found'
];

for (const route of excludedRoutes) {
  const isEligible = isRouteEligibleForAds(route);
  assert(!isEligible, `Policy Engine: Screen '${route}' must be STRICTLY EXCLUDED from ads`);
}

const eligibleContentPages = [
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

for (const page of eligibleContentPages) {
  const isEligible = isRouteEligibleForAds(page);
  assert(isEligible, `Policy Engine: High-value content page '${page}' must be APPROVED for ads`);
}

// ----------------------------------------------------
// 4. ADS.TXT, SITEMAP & ROBOTS.TXT
// ----------------------------------------------------
console.log('\n▶ [4] VERIFYING STATIC FILES (ADS.TXT, ROBOTS.TXT, SITEMAP.XML)');

const rootAdsTxtPath = path.join(process.cwd(), 'ads.txt');
const publicAdsTxtPath = path.join(process.cwd(), 'public/ads.txt');

assert(fs.existsSync(rootAdsTxtPath), 'Root /ads.txt must exist on filesystem');
assert(fs.existsSync(publicAdsTxtPath), 'Public /public/ads.txt must exist on filesystem');

const rootAdsContent = fs.readFileSync(rootAdsTxtPath, 'utf8').trim();
const publicAdsContent = fs.readFileSync(publicAdsTxtPath, 'utf8').trim();
const expectedAdSenseLine = 'google.com, pub-5684687588450520, DIRECT, f08c47fec0942fa0';

assert(rootAdsContent.includes(expectedAdSenseLine), 'Root ads.txt must contain publisher authorization');
assert(publicAdsContent.includes(expectedAdSenseLine), 'Public ads.txt must contain publisher authorization');

// Verify sitemap.xml
const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
assert(fs.existsSync(sitemapPath), 'public/sitemap.xml must exist');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

assert(sitemapContent.includes('<loc>https://www.sricoresolutions.com/</loc>'), 'Sitemap must contain home URL');
assert(sitemapContent.includes('<loc>https://www.sricoresolutions.com/editorial-policy</loc>'), 'Sitemap must contain /editorial-policy');
assert(sitemapContent.includes('<loc>https://www.sricoresolutions.com/internships</loc>'), 'Sitemap must contain /internships');
assert(!sitemapContent.includes('/admin'), 'Sitemap must NOT expose /admin routes');
assert(!sitemapContent.includes('/dashboard'), 'Sitemap must NOT expose /dashboard routes');

// Verify robots.txt
const robotsPath = path.join(process.cwd(), 'public/robots.txt');
assert(fs.existsSync(robotsPath), 'public/robots.txt must exist');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');

assert(robotsContent.includes('User-agent: Mediapartners-Google'), 'robots.txt must declare Mediapartners-Google');
assert(robotsContent.includes('Disallow: /admin'), 'robots.txt must disallow /admin');
assert(robotsContent.includes('Disallow: /dashboard'), 'robots.txt must disallow /dashboard');
assert(robotsContent.includes('Sitemap: https://www.sricoresolutions.com/sitemap.xml'), 'robots.txt must reference sitemap.xml');

// ----------------------------------------------------
// 5. VERCEL CONFIGURATION AUDIT
// ----------------------------------------------------
console.log('\n▶ [5] VERIFYING VERCEL.JSON DEPLOYMENT SPECIFICATIONS');

const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
assert(fs.existsSync(vercelJsonPath), 'vercel.json must exist');
const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

assert(vercelConfig.framework === 'vite', 'vercel.json framework must be vite');
assert(Array.isArray(vercelConfig.headers), 'vercel.json must declare security headers');

// Check that ads.txt has text/plain header
const adsHeader = vercelConfig.headers.find((h: any) => h.source === '/ads.txt');
assert(!!adsHeader, 'vercel.json must define specific headers for /ads.txt');
if (adsHeader) {
  const contentType = adsHeader.headers.find((h: any) => h.key === 'Content-Type');
  assert(contentType && contentType.value.includes('text/plain'), 'vercel.json /ads.txt must have text/plain Content-Type');
}

// ----------------------------------------------------
// 6. METADATA & CONFIG AUDIT
// ----------------------------------------------------
console.log('\n▶ [6] VERIFYING METADATA & FIREBASE CONFIGURATION');

const metadataPath = path.join(process.cwd(), 'metadata.json');
assert(fs.existsSync(metadataPath), 'metadata.json must exist');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
assert(metadata.name === 'Sri core solutions' || metadata.name === 'Sricore Solutions', 'metadata.json must define valid application name');

const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
assert(fs.existsSync(firebaseConfigPath), 'firebase-applet-config.json must exist');
const fbConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
assert(!!fbConfig.projectId && fbConfig.projectId === 'sri-core-solutions', 'firebase-applet-config.json must specify valid projectId');

// ----------------------------------------------------
// 7. SUMMARY REPORT
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL AUDIT CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${failedChecks}`);
console.log('====================================================');

if (failedChecks > 0) {
  console.error(`\n❌ AUDIT FAILED WITH ${failedChecks} ISSUE(S).`);
  process.exit(1);
} else {
  console.log('\n✅ ALL APPLICATION MODULES, DATASETS, AND COMPLIANCE RULES VERIFIED CLEAN.');
}
