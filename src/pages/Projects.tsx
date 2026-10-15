import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { Project } from '../types';
import { ArrowRight, Code, Search, Sparkles, Filter, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HISTORICAL_PROJECTS_INVENTORY } from '../lib/projectMigration';
import { SELECTED_WORKS, getProjectWebImage } from '../data/projectsData';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback to verified approved portfolio records from historical inventory + selected works
  const defaultPortfolioProjects = useMemo(() => {
    const flagshipProjects: Project[] = SELECTED_WORKS.map(sw => ({
      id: sw.id,
      projectCode: sw.projectCode,
      projectTitle: sw.title,
      projectSlug: sw.slug,
      name: sw.title,
      description: sw.summary,
      projectDescription: sw.summary,
      projectCategory: sw.category,
      imageUrl: sw.imageUrl || getProjectWebImage(sw.slug, sw.category),
      projectType: 'software',
      technologyStack: sw.technologyStack.flatMap(t => t.items).slice(0, 5),
      portfolioVisibility: true,
      featured: true,
      createdAt: null,
      updatedAt: null,
      status: 'active'
    }));

    const historical = HISTORICAL_PROJECTS_INVENTORY
      .filter(p => p.portfolioVisibility)
      .map(p => ({
        id: p.canonicalId,
        projectCode: p.projectCode,
        projectTitle: p.projectTitle,
        projectSlug: p.projectSlug,
        name: p.projectTitle,
        description: p.projectDescription,
        projectDescription: p.projectDescription,
        projectCategory: p.projectCategory,
        imageUrl: getProjectWebImage(p.canonicalId || p.projectSlug, p.projectCategory),
        projectType: p.projectType,
        technologyStack: p.technologyStack,
        portfolioVisibility: true,
        featured: p.featured,
        createdAt: null,
        updatedAt: null,
        status: 'active' as const
      } as Project));

    return [...flagshipProjects, ...historical];
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      // Query projects approved for public portfolio showcase
      const q = query(
        collection(db, 'projects'),
        where('portfolioVisibility', '==', true)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Project[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Strictly exclude sensitive fields: budget, employee IDs, client confidential notes
            list.push({
              id: docSnap.id,
              projectCode: data.projectCode || `SRI-${docSnap.id.slice(0, 4).toUpperCase()}`,
              projectTitle: data.projectTitle || data.name || 'Sricore Project',
              projectSlug: data.projectSlug || docSnap.id,
              name: data.projectTitle || data.name || 'Sricore Project',
              description: data.projectDescription || data.description || '',
              projectDescription: data.projectDescription || data.description || '',
              projectCategory: data.projectCategory || 'Engineering & Software',
              imageUrl: data.imageUrl || getProjectWebImage(data.projectSlug || docSnap.id, data.projectCategory),
              projectType: data.projectType || 'software',
              technologyStack: data.technologyStack || [],
              portfolioVisibility: true,
              featured: data.featured || false,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              status: 'active'
            } as Project);
          });
          setProjects(list);
        } else {
          // If Firestore collection has not yet been populated, display approved historical inventory
          setProjects(defaultPortfolioProjects);
        }
        setLoading(false);
      }, (err) => {
        console.warn("Public portfolio live listener note:", err);
        // Fallback to verified catalog
        setProjects(defaultPortfolioProjects);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore initialization notice:", err);
      setProjects(defaultPortfolioProjects);
      setLoading(false);
    }
  }, [defaultPortfolioProjects]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.projectCategory) set.add(p.projectCategory);
    });
    return ['all', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const title = (p.projectTitle || p.name || '').toLowerCase();
      const desc = (p.projectDescription || p.description || '').toLowerCase();
      const tech = (p.technologyStack || []).join(' ').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || title.includes(q) || desc.includes(q) || tech.includes(q);
      const matchesCategory = selectedCategory === 'all' || p.projectCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Verified Engineering Systems & Case Studies
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5">
              Featured Projects & Innovations
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Explore production deployments, research prototypes, and applied artificial intelligence systems engineered across Sricore Solutions initiatives and research collaborations.
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <Container className="py-10 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <SectionHeader 
              title="Verified Technical Portfolio" 
              description="A curated registry of authentic software platforms, IoT hardware implementations, and environmental data science research."
            />
          </div>

          {/* Search bar */}
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tech, title, domain..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-2 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Domain:
          </span>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? `All Domains (${projects.length})` : cat}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 text-sm">No public projects match the current search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const projectTarget = `/projects/${project.projectSlug || project.id}`;
              const imageSrc = project.imageUrl || getProjectWebImage(project.projectSlug || project.id, project.projectCategory);
              return (
                <div 
                  key={project.id || index} 
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300"
                >
                  {/* Web Image Banner */}
                  <Link to={projectTarget} className="relative h-48 bg-slate-900 overflow-hidden block">
                    <img 
                      src={imageSrc} 
                      alt={project.projectTitle || project.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/40" />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
                        {project.projectCategory || 'Technical System'}
                      </span>
                      {project.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-md">
                          <Sparkles className="w-3 h-3 text-white" /> Featured
                        </span>
                      )}
                    </div>

                    {project.projectCode && (
                      <div className="absolute bottom-3 right-3.5 z-10">
                        <span className="text-[10px] font-mono text-slate-200 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 shadow-xs">
                          {project.projectCode}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    <Link to={projectTarget} className="block group-hover:text-amber-600 transition-colors">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                        {project.projectTitle || project.name}
                      </h3>
                    </Link>

                    <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                      {project.projectDescription || project.description}
                    </p>

                    {/* Tech stack badges */}
                    {project.technologyStack && project.technologyStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.technologyStack.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
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

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 mt-auto">
                      <Link 
                        to={projectTarget} 
                        className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform"
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
        primaryAction={{ label: "Start an Enquiry", href: "/enquiry" }}
      />
    </div>
  );
}
