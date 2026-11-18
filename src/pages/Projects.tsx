import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { Project, ProjectType } from '../types';
import {
  ArrowRight,
  Search,
  Sparkles,
  Filter,
  ShieldCheck,
  Layers,
  Cpu,
  BrainCircuit,
  Code2,
  FlaskConical,
  X,
  RotateCcw,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { HISTORICAL_PROJECTS_INVENTORY } from '../lib/projectMigration';
import { SELECTED_WORKS, getProjectWebImage, ProjectCaseStudy } from '../data/projectsData';

export type ShowcaseFilterCategory = 'all' | 'iot' | 'ai_ml' | 'software' | 'research';

interface CategoryFilterOption {
  id: ShowcaseFilterCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SHOWCASE_FILTER_OPTIONS: CategoryFilterOption[] = [
  {
    id: 'all',
    label: 'All Projects',
    description: 'Complete verified engineering & R&D portfolio',
    icon: Layers,
  },
  {
    id: 'iot',
    label: 'IoT',
    description: 'Embedded hardware, industrial telemetry & edge sensors',
    icon: Cpu,
  },
  {
    id: 'ai_ml',
    label: 'AI/ML',
    description: 'Computer vision, deep learning, NLP & predictive models',
    icon: BrainCircuit,
  },
  {
    id: 'software',
    label: 'Software',
    description: 'Enterprise web platforms, SaaS portals & clinical APIs',
    icon: Code2,
  },
  {
    id: 'research',
    label: 'Research',
    description: 'Scientific modeling, bioprocess R&D & empirical studies',
    icon: FlaskConical,
  },
];

// Specific projects explicitly excluded from public showcase
const EXCLUDED_PROJECT_IDENTIFIERS = [
  'hackerrank-campus-crew-paavai',
  'paavai-bloodconnect',
  'sri-hackerrank-campus-crew',
  'sri-paavai-bloodconnect',
];

function isExcludedProject(p: {
  id?: string;
  projectSlug?: string;
  projectTitle?: string;
  name?: string;
}): boolean {
  const slug = (p.projectSlug || '').toLowerCase();
  const id = (p.id || '').toLowerCase();
  const title = (p.projectTitle || p.name || '').toLowerCase();
  if (EXCLUDED_PROJECT_IDENTIFIERS.includes(slug) || EXCLUDED_PROJECT_IDENTIFIERS.includes(id)) {
    return true;
  }
  if (
    title.includes('paavai') &&
    (title.includes('hackerrank') || title.includes('bloodconnect') || title.includes('blood connect'))
  ) {
    return true;
  }
  return false;
}

function inferSelectedWorkProjectType(sw: ProjectCaseStudy): ProjectType {
  const combined = `${sw.type} ${sw.category} ${sw.domain}`.toLowerCase();
  if (combined.includes('ai/ml') || combined.includes('computer vision')) return 'ai_ml';
  if (combined.includes('iot') || combined.includes('hardware')) return 'iot';
  if (combined.includes('research')) return 'research';
  return 'software';
}

/**
 * Classifies a project record into canonical showcase filter categories ('iot', 'ai_ml',
 * 'software', 'research') using its existing schema fields (`projectType`, `projectCategory`,
 * `departmentId`, and `technologyStack`). Multidisciplinary systems can belong to more than
 * one matching domain so users never miss relevant work when toggling tabs.
 */
export function resolveShowcaseCategoriesForProject(
  project: Project
): Exclude<ShowcaseFilterCategory, 'all'>[] {
  const matched = new Set<Exclude<ShowcaseFilterCategory, 'all'>>();

  const rawType = (project.projectType || '').toLowerCase();
  const rawCategory = (project.projectCategory || '').toLowerCase();
  const rawDept = (project.departmentId || '').toLowerCase();
  const stackText = (project.technologyStack || []).join(' ').toLowerCase();
  const metaText = `${rawCategory} ${rawDept}`;

  // 1. Direct schema `projectType` mapping
  if (rawType === 'iot') matched.add('iot');
  if (rawType === 'ai_ml') matched.add('ai_ml');
  if (rawType === 'software' || rawType === 'android') matched.add('software');
  if (rawType === 'research') matched.add('research');

  // 2. Schema `projectCategory`, `departmentId`, and `technologyStack` domain classification
  if (
    metaText.includes('iot') ||
    metaText.includes('hardware') ||
    metaText.includes('embedded') ||
    metaText.includes('v2x') ||
    metaText.includes('wearables') ||
    stackText.includes('esp32') ||
    stackText.includes('arduino') ||
    stackText.includes('stm32') ||
    stackText.includes('modbus') ||
    stackText.includes('lorawan')
  ) {
    matched.add('iot');
  }

  if (
    metaText.includes('ai') ||
    metaText.includes('ml') ||
    metaText.includes('machine learning') ||
    metaText.includes('deep learning') ||
    metaText.includes('computer vision') ||
    metaText.includes('natural language processing') ||
    stackText.includes('yolov8') ||
    stackText.includes('tensorflow') ||
    stackText.includes('pytorch') ||
    stackText.includes('scikit-learn') ||
    stackText.includes('xgboost')
  ) {
    matched.add('ai_ml');
  }

  if (
    metaText.includes('software') ||
    metaText.includes('web applications') ||
    metaText.includes('enterprise') ||
    metaText.includes('healthtech') ||
    metaText.includes('edtech') ||
    metaText.includes('cataloging')
  ) {
    matched.add('software');
  }

  if (
    metaText.includes('research') ||
    metaText.includes('data science') ||
    metaText.includes('bio-process') ||
    metaText.includes('chemical') ||
    metaText.includes('informatics') ||
    metaText.includes('sustainable hardware')
  ) {
    matched.add('research');
  }

  if (matched.size === 0) {
    matched.add('software');
  }

  return Array.from(matched);
}

const VALID_FILTERS = new Set<ShowcaseFilterCategory>([
  'all',
  'iot',
  'ai_ml',
  'software',
  'research',
]);

function normalizeFilterParam(param: string | null): ShowcaseFilterCategory {
  if (!param) return 'all';
  const cleaned = param.trim().toLowerCase().replace('-', '_');
  if (cleaned === 'ai' || cleaned === 'ml' || cleaned === 'ai/ml') return 'ai_ml';
  if (VALID_FILTERS.has(cleaned as ShowcaseFilterCategory)) {
    return cleaned as ShowcaseFilterCategory;
  }
  return 'all';
}

const TYPE_BADGE_LABELS: Record<Exclude<ShowcaseFilterCategory, 'all'>, string> = {
  iot: 'IoT',
  ai_ml: 'AI/ML',
  software: 'Software',
  research: 'Research',
};

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = normalizeFilterParam(searchParams.get('category') || searchParams.get('type'));
  const initialQuery = searchParams.get('q') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ShowcaseFilterCategory>(initialFilter);
  const [selectedSubDomain, setSelectedSubDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Sync query parameter updates when navigating back/forward or via external search links
  useEffect(() => {
    const paramFilter = normalizeFilterParam(searchParams.get('category') || searchParams.get('type'));
    const paramQ = searchParams.get('q') || '';
    if (paramFilter !== activeFilter) {
      setActiveFilter(paramFilter);
      setSelectedSubDomain('all');
    }
    if (paramQ !== searchQuery) {
      setSearchQuery(paramQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fallback to verified approved portfolio records from historical inventory + selected works
  const defaultPortfolioProjects = useMemo(() => {
    const flagshipProjects: Project[] = SELECTED_WORKS.filter(
      (sw) => !isExcludedProject({ id: sw.id, projectSlug: sw.slug, projectTitle: sw.title })
    ).map((sw) => ({
      id: sw.id,
      projectCode: sw.projectCode,
      projectTitle: sw.title,
      projectSlug: sw.slug,
      name: sw.title,
      description: sw.summary,
      projectDescription: sw.summary,
      projectCategory: sw.category,
      imageUrl: sw.imageUrl || getProjectWebImage(sw.slug, sw.category),
      projectType: inferSelectedWorkProjectType(sw),
      technologyStack: sw.technologyStack.flatMap((t) => t.items).slice(0, 6),
      portfolioVisibility: true,
      featured: true,
      createdAt: null,
      updatedAt: null,
      status: 'active',
    }));

    const historical = HISTORICAL_PROJECTS_INVENTORY.filter(
      (p) =>
        p.portfolioVisibility &&
        !isExcludedProject({
          id: p.canonicalId,
          projectSlug: p.projectSlug,
          projectTitle: p.projectTitle,
        })
    ).map(
      (p) =>
        ({
          id: p.canonicalId,
          projectCode: p.projectCode,
          projectTitle: p.projectTitle,
          projectSlug: p.projectSlug,
          name: p.projectTitle,
          description: p.projectDescription,
          projectDescription: p.projectDescription,
          projectCategory: p.projectCategory,
          departmentId: p.departmentId,
          imageUrl: getProjectWebImage(p.canonicalId || p.projectSlug, p.projectCategory),
          projectType: p.projectType,
          technologyStack: p.technologyStack,
          portfolioVisibility: true,
          featured: p.featured,
          createdAt: null,
          updatedAt: null,
          status: 'active' as const,
        }) as Project
    );

    return [...flagshipProjects, ...historical];
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      // Query projects approved for public portfolio showcase
      const q = query(collection(db, 'projects'), where('portfolioVisibility', '==', true));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Project[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const projectItem = {
                id: docSnap.id,
                projectCode: data.projectCode || `SRI-${docSnap.id.slice(0, 4).toUpperCase()}`,
                projectTitle: data.projectTitle || data.name || 'Sricore Project',
                projectSlug: data.projectSlug || docSnap.id,
                name: data.projectTitle || data.name || 'Sricore Project',
                description: data.projectDescription || data.description || '',
                projectDescription: data.projectDescription || data.description || '',
                projectCategory: data.projectCategory || 'Engineering & Software',
                departmentId: data.departmentId || '',
                imageUrl:
                  data.imageUrl ||
                  getProjectWebImage(data.projectSlug || docSnap.id, data.projectCategory),
                projectType: data.projectType || 'software',
                technologyStack: data.technologyStack || [],
                portfolioVisibility: true,
                featured: data.featured || false,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                status: 'active',
              } as Project;

              if (!isExcludedProject(projectItem)) {
                list.push(projectItem);
              }
            });
            setProjects(list);
          } else {
            // If Firestore collection has not yet been populated, display approved historical inventory
            setProjects(defaultPortfolioProjects);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Public portfolio live listener note:', err);
          setProjects(defaultPortfolioProjects);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore initialization notice:', err);
      setProjects(defaultPortfolioProjects);
      setLoading(false);
    }
  }, [defaultPortfolioProjects]);

  // Precompute classified categories per project from schema fields
  const projectsWithSchemaTags = useMemo(() => {
    return projects
      .filter((p) => !isExcludedProject(p))
      .map((project) => ({
        project,
        schemaCategories: resolveShowcaseCategoriesForProject(project),
      }));
  }, [projects]);

  // Dynamic badge counts for All / IoT / AI/ML / Software / Research
  const filterCounts = useMemo(() => {
    const counts: Record<ShowcaseFilterCategory, number> = {
      all: projectsWithSchemaTags.length,
      iot: 0,
      ai_ml: 0,
      software: 0,
      research: 0,
    };

    for (const item of projectsWithSchemaTags) {
      for (const cat of item.schemaCategories) {
        counts[cat] += 1;
      }
    }
    return counts;
  }, [projectsWithSchemaTags]);

  // Sub-domain specializations scoped to the active primary category
  const subDomainOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of projectsWithSchemaTags) {
      if (activeFilter === 'all' || item.schemaCategories.includes(activeFilter)) {
        if (item.project.projectCategory) {
          set.add(item.project.projectCategory);
        }
      }
    }
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [projectsWithSchemaTags, activeFilter]);

  const handleSelectPrimaryFilter = (nextFilter: ShowcaseFilterCategory) => {
    setActiveFilter(nextFilter);
    setSelectedSubDomain('all');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('type');
    if (nextFilter === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', nextFilter);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set('q', value);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    setActiveFilter('all');
    setSelectedSubDomain('all');
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projectsWithSchemaTags.filter(({ project, schemaCategories }) => {
      const matchesPrimary =
        activeFilter === 'all' || schemaCategories.includes(activeFilter);
      if (!matchesPrimary) return false;

      const matchesSubDomain =
        selectedSubDomain === 'all' || project.projectCategory === selectedSubDomain;
      if (!matchesSubDomain) return false;

      if (!q) return true;
      const title = (project.projectTitle || project.name || '').toLowerCase();
      const desc = (project.projectDescription || project.description || '').toLowerCase();
      const cat = (project.projectCategory || '').toLowerCase();
      const code = (project.projectCode || '').toLowerCase();
      const tech = (project.technologyStack || []).join(' ').toLowerCase();

      return (
        title.includes(q) ||
        desc.includes(q) ||
        cat.includes(q) ||
        code.includes(q) ||
        tech.includes(q)
      );
    });
  }, [projectsWithSchemaTags, activeFilter, selectedSubDomain, searchQuery]);

  const hasActiveFilters =
    activeFilter !== 'all' || selectedSubDomain !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen w-full min-w-0">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Verified Engineering Systems &amp; Case Studies
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5">
              Featured Projects &amp; Innovations
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Explore production deployments, research prototypes, and applied artificial intelligence systems engineered across Sricore Solutions initiatives and research collaborations.
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <Container className="py-10 md:py-16 min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div className="min-w-0">
            <SectionHeader
              title="Verified Technical Portfolio"
              description="A curated registry of authentic software platforms, IoT hardware implementations, and environmental data science research."
            />
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Search showcase projects by technology, title, or domain"
                placeholder="Search tech, title, code, or domain..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear project search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Structured Schema-Driven Category Filtering Bar */}
        <div
          aria-label="Filter projects by engineering category"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-8 shadow-xs space-y-3 min-w-0"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
            {/* Primary Schema Category Toggles: All, IoT, AI/ML, Software, Research */}
            <div
              role="group"
              aria-label="Primary project category toggles"
              className="flex flex-wrap items-center gap-2 min-w-0"
            >
              {SHOWCASE_FILTER_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilter === option.id;
                const count = filterCounts[option.id];

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectPrimaryFilter(option.id)}
                    aria-pressed={isActive}
                    title={option.description}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-amber-400 dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span>{option.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums ${
                        isActive
                          ? 'bg-white/15 text-white dark:bg-slate-950/20 dark:text-slate-950'
                          : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Domain Specialization Dropdown */}
            <div className="flex items-center gap-2 shrink-0 min-w-0">
              <label
                htmlFor="project-subdomain-select"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 whitespace-nowrap"
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Specialization:</span>
              </label>
              <select
                id="project-subdomain-select"
                value={selectedSubDomain}
                onChange={(e) => setSelectedSubDomain(e.target.value)}
                className="w-full sm:w-auto max-w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              >
                {subDomainOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Specializations' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Status & Reset Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Showing{' '}
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {filteredProjects.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {projectsWithSchemaTags.length}
              </span>{' '}
              verified projects
              {activeFilter !== 'all' && (
                <>
                  {' '}
                  in{' '}
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    {SHOWCASE_FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label}
                  </span>
                </>
              )}
              {selectedSubDomain !== 'all' && (
                <>
                  {' · '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedSubDomain}
                  </span>
                </>
              )}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              No Matching Projects Found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-5 leading-relaxed">
              No public showcase projects matched your selected category and search filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>View All Projects</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProjects.map(({ project, schemaCategories }, index) => {
              const projectTarget = `/projects/${project.projectSlug || project.id}`;
              const imageSrc =
                project.imageUrl ||
                getProjectWebImage(project.projectSlug || project.id, project.projectCategory);
              return (
                <div
                  key={project.id || index}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all duration-300 min-w-0"
                >
                  {/* Web Image Banner */}
                  <Link
                    to={projectTarget}
                    className="relative h-48 bg-slate-900 overflow-hidden block"
                  >
                    <img
                      src={imageSrc}
                      alt={project.projectTitle || project.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/40" />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs truncate max-w-[70%]">
                        {project.projectCategory || 'Technical System'}
                      </span>
                      {project.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-md shrink-0">
                          <Sparkles className="w-3 h-3 text-white" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                      <div className="flex flex-wrap items-center gap-1">
                        {schemaCategories.map((catKey) => (
                          <button
                            key={catKey}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelectPrimaryFilter(catKey);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/80 hover:bg-amber-500 text-slate-100 hover:text-slate-950 border border-slate-700/80 backdrop-blur-md transition-colors cursor-pointer"
                          >
                            {TYPE_BADGE_LABELS[catKey]}
                          </button>
                        ))}
                      </div>

                      {project.projectCode && (
                        <span className="text-[10px] font-mono text-slate-200 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 shadow-xs shrink-0">
                          {project.projectCode}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    <Link
                      to={projectTarget}
                      className="block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                        {project.projectTitle || project.name}
                      </h3>
                    </Link>

                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                      {project.projectDescription || project.description}
                    </p>

                    {/* Tech stack badges */}
                    {project.technologyStack && project.technologyStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.technologyStack.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologyStack.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{project.technologyStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-slate-100 mt-auto">
                      <Link
                        to={projectTarget}
                        className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform"
                      >
                        View Case Study <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">
                        {project.projectCode}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>

      {/* Call to Action */}
      <CTASection
        title="Need Custom System Architecture or Research Mentorship?"
        description="Share your technical requirements with our engineering team to explore how we can build or mentor your next production system."
        primaryAction={{ label: 'Start an Enquiry', href: '/enquiry' }}
      />
    </div>
  );
}
