import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { CTASection } from '../components/ui/CTASection';
import { AdUnit } from '../components/ui/AdUnit';
import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { 
  SELECTED_WORKS, 
  findProjectBySlugOrId, 
  ProjectCaseStudy, 
  transformHistoricalToCaseStudy 
} from '../data/projectsData';
import { HISTORICAL_PROJECTS_INVENTORY } from '../lib/projectMigration';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  Server, 
  ShieldCheck, 
  Terminal, 
  Play, 
  RefreshCw, 
  Layers, 
  FileCode2, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Clock, 
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Sliders,
  Check,
  ChevronRight,
  Database,
  Lock,
  Eye,
  Radio
} from 'lucide-react';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useWebsiteSettings();
  const primaryColor = settings?.theme?.primary || '#d97706';

  const [project, setProject] = useState<ProjectCaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'features' | 'tech' | 'specs'>('overview');

  // Interactive simulation states
  // 1. Vision inspection simulator
  const [visionMode, setVisionMode] = useState<'nominal' | 'defect_crack' | 'defect_solder'>('nominal');
  const [inspectionCount, setInspectionCount] = useState(14820);
  const [rejectedCount, setRejectedCount] = useState(24);
  const [isScanning, setIsScanning] = useState(true);

  // 2. IoT Telemetry simulator
  const [iotState, setIotState] = useState<'normal' | 'vibration_warning' | 'thermal_alert'>('normal');
  const [tempValue, setTempValue] = useState(58.4);
  const [vibrationValue, setVibrationValue] = useState(1.8);
  const [motorCurrent, setMotorCurrent] = useState(41.2);

  // 3. Health API sandbox
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('patient');
  const [apiResponseLoading, setApiResponseLoading] = useState(false);
  const [apiLatency, setApiLatency] = useState(24);
  const [apiSuccess, setApiSuccess] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Load project by slug or ID
  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      if (!slug) {
        setProject(null);
        setLoading(false);
        return;
      }

      // 1. Check local case studies / historical inventory first
      const foundLocal = findProjectBySlugOrId(slug);
      if (foundLocal) {
        setProject(foundLocal);
        setLoading(false);
        return;
      }

      // 2. Try querying Firestore projects collection
      try {
        // Try by slug
        const qSlug = query(collection(db, 'projects'), where('projectSlug', '==', slug));
        const slugSnap = await getDocs(qSlug);
        if (!slugSnap.empty) {
          const docData = slugSnap.docs[0].data();
          setProject(transformHistoricalToCaseStudy({
            canonicalId: slugSnap.docs[0].id,
            projectCode: docData.projectCode || `SRI-${slugSnap.docs[0].id.slice(0, 4).toUpperCase()}`,
            projectTitle: docData.projectTitle || docData.name || 'Sricore Project',
            projectSlug: docData.projectSlug || slug,
            projectDescription: docData.projectDescription || docData.description || '',
            problemStatement: docData.problemStatement || '',
            proposedSolution: docData.proposedSolution || '',
            projectCategory: docData.projectCategory || 'Engineering System',
            projectType: docData.projectType || 'software',
            ownershipType: docData.ownershipType || 'internal',
            clientId: docData.clientId || '',
            clientNameSnapshot: docData.clientNameSnapshot || '',
            employerId: docData.employerId || '',
            employerNameSnapshot: docData.employerNameSnapshot || '',
            projectManagerId: docData.projectManagerId || '',
            teamMemberIds: docData.teamMemberIds || [],
            departmentId: docData.departmentId || '',
            technologyStack: docData.technologyStack || [],
            features: docData.features || [],
            objectives: docData.objectives || [],
            scope: docData.scope || '',
            deliverables: docData.deliverables || [],
            startDate: docData.startDate || null,
            expectedEndDate: docData.expectedEndDate || null,
            actualEndDate: docData.actualEndDate || null,
            budget: docData.budget || null,
            currency: docData.currency || 'INR',
            paymentStatus: docData.paymentStatus || 'not_applicable',
            projectStatus: docData.projectStatus || 'active',
            projectStage: docData.projectStage || 'production',
            progressPercentage: docData.progressPercentage || 100,
            repositoryUrl: docData.repositoryUrl || '',
            demoUrl: docData.demoUrl || '',
            documentationPath: docData.documentationPath || '',
            portfolioVisibility: true,
            featured: docData.featured || false,
            sourceReferences: docData.sourceReferences || [],
            dataVerificationStatus: docData.dataVerificationStatus || 'verified',
            verificationNotes: docData.verificationNotes || '',
            missingInformationFlags: []
          }));
          setLoading(false);
          return;
        }

        // Try by doc ID
        const docRef = doc(db, 'projects', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setProject(transformHistoricalToCaseStudy({
            canonicalId: docSnap.id,
            projectCode: docData.projectCode || `SRI-${docSnap.id.slice(0, 4).toUpperCase()}`,
            projectTitle: docData.projectTitle || docData.name || 'Sricore Project',
            projectSlug: docData.projectSlug || slug,
            projectDescription: docData.projectDescription || docData.description || '',
            problemStatement: docData.problemStatement || '',
            proposedSolution: docData.proposedSolution || '',
            projectCategory: docData.projectCategory || 'Engineering System',
            projectType: docData.projectType || 'software',
            ownershipType: docData.ownershipType || 'internal',
            clientId: docData.clientId || '',
            clientNameSnapshot: docData.clientNameSnapshot || '',
            employerId: docData.employerId || '',
            employerNameSnapshot: docData.employerNameSnapshot || '',
            projectManagerId: docData.projectManagerId || '',
            teamMemberIds: docData.teamMemberIds || [],
            departmentId: docData.departmentId || '',
            technologyStack: docData.technologyStack || [],
            features: docData.features || [],
            objectives: docData.objectives || [],
            scope: docData.scope || '',
            deliverables: docData.deliverables || [],
            startDate: docData.startDate || null,
            expectedEndDate: docData.expectedEndDate || null,
            actualEndDate: docData.actualEndDate || null,
            budget: docData.budget || null,
            currency: docData.currency || 'INR',
            paymentStatus: docData.paymentStatus || 'not_applicable',
            projectStatus: docData.projectStatus || 'active',
            projectStage: docData.projectStage || 'production',
            progressPercentage: docData.progressPercentage || 100,
            repositoryUrl: docData.repositoryUrl || '',
            demoUrl: docData.demoUrl || '',
            documentationPath: docData.documentationPath || '',
            portfolioVisibility: true,
            featured: docData.featured || false,
            sourceReferences: docData.sourceReferences || [],
            dataVerificationStatus: docData.dataVerificationStatus || 'verified',
            verificationNotes: docData.verificationNotes || '',
            missingInformationFlags: []
          }));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Firestore project lookup warning:', err);
      }

      setProject(null);
      setLoading(false);
    }

    loadProject();
  }, [slug]);

  // Periodic heartbeat for vision inspection simulator
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setInspectionCount(c => c + 1);
      if (visionMode !== 'nominal' && Math.random() > 0.6) {
        setRejectedCount(r => r + 1);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [isScanning, visionMode]);

  // Handle IoT mode simulation adjustments
  useEffect(() => {
    if (iotState === 'normal') {
      setTempValue(58.4);
      setVibrationValue(1.8);
      setMotorCurrent(41.2);
    } else if (iotState === 'vibration_warning') {
      setTempValue(68.2);
      setVibrationValue(4.7);
      setMotorCurrent(48.6);
    } else if (iotState === 'thermal_alert') {
      setTempValue(84.6);
      setVibrationValue(6.9);
      setMotorCurrent(56.1);
    }
  }, [iotState]);

  // Handle API simulation trigger
  const triggerApiRequest = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setApiResponseLoading(true);
    setTimeout(() => {
      setApiResponseLoading(false);
      setApiLatency(Math.floor(Math.random() * 15) + 18);
      setApiSuccess(true);
    }, 450);
  };

  // Other related projects for cross-navigation
  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return SELECTED_WORKS
      .filter(p => p.id !== project.id)
      .slice(0, 2);
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading System Specifications...</p>
        </div>
      </div>
    );
  }

  // Not found fallback
  if (!project) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-16 flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Project Specification Not Found</h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              We couldn&apos;t locate a registered case study matching <code className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs">{slug}</code> in our public technical portfolio.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left mb-6">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Explore Flagship Selected Works:</p>
              <div className="space-y-2">
                {SELECTED_WORKS.map(p => (
                  <Link 
                    key={p.id}
                    to={`/projects/${p.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{p.title}</span>
                      <span className="text-[11px] text-slate-500 block">{p.category}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/projects"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> View All Projects Portfolio
              </Link>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <section className="bg-slate-900 text-white pt-8 pb-12 md:pb-16 border-b border-slate-800 relative overflow-hidden">
        {/* Background circuit grid accent */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ 
            backgroundImage: `radial-gradient(${primaryColor} 1.5px, transparent 1.5px)`, 
            backgroundSize: '24px 24px' 
          }}
        ></div>

        <Container className="relative z-10">
          {/* Breadcrumb nav */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link to="/projects" className="hover:text-white transition-colors">Projects & Works</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-200 truncate max-w-xs">{project.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase"
                  style={{ 
                    backgroundColor: `${primaryColor}25`, 
                    color: primaryColor,
                    borderColor: `${primaryColor}50`,
                    borderWidth: '1px'
                  }}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {project.category}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  <Terminal className="w-3 h-3 text-amber-400" />
                  {project.projectCode}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {project.title}
              </h1>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
                {project.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <strong className="text-slate-300 font-medium">Domain:</strong> {project.domain}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <strong className="text-slate-300 font-medium">Cycle:</strong> {project.timeline}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-slate-300 font-medium">Tier:</strong> {project.clientType}
                </span>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-4 bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-xl flex flex-col gap-4">
              {project.imageUrl && (
                <div className="relative h-40 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white/90 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Deployment Architecture
                    </span>
                    <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-white/10 text-amber-300">
                      {project.projectCode}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Technical Brief</span>
                  <div className="text-sm font-bold text-white">Engineering Architecture</div>
                </div>
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: primaryColor }}
                ></span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Deployment Status</span>
                  <span className="font-semibold text-emerald-400">{project.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Project Reference</span>
                  <span className="font-mono text-slate-300">{project.projectCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/60">
                  <span className="text-slate-400">Verification</span>
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" /> Production Verified
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to={`/enquiry?project=${encodeURIComponent(project.title)}&code=${project.projectCode}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg text-white shadow-xs transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Inquire Architecture Deployment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/projects"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Catalog
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. KEY METRICS STRIP */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="bg-white border-b border-slate-200 py-6">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {project.metrics.map((metric, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-center"
                >
                  <div 
                    className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1"
                    style={{ color: primaryColor }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">{metric.label}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">{metric.sublabel}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3. NAVIGATION TABS */}
      <section className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {[
              { id: 'overview', label: 'Executive Overview', icon: Layers },
              { id: 'architecture', label: 'Live Simulation & Architecture', icon: Activity },
              { id: 'features', label: 'Key Features & Capabilities', icon: Sparkles },
              { id: 'tech', label: 'Technology Stack', icon: FileCode2 },
              { id: 'specs', label: 'Specifications & Deliverables', icon: Terminal }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? primaryColor : undefined
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. MAIN BODY CONTENT */}
      <Container className="py-10 md:py-14">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Problem & Solution side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Challenge / Problem */}
              <div className="bg-white rounded-2xl border border-red-200/80 p-6 md:p-8 flex flex-col shadow-xs">
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
                  <AlertCircle className="w-4 h-4" /> The Operational Challenge
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Problem Statement</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {project.problemStatement}
                </p>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Critical Constraints & Vulnerabilities:
                </h4>
                <ul className="space-y-2.5 mt-auto">
                  {project.challengePoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution */}
              <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 md:p-8 flex flex-col shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 className="w-4 h-4" /> The Engineered Solution
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Sricore Architecture Approach</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {project.proposedSolution}
                </p>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Multi-Tier Architectural Highlights:
                </h4>
                <div className="space-y-2.5 mt-auto">
                  {project.architectureHighlights.map((arch, i) => (
                    <div key={i} className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-xs">
                      <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        {arch.layer}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{arch.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Summary Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-2xl border border-slate-700 shadow-md">
              <div className="max-w-3xl">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-1 block">
                  Implementation Summary
                </span>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  Enterprise Impact & Verified Outcomes
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {project.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ARCHITECTURE & LIVE SIMULATION TAB */}
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                    <Activity className="w-4 h-4" /> Live System Telemetry & Interactive Simulation
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Interactive Demonstration Model
                  </h3>
                  <p className="text-xs text-slate-500">
                    Experience simulated sensor ingestion, edge vision classification, and API response cycles in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Simulator Active
                  </span>
                </div>
              </div>

              {/* 1. VISION INSPECTION SIMULATOR */}
              {project.demoType === 'computer-vision' && (
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" /> Test Infeed Scenario:
                    </span>
                    <button
                      type="button"
                      onClick={() => setVisionMode('nominal')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        visionMode === 'nominal'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Nominal Spec (Good PCB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisionMode('defect_crack')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        visionMode === 'defect_crack'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Micro-Crack Defect (0.08mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisionMode('defect_solder')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        visionMode === 'defect_solder'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Cold Solder Bridge (IC Pin 14)
                    </button>
                  </div>

                  {/* Simulator Screen */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Visual Feed Box */}
                    <div className="lg:col-span-7 bg-slate-950 rounded-xl p-5 text-white border border-slate-800 relative min-h-[300px] flex flex-col justify-between overflow-hidden">
                      {/* Top HUD */}
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 z-10">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          CAM_01: BASLER 4K @ 120 FPS
                        </span>
                        <span>EXPOSURE: 180µs | COAXIAL STROBE</span>
                      </div>

                      {/* Mocked PCB Canvas with overlay */}
                      <div className="my-auto py-6 flex items-center justify-center relative">
                        <div className="w-72 h-44 bg-slate-900 border-2 border-emerald-500/40 rounded-lg relative shadow-inner p-3 flex flex-col justify-between">
                          {/* PCB Tracks pattern */}
                          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                          
                          {/* Microcontroller chip */}
                          <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded mx-auto my-auto flex items-center justify-center text-center p-1 relative z-10">
                            <span className="text-[9px] font-mono text-slate-400">ARM CORTEX-M4</span>
                          </div>

                          {/* Bounding box overlay depending on mode */}
                          {visionMode === 'nominal' ? (
                            <div className="absolute inset-2 border-2 border-dashed border-emerald-400/60 rounded flex items-start justify-end p-1.5">
                              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                PASS (Conf: 99.8%)
                              </span>
                            </div>
                          ) : visionMode === 'defect_crack' ? (
                            <div className="absolute top-6 left-10 w-24 h-16 border-2 border-red-500 bg-red-500/10 rounded flex flex-col justify-between p-1 animate-pulse">
                              <span className="text-[9px] font-mono font-bold bg-red-600 text-white px-1 rounded w-fit">
                                FLAW: CRACK 0.08mm
                              </span>
                              <span className="text-[8px] font-mono text-red-300">CONF: 99.4%</span>
                            </div>
                          ) : (
                            <div className="absolute bottom-6 right-8 w-28 h-14 border-2 border-amber-500 bg-amber-500/10 rounded flex flex-col justify-between p-1 animate-pulse">
                              <span className="text-[9px] font-mono font-bold bg-amber-600 text-white px-1 rounded w-fit">
                                SOLDER_BRIDGE #14
                              </span>
                              <span className="text-[8px] font-mono text-amber-300">CONF: 98.7%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom HUD */}
                      <div className="flex flex-wrap justify-between items-center text-[11px] font-mono z-10 pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Inference: <strong className="text-emerald-400">11.4 ms</strong> (TensorRT FP16)</span>
                        <span className="text-slate-400">Actuation: <strong className={visionMode === 'nominal' ? 'text-emerald-400' : 'text-red-400'}>
                          {visionMode === 'nominal' ? 'PASSED TO CONVEYOR' : 'PNEUMATIC DIVERTER FIRED'}
                        </strong></span>
                      </div>
                    </div>

                    {/* Telemetry Stats */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Shift Infeed Ledger</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-slate-500">Total Scanned</span>
                            <div className="text-xl font-mono font-bold text-slate-900">{inspectionCount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500">Quarantined</span>
                            <div className="text-xl font-mono font-bold text-red-600">{rejectedCount.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Model Quantization</span>
                          <span className="font-mono font-semibold text-slate-900">FP16 CUDA Core</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Camera Global Shutter</span>
                          <span className="font-mono font-semibold text-slate-900">Active (Zero Smear)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Rejection Actuator Loop</span>
                          <span className="font-mono font-semibold text-emerald-600">Sub-5ms PLC Interlock</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsScanning(!isScanning)}
                        className="mt-auto w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Live Conveyor Infeed Running' : 'Resume Live Infeed'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. IOT DASHBOARD SIMULATOR */}
              {project.demoType === 'iot-telemetry' && (
                <div className="space-y-6">
                  {/* Anomaly triggers */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" /> Inject Plant Scenario:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIotState('normal')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        iotState === 'normal'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Nominal Operation (Motor Line A)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIotState('vibration_warning')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        iotState === 'vibration_warning'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Bearing Vibration Anomaly (FFT 2x Har.)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIotState('thermal_alert')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        iotState === 'thermal_alert'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Thermal Runaway Warning (&gt;80°C)
                    </button>
                  </div>

                  {/* 4 Gauge Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>Drive Temp (IR Sensor)</span>
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="text-2xl font-mono font-bold mb-1">
                        {tempValue.toFixed(1)} <span className="text-xs font-sans text-slate-400">°C</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            tempValue > 80 ? 'bg-red-500' : tempValue > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (tempValue / 100) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Threshold Limit: 75.0°C</span>
                    </div>

                    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>RMS Vibration (Triaxial)</span>
                        <Radio className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-2xl font-mono font-bold mb-1">
                        {vibrationValue.toFixed(1)} <span className="text-xs font-sans text-slate-400">mm/s</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            vibrationValue > 6 ? 'bg-red-500' : vibrationValue > 3.5 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, (vibrationValue / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">ISO 10816 Zone B: 4.5 mm/s</span>
                    </div>

                    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>Motor Phase Current</span>
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-mono font-bold mb-1">
                        {motorCurrent.toFixed(1)} <span className="text-xs font-sans text-slate-400">Amps</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${(motorCurrent / 70) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Nominal Load: 42.0 A</span>
                    </div>

                    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span>Health Index / OEE</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-mono font-bold mb-1">
                        {iotState === 'normal' ? '98.2%' : iotState === 'vibration_warning' ? '74.6%' : '42.1%'}
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            iotState === 'normal' ? 'bg-emerald-500' : iotState === 'vibration_warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: iotState === 'normal' ? '98%' : iotState === 'vibration_warning' ? '74%' : '42%' }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">TimescaleDB Hypertable Sync</span>
                    </div>
                  </div>

                  {/* Alert dispatch note */}
                  <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                    iotState === 'normal'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : iotState === 'vibration_warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {iotState === 'normal' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <span>
                        <strong>Telemetry Status: </strong>
                        {iotState === 'normal' 
                          ? 'All 1,240 nodes communicating nominally via LoRaWAN/Modbus. Zero threshold breaches.'
                          : iotState === 'vibration_warning'
                            ? 'Warning: FFT harmonic peak in motor bearing #2. Automated preventative work order WO-9042 generated.'
                            : 'Critical Alert: Drive thermal trip imminent. Automated SMS alert dispatched to On-Duty Maintenance Chief.'}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">50k pts/sec</span>
                  </div>
                </div>
              )}

              {/* 3. HEALTH API EXPLORER */}
              {project.demoType === 'api-explorer' && (
                <div className="space-y-6">
                  {/* Endpoint Selectors */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" /> Select FHIR Endpoint:
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerApiRequest('patient')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        selectedEndpoint === 'patient'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      GET /fhir/r4/Patient/PT-90218
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerApiRequest('vitals')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        selectedEndpoint === 'vitals'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      GET /fhir/r4/Observation?category=vitals
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerApiRequest('hl7_bridge')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        selectedEndpoint === 'hl7_bridge'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      POST /api/v1/hl7/adt-infeed
                    </button>
                  </div>

                  {/* Terminal console output */}
                  <div className="bg-slate-950 rounded-xl p-5 text-white border border-slate-800 font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <span className="ml-2 text-slate-300 font-bold">SMART-on-FHIR Gateway Terminal</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> mTLS 1.3 AES-256
                        </span>
                        <span className="text-slate-400">Latency: <strong className="text-purple-300">{apiLatency} ms</strong></span>
                      </div>
                    </div>

                    {apiResponseLoading ? (
                      <div className="py-8 flex items-center justify-center gap-2 text-purple-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Performing cryptographic zero-trust handshake...</span>
                      </div>
                    ) : (
                      <pre className="text-slate-300 overflow-x-auto leading-relaxed max-h-64 scrollbar-thin">
                        {selectedEndpoint === 'patient' && JSON.stringify({
                          resourceType: "Patient",
                          id: "PT-90218",
                          active: true,
                          identifier: [
                            { system: "urn:oid:2.16.840.1.113883.4.1", value: "EHR-HOSP-5018" }
                          ],
                          name: [{ use: "official", family: "Krishnan", given: ["Arun", "V."] }],
                          gender: "male",
                          birthDate: "1988-06-14",
                          telecom: [{ system: "phone", value: "+91-9840******", use: "mobile" }],
                          managingOrganization: { reference: "Organization/Sricore-Health-Network" },
                          _meta: {
                            securityLevel: "HIPAA-Confidential",
                            rowLevelSecurity: "Enforced",
                            accessAuditId: "AUD-991823"
                          }
                        }, null, 2)}

                        {selectedEndpoint === 'vitals' && JSON.stringify({
                          resourceType: "Bundle",
                          type: "searchset",
                          total: 2,
                          entry: [
                            {
                              resource: {
                                resourceType: "Observation",
                                status: "final",
                                code: { text: "Blood Pressure" },
                                component: [
                                  { code: { text: "Systolic" }, valueQuantity: { value: 124, unit: "mmHg" } },
                                  { code: { text: "Diastolic" }, valueQuantity: { value: 82, unit: "mmHg" } }
                                ],
                                effectiveDateTime: "2024-04-12T09:15:00Z"
                              }
                            },
                            {
                              resource: {
                                resourceType: "Observation",
                                status: "final",
                                code: { text: "Pulse Oximetry (SpO2)" },
                                valueQuantity: { value: 99, unit: "%" },
                                effectiveDateTime: "2024-04-12T09:15:00Z"
                              }
                            }
                          ]
                        }, null, 2)}

                        {selectedEndpoint === 'hl7_bridge' && JSON.stringify({
                          status: "success",
                          messageType: "ADT^A08 (Patient Information Update)",
                          hl7MessageId: "MSG-20240412-0941",
                          transformedFhirResources: [
                            "Patient/PT-90218",
                            "Encounter/ENC-4412"
                          ],
                          auditLedgerSignature: "SHA256:d8a2...49e1",
                          statutoryCompliance: "DISHA / HIPAA / HL7 R4",
                          queueLatencyMs: 14.8
                        }, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* 4. STANDARD ARCHITECTURE FALLBACK */}
              {project.demoType === 'standard' && (
                <div className="space-y-4">
                  <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
                    <h4 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-wide">
                      System Topology & Layer Breakdown
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      Engineered following standard modular design principles, enabling decoupled integration between persistent data stores, API gateways, and user interfaces.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-amber-400 font-bold block mb-1">01. INGESTION / CLIENT</span>
                        <p className="text-slate-400 font-sans text-[11px]">User client sessions, authenticated web components, or sensor endpoints.</p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-blue-400 font-bold block mb-1">02. PROCESSING BUS</span>
                        <p className="text-slate-400 font-sans text-[11px]">Business logic routing, permission validation, and real-time computation.</p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-emerald-400 font-bold block mb-1">03. PERSISTENCE & AUDIT</span>
                        <p className="text-slate-400 font-sans text-[11px]">Encrypted database storage, append-only logs, and automated compliance ledgers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="text-left max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Core Capabilities</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Engineered System Features</h3>
              <p className="text-sm text-slate-600">
                Explore the functional modules, reliability interlocks, and design decisions embedded into this solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.keyFeatures.map((feat, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5 border border-amber-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-auto">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECH STACK TAB */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            <div className="text-left max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Engineering Foundation</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Technology Stack & Libraries</h3>
              <p className="text-sm text-slate-600">
                Full-spectrum technical components utilized across the firmware, machine learning, application, and database tiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.technologyStack.map((stackGroup, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs"
                >
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-600" />
                    {stackGroup.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stackGroup.items.map((tech, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPECS & DELIVERABLES TAB */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Specs */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-600" />
                Technical Specifications & Tolerances
              </h3>
              <div className="divide-y divide-slate-100">
                {project.systemSpecs.map((spec, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{spec.label}</span>
                    <span className="text-slate-900 font-mono font-semibold text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Project Deliverables & Artifacts
              </h3>
              <ul className="space-y-3">
                {project.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Container>

      {/* Policy-Compliant In-Content Ad Placement on Substantive Case Study */}
      <Container>
        <AdUnit className="my-6" />
      </Container>

      {/* 5. RELATED PROJECTS EXPLORATION */}
      {relatedProjects.length > 0 && (
        <section className="bg-white border-t border-slate-200 py-12">
          <Container>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">More Works</span>
                <h3 className="text-xl font-bold text-slate-900">Explore Other Selected Projects</h3>
              </div>
              <Link 
                to="/projects"
                className="inline-flex items-center text-xs font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                View Full Catalog <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProjects.map(rel => (
                <Link
                  key={rel.id}
                  to={`/projects/${rel.slug}`}
                  className="group bg-slate-50 rounded-xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                        {rel.category}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{rel.projectCode}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {rel.summary}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform pt-3 border-t border-slate-200">
                    Read Complete Case Study <ArrowRight className="ml-1.5 w-3.5 h-3.5 text-amber-600" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 6. CALL TO ACTION */}
      <CTASection
        title={`Interested in building or customizing ${project.title}?`}
        description={`Connect directly with the ${settings?.brandName || 'Sricore Solutions'} engineering division to evaluate technical feasibility, request full system schematics, or deploy this architecture.`}
        primaryAction={{ 
          label: "Inquire Architecture Deployment", 
          href: `/enquiry?project=${encodeURIComponent(project.title)}&code=${project.projectCode}` 
        }}
        secondaryAction={{ 
          label: "View All Projects", 
          href: "/projects" 
        }}
      />
    </div>
  );
}
