import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CTASection } from '../components/ui/CTASection';
import { OFFICIAL_JOB_OPENINGS, JobOpening } from '../data/careersData';
import { OFFICIAL_GFORM_INTERNSHIPS, GFORM_CONFIG, FormInternshipDomain } from '../data/internshipsData';
import { JobApplicationModal } from '../components/forms/JobApplicationModal';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { 
  Search, 
  X, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  Code, 
  Cpu, 
  Brain, 
  Layers, 
  Laptop, 
  Calendar, 
  Eye, 
  Users, 
  Zap, 
  Globe, 
  FileText,
  Building2,
  Filter
} from 'lucide-react';

// Unified opportunity model for universal search & filtering
export type OpportunityType = 'job' | 'internship';

export interface UnifiedOpportunity {
  id: string;
  type: OpportunityType;
  title: string;
  category: 'Software & Engineering' | 'Hardware & IoT' | 'AI & Machine Learning' | 'Design & Creative' | 'Business & Growth';
  department: string;
  locationOrMode: string;
  commitment: string; // "Full-Time" or "1 Month Fast-Track"
  compensationOrPerks: string;
  summary: string;
  technologies: string[];
  featured?: boolean;
  jobData?: JobOpening;
  internshipData?: FormInternshipDomain;
}

export default function Careers({ defaultTab }: { defaultTab?: 'all' | 'jobs' | 'internships' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  // Read URL query parameters for initial state
  const typeParam = searchParams.get('type') || (defaultTab === 'internships' ? 'internships' : 'all');
  const searchParam = searchParams.get('q') || '';
  const domainParam = searchParams.get('category') || 'All';

  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'internships'>(
    typeParam === 'internships' ? 'internships' : typeParam === 'jobs' ? 'jobs' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(domainParam);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Application Modal state for jobs
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobOpening | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Embedded form toggle state for internships
  const [showEmbedForm, setShowEmbedForm] = useState(false);

  // Synchronize state when URL params change
  useEffect(() => {
    if (searchParams.get('type') === 'internships') {
      setActiveTab('internships');
    } else if (searchParams.get('type') === 'jobs') {
      setActiveTab('jobs');
    }
  }, [searchParams]);

  // Combine both sources into a unified searchable array
  const allOpportunities = useMemo<UnifiedOpportunity[]>(() => {
    const jobs: UnifiedOpportunity[] = OFFICIAL_JOB_OPENINGS.map(job => ({
      id: `job-${job.id}`,
      type: 'job',
      title: job.title,
      category: job.category,
      department: job.department,
      locationOrMode: job.location,
      commitment: `${job.type} • ${job.experience}`,
      compensationOrPerks: job.salary,
      summary: job.overview,
      technologies: job.technologies,
      featured: job.featured,
      jobData: job
    }));

    const internships: UnifiedOpportunity[] = OFFICIAL_GFORM_INTERNSHIPS.map(intern => ({
      id: `intern-${intern.id}`,
      type: 'internship',
      title: `${intern.name} Internship`,
      category: intern.category,
      department: intern.category,
      locationOrMode: intern.mode,
      commitment: `${intern.duration} • ${intern.projectsCount}`,
      compensationOrPerks: 'Verified Certificate & 24-48h Offer Letter',
      summary: intern.description,
      technologies: intern.technologies,
      featured: intern.popular,
      internshipData: intern
    }));

    return [...jobs, ...internships];
  }, []);

  // Filter logic based on tab, category, and free-text search query
  const filteredOpportunities = useMemo(() => {
    return allOpportunities.filter(opp => {
      // 1. Tab filter (All, Jobs, Internships)
      if (activeTab === 'jobs' && opp.type !== 'job') return false;
      if (activeTab === 'internships' && opp.type !== 'internship') return false;

      // 2. Category / Domain filter
      if (selectedCategory !== 'All' && opp.category !== selectedCategory) return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesSummary = opp.summary.toLowerCase().includes(q);
        const matchesDept = opp.department.toLowerCase().includes(q);
        const matchesCategory = opp.category.toLowerCase().includes(q);
        const matchesLocation = opp.locationOrMode.toLowerCase().includes(q);
        const matchesType = opp.type === 'job' 
          ? ('job full-time fulltime opening'.includes(q) || 'jobs'.includes(q))
          : ('internship intern gform google form training'.includes(q) || 'internships'.includes(q));
        
        const matchesTech = opp.technologies.some(tech => tech.toLowerCase().includes(q));

        // Sub-details match
        let matchesDetails = false;
        if (opp.jobData) {
          matchesDetails = 
            opp.jobData.requirements.some(r => r.toLowerCase().includes(q)) ||
            opp.jobData.keyResponsibilities.some(r => r.toLowerCase().includes(q));
        } else if (opp.internshipData) {
          matchesDetails = 
            opp.internshipData.keyTopics.some(t => t.toLowerCase().includes(q)) ||
            opp.internshipData.projectExamples.some(p => p.toLowerCase().includes(q)) ||
            opp.internshipData.tagline.toLowerCase().includes(q);
        }

        return matchesTitle || matchesSummary || matchesDept || matchesCategory || matchesLocation || matchesTech || matchesType || matchesDetails;
      }

      return true;
    });
  }, [allOpportunities, activeTab, selectedCategory, searchQuery]);

  // Counts for tabs
  const totalJobsCount = OFFICIAL_JOB_OPENINGS.length;
  const totalInternshipsCount = OFFICIAL_GFORM_INTERNSHIPS.length;
  const totalAllCount = totalJobsCount + totalInternshipsCount;

  // Categories list
  const categoryOptions = [
    'All',
    'Software & Engineering',
    'Hardware & IoT',
    'AI & Machine Learning',
    'Design & Creative',
    'Business & Growth'
  ];

  // Quick search presets
  const quickSearchKeywords = [
    'Python',
    'Full Stack',
    'Hardware & IoT',
    'AI & ML',
    'Java',
    'React',
    'Firmware',
    'UI/UX'
  ];

  const handleApplyJob = (job: JobOpening) => {
    setSelectedJobForModal(job);
    setIsModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900 text-white py-12 md:py-16 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            {/* Highlights Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Career Portal • {totalJobsCount} Job Openings & {totalInternshipsCount} Internship Domains</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Career
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 font-normal">
              Whether you are an experienced software architect, embedded systems engineer, or a passionate student seeking our <strong>1-Month Industrial Internship with 2+ real-world projects</strong>, explore all opportunities in one place.
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a 
                href="#search-section" 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <Search className="w-4 h-4" />
                <span>Search All Positions</span>
              </a>

              <a 
                href={GFORM_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full-Time Openings</span>
                <span className="font-bold text-white text-sm">{totalJobsCount} Engineering Roles</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Internship Domains</span>
                <span className="font-bold text-white text-sm">{totalInternshipsCount} Official Programs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Offer Letter Delivery</span>
                <span className="font-bold text-amber-400 text-sm">24 - 48 Hours</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Headquarters & Lab</span>
                <span className="font-bold text-white text-sm">Namakkal, Tamil Nadu</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. SEARCH & DISCOVERY CENTERPIECE */}
      <div id="search-section" className="scroll-mt-20 py-8 bg-white border-b border-slate-200 shadow-sm sticky top-14 z-40">
        <Container>
          <div className="flex flex-col gap-4">
            
            {/* Search Input Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-amber-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exact job or internship (e.g., Python, React, Hardware, AI, Firmware, Full-Stack, Figma)..."
                className="w-full pl-11 pr-24 py-3 sm:py-3.5 text-sm sm:text-base bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-2xl shadow-inner focus:ring-4 focus:ring-amber-500/15 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[11px] font-semibold px-2 py-1 bg-slate-200/80 text-slate-600 rounded-lg hidden sm:inline-block">
                  {filteredOpportunities.length} found
                </span>
              </div>
            </div>

            {/* Quick Keyword Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-slate-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Quick filters:
              </span>
              {quickSearchKeywords.map(keyword => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setSearchQuery(prev => prev === keyword ? '' : keyword)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                    searchQuery.toLowerCase() === keyword.toLowerCase()
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {keyword}
                </button>
              ))}
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ml-auto"
                >
                  <X className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Opportunity Type Tabs & Domain Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              
              {/* Type Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl max-w-full overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All Opportunities</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                    {totalAllCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'jobs'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full-Time Jobs</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700">
                    {totalJobsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('internships')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'internships'
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Industrial Internships</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                    {totalInternshipsCount}
                  </span>
                </button>
              </div>

              {/* Department / Category Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden md:inline">Domain:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-700 shadow-sm"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Engineering Domains' : cat}</option>
                  ))}
                </select>
              </div>

            </div>

          </div>
        </Container>
      </div>

      {/* 3. OPPORTUNITIES LISTINGS */}
      <Container className="py-10 md:py-14">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Available Positions & Programs</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {filteredOpportunities.length} matching
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {activeTab === 'all' && 'Showing both Full-Time Engineering Jobs and 1-Month Industrial Internship Programs.'}
              {activeTab === 'jobs' && 'Showing actively hiring full-time roles across our engineering teams.'}
              {activeTab === 'internships' && 'Showing official 1-month industrial training domains.'}
            </p>
          </div>

          {/* Quick jump to embed or form */}
          {activeTab !== 'jobs' && (
            <button
              type="button"
              onClick={() => {
                setShowEmbedForm(!showEmbedForm);
                if (!showEmbedForm) {
                  document.getElementById('google-form-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200/80 transition-colors shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showEmbedForm ? 'Hide Application Form' : 'Fill Application Form Here'}</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto my-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Matching Positions Found</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              We couldn't find any job or internship matching <strong>"{searchQuery}"</strong> in the <strong>{selectedCategory}</strong> domain. Try modifying your search keywords or reset filters to see all open positions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Clear Search & Filters
              </button>
              <Link
                to="/contact"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-300"
              >
                Submit Speculative Application
              </Link>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {filteredOpportunities.map((opp) => {
              const isJob = opp.type === 'job';
              const isExpanded = expandedId === opp.id;

              return (
                <div 
                  key={opp.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                    isJob 
                      ? 'border-slate-200 hover:border-blue-300' 
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {/* Top Bar with Badge & Category */}
                  <div className="p-5 sm:p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {isJob ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            <span>Full-Time Job</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Industrial Internship</span>
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {opp.category}
                        </span>

                        {opp.featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Right tag (salary or offer time) */}
                      <span className="text-xs font-bold text-slate-700 shrink-0 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                        {isJob ? opp.compensationOrPerks : 'Offer in 24-48h'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2 hover:text-amber-600 transition-colors">
                      {opp.title}
                    </h3>

                    {/* Meta Info (Location, Experience/Duration) */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opp.locationOrMode}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{opp.commitment}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {opp.summary}
                    </p>

                    {/* Technology tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {opp.technologies.slice(0, 5).map((tech, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {opp.technologies.length > 5 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-medium">
                          +{opp.technologies.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Expandable Section Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200 text-xs">
                        {isJob && opp.jobData && (
                          <>
                            <div>
                              <h4 className="font-bold text-slate-900 mb-1.5">Key Responsibilities:</h4>
                              <ul className="space-y-1 text-slate-600">
                                {opp.jobData.keyResponsibilities.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 mb-1.5">Role Requirements:</h4>
                              <ul className="space-y-1 text-slate-600">
                                {opp.jobData.requirements.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}

                        {!isJob && opp.internshipData && (
                          <>
                            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-amber-700" />
                                <span>Curriculum & Key Topics:</span>
                              </h4>
                              <ul className="space-y-1 text-slate-700">
                                {opp.internshipData.keyTopics.map((topic, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                <Laptop className="w-3.5 h-3.5 text-slate-700" />
                                <span>2+ Live Project Deliverables:</span>
                              </h4>
                              <ul className="space-y-1 text-slate-700">
                                {opp.internshipData.projectExamples.map((proj, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>{proj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-500">
                                <strong>Eligibility:</strong> {opp.internshipData.eligibility}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(opp.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Less Details' : 'Full Details & Syllabus'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      {isJob ? (
                        <button
                          type="button"
                          onClick={() => opp.jobData && handleApplyJob(opp.jobData)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white shadow-sm hover:shadow transition-all"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <span>Apply for Role</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <a
                          href={GFORM_CONFIG.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow transition-all"
                        >
                          <span>Apply for Internship</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>

      {/* 4. OFFICIAL DIRECT PORTAL SECTION (FOR INTERNSHIPS) */}
      <div id="google-form-section" className="bg-slate-900 text-white py-12 md:py-16 scroll-mt-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Fast-Track Internship Application</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Industrial Internship Application Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Applying takes less than 2 minutes. Choose from any of our 7 verified engineering domains and receive your offer letter within 24 to 48 hours.
              </p>
            </div>

            {/* Program Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center">
                <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">24 - 48h Offer Letter</h4>
                <p className="text-xs text-slate-400">Formal document issued directly to your verified email.</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center">
                <Laptop className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">2+ Industry Projects</h4>
                <p className="text-xs text-slate-400">Hands-on practical codebases suitable for GitHub & resumes.</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Verified Certificate</h4>
                <p className="text-xs text-slate-400">Co-branded 1-month certificate + performance LOR.</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <a
                href={GFORM_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Apply for Internship</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setShowEmbedForm(!showEmbedForm)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{showEmbedForm ? 'Hide Application Form' : 'Fill Application Form Here'}</span>
              </button>
            </div>

            {/* Embedded Google Form Container */}
            {showEmbedForm && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in duration-300">
                <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Application Form • {GFORM_CONFIG.title}</span>
                  </span>
                  <a 
                    href={GFORM_CONFIG.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full flex justify-center bg-white">
                  <iframe 
                    src={GFORM_CONFIG.embedUrl} 
                    width="100%" 
                    height="900" 
                    frameBorder="0" 
                    marginHeight={0} 
                    marginWidth={0}
                    title="Official Internship Google Form"
                    className="w-full max-w-3xl border-0"
                  >
                    Loading Google Form...
                  </iframe>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* 5. WHY JOIN SRICORE (CULTURE & BENEFITS) */}
      <Container className="py-12 md:py-16">
        <SectionHeader 
          title="Why Grow Your Career at Sricore?" 
          description="We combine the rigor of an industrial engineering firm with the high-velocity innovation of a modern software studio."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-amber-50 text-amber-700">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Deep Tech Stack</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Work directly across the full technical stack: TypeScript web apps, real-time telemetry, embedded C/C++, and applied machine learning.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-blue-50 text-blue-700">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Physical R&D Hardware Lab</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our Namakkal prototyping facility provides real bench equipment, oscilloscopes, SMD soldering, and IoT gateway testing setups.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-emerald-50 text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Flat, Mentorship-First Culture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct access to senior architects and founders. No bureaucratic layers — good engineering ideas and solid pull requests lead the way.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-purple-50 text-purple-700">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Fast-Track Career Mobility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High performers transition quickly from interns to full-time associate engineers and project leads based on demonstrable merit.
            </p>
          </div>
        </div>
      </Container>

      {/* 6. SPECULATIVE APPLICATION / CONTACT CTA */}
      <CTASection 
        title="Don't see your exact role listed?"
        description="We are always looking for exceptional engineers, hardware designers, and data scientists. Send us a message or your resume for future openings."
        primaryAction={{ label: "Contact Engineering Team", href: "/contact" }}
        secondaryAction={{ label: "Apply for Internship", href: GFORM_CONFIG.url }}
      />

      {/* 7. MODAL FOR FULL-TIME JOB APPLICATIONS */}
      <JobApplicationModal
        job={selectedJobForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        primaryColor={primaryColor}
      />
    </div>
  );
}
