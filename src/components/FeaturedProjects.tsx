import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  BrainCircuit,
} from 'lucide-react';
import { Container } from './ui/Container';
import {
  FEATURED_CASE_STUDIES,
  FeaturedProjectSummary,
} from '../data/featuredProjectsSummary';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';

type DomainFilter = 'all' | 'software' | 'iot' | 'ai';

function getProjectTrack(project: FeaturedProjectSummary): 'software' | 'iot' | 'ai' {
  const combined = `${project.category} ${project.domain} ${project.type}`.toLowerCase();
  if (combined.includes('ai') || combined.includes('vision') || combined.includes('ml')) {
    return 'ai';
  }
  if (combined.includes('iot') || combined.includes('hardware') || combined.includes('embedded')) {
    return 'iot';
  }
  return 'software';
}

export const FeaturedProjects = React.memo(function FeaturedProjects() {
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const allCaseStudies = FEATURED_CASE_STUDIES;

  const [activeFilter, setActiveFilter] = useState<DomainFilter>('all');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return allCaseStudies;
    return allCaseStudies.filter((p) => getProjectTrack(p) === activeFilter);
  }, [allCaseStudies, activeFilter]);

  const safeSlideIndex =
    filteredProjects.length > 0 ? activeSlideIndex % filteredProjects.length : 0;
  const spotlightProject = filteredProjects[safeSlideIndex] || allCaseStudies[0];

  const handleFilterChange = (nextFilter: DomainFilter) => {
    setActiveFilter(nextFilter);
    setActiveSlideIndex(0);
  };

  const handlePrevSlide = () => {
    if (filteredProjects.length <= 1) return;
    setActiveSlideIndex(
      (prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length
    );
  };

  const handleNextSlide = () => {
    if (filteredProjects.length <= 1) return;
    setActiveSlideIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  return (
    <section
      id="featured-projects"
      aria-labelledby="featured-projects-heading"
      className="py-12 md:py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800"
    >
      <Container>
        {/* Section Header & Domain Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              <span style={{ color: primaryColor }}>Proof of Impact · Case Studies</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span>Production Deployments</span>
            </div>
            <h2
              id="featured-projects-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Featured Engineering Case Studies
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Verified software architectures, industrial IoT telemetry networks, and edge AI computer vision pipelines engineered and deployed by Sricore Solutions.
            </p>
          </div>

          {/* Domain Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Domains', icon: null },
                { id: 'ai', label: 'AI & Computer Vision', icon: BrainCircuit },
                { id: 'iot', label: 'Hardware & IoT', icon: Cpu },
                { id: 'software', label: 'Software Systems', icon: Code2 },
              ] as const
            ).map((tab) => {
              const isSelected = activeFilter === tab.id;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterChange(tab.id)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
                  }`}
                >
                  {IconComponent && (
                    <IconComponent
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: isSelected ? primaryColor : undefined }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Case Study Spotlight Carousel */}
        {spotlightProject && (
          <div className="mb-8 md:mb-10 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Spotlight Visual Column */}
              <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[280px] lg:min-h-full bg-slate-900 overflow-hidden">
                {spotlightProject.imageUrl && (
                  <img
                    src={spotlightProject.imageUrl}
                    alt={spotlightProject.title}
                    className="w-full h-full object-cover opacity-85 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-white/90">
                    <span className="font-bold tracking-wider uppercase">
                      {spotlightProject.projectCode}
                    </span>
                    <span className="text-amber-400 font-semibold">
                      {spotlightProject.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                      {spotlightProject.category}
                    </div>
                    <div className="text-sm font-medium text-slate-200">
                      {spotlightProject.clientType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spotlight Engineering Dossier Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Featured Case Study Spotlight ({safeSlideIndex + 1} of{' '}
                      {filteredProjects.length})
                    </div>

                    {/* Carousel Prev / Next Controls */}
                    {filteredProjects.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          aria-label="Previous case study"
                          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSlide}
                          aria-label="Next case study"
                          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5">
                    <Link
                      to={`/projects/${spotlightProject.slug}`}
                      className="hover:underline"
                    >
                      {spotlightProject.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {spotlightProject.summary}
                  </p>

                  {/* Quantified Engineering Metrics */}
                  {spotlightProject.metrics && spotlightProject.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                      {spotlightProject.metrics.slice(0, 3).map((metric, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
                        >
                          <div
                            className="font-mono text-base sm:text-lg font-extrabold tabular-nums"
                            style={{ color: primaryColor }}
                          >
                            {metric.value}
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                            {metric.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {metric.sublabel}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tech Stack & Action Link */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Stack:{' '}
                    </span>
                    {(spotlightProject.technologyStack?.[0]?.items || [])
                      .slice(0, 4)
                      .join(' · ')}
                  </div>

                  <Link
                    to={`/projects/${spotlightProject.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shrink-0 hover:underline"
                    style={{ color: primaryColor }}
                  >
                    <span>Inspect Full Case Study</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Grid of Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.slice(0, 6).map((project) => {
            const topMetric = project.metrics?.[0];
            const stackItems = project.technologyStack?.[0]?.items?.slice(0, 4) || [];

            return (
              <article
                key={project.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Card Thumbnail Header */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span className="font-bold">{project.projectCode}</span>
                        {topMetric && (
                          <span className="text-amber-300 font-semibold tabular-nums">
                            {topMetric.value} {topMetric.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {project.category}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:underline">
                      <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {project.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Stack & Case Study Link */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {stackItems.join(' · ')}
                  </div>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold shrink-0 hover:underline"
                    style={{ color: primaryColor }}
                  >
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Portfolio Archive Link */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            Explore full architecture schematics, interactive telemetry demos, and benchmark specifications in our complete project archive.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold hover:underline shrink-0"
            style={{ color: primaryColor }}
          >
            <span>View Complete Project Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
});

export default FeaturedProjects;
