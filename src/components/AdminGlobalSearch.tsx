import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Briefcase,
  MessageSquare,
  X,
  ArrowRight,
  Loader2,
  Command,
  Mail,
  Shield,
  Tag,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Project, Enquiry } from '../types';

export type SearchCategory = 'ALL' | 'USERS' | 'PROJECTS' | 'ENQUIRIES';

interface SearchResultItem {
  id: string;
  category: 'USERS' | 'PROJECTS' | 'ENQUIRIES';
  title: string;
  subtitle: string;
  badge: string;
  statusColor: string;
  route: string;
  meta?: string;
}

export const AdminGlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to Firestore collections (`users`, `projects`, `enquiries`) when AdminDashboard is active
  useEffect(() => {
    let loadedCount = 0;
    const markLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= 3) setLoading(false);
    };

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as User[]
        );
        markLoaded();
      },
      () => markLoaded()
    );

    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        setProjects(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Project[]
        );
        markLoaded();
      },
      () => markLoaded()
    );

    const unsubEnquiries = onSnapshot(
      collection(db, 'enquiries'),
      (snap) => {
        setEnquiries(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Enquiry[]
        );
        markLoaded();
      },
      () => markLoaded()
    );

    return () => {
      unsubUsers();
      unsubProjects();
      unsubEnquiries();
    };
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to focus search, Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 20);
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build unified, categorized search results across Users, Projects, and Inquiries
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // 1. Users
    if (activeCategory === 'ALL' || activeCategory === 'USERS') {
      for (const u of users) {
        const anyUser = u as any;
        const fullName =
          `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
          anyUser.fullName ||
          u.email ||
          'Unnamed User';
        const email = u.email || '';
        const role = u.role || 'USER';
        const phone = u.phone || anyUser.phoneNumber || '';
        const dept = anyUser.department || '';

        const matches =
          !q ||
          fullName.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          role.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q) ||
          dept.toLowerCase().includes(q);

        if (matches) {
          const isActive = u.isActive !== false;
          items.push({
            id: `user-${u.id || email}`,
            category: 'USERS',
            title: fullName,
            subtitle: email,
            badge: role,
            statusColor: isActive
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
            route: `/admin/users?search=${encodeURIComponent(email || fullName)}`,
            meta: isActive ? 'Active Account' : 'Inactive Account',
          });
        }
      }
    }

    // 2. Projects
    if (activeCategory === 'ALL' || activeCategory === 'PROJECTS') {
      for (const p of projects) {
        const title = p.projectTitle || p.name || 'Untitled Project';
        const code = p.projectCode || '';
        const desc = p.projectDescription || p.description || '';
        const type = p.projectType || 'software';
        const status = p.projectStatus || p.status || 'active';
        const tech = Array.isArray(p.technologyStack)
          ? p.technologyStack.join(' ')
          : '';

        const matches =
          !q ||
          title.toLowerCase().includes(q) ||
          code.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          type.toLowerCase().includes(q) ||
          status.toLowerCase().includes(q) ||
          tech.toLowerCase().includes(q);

        if (matches) {
          items.push({
            id: `project-${p.id || title}`,
            category: 'PROJECTS',
            title: code ? `${code} · ${title}` : title,
            subtitle: desc || `Category: ${type.toUpperCase()}`,
            badge: status.replace('_', ' ').toUpperCase(),
            statusColor:
              status === 'completed'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : status === 'in_progress' || status === 'active'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
            route: `/admin/projects?search=${encodeURIComponent(title)}`,
            meta: type.toUpperCase(),
          });
        }
      }
    }

    // 3. Inquiries / Enquiries
    if (activeCategory === 'ALL' || activeCategory === 'ENQUIRIES') {
      for (const e of enquiries) {
        const senderName =
          e.name ||
          `${e.firstName || ''} ${e.lastName || ''}`.trim() ||
          e.email ||
          'Anonymous Inquiry';
        const email = e.email || '';
        const subject = e.subject || e.serviceInterest || e.enquiryType || 'General Inquiry';
        const message = e.message || e.projectDetails || '';
        const company = e.company || '';
        const status = e.status || 'NEW';

        const matches =
          !q ||
          senderName.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          subject.toLowerCase().includes(q) ||
          message.toLowerCase().includes(q) ||
          company.toLowerCase().includes(q) ||
          status.toLowerCase().includes(q);

        if (matches) {
          items.push({
            id: `enquiry-${e.id || email}-${subject}`,
            category: 'ENQUIRIES',
            title: `${senderName}${company ? ` (${company})` : ''}`,
            subtitle: `${subject}${message ? ` — ${message}` : ''}`,
            badge: status,
            statusColor:
              status === 'NEW'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : status === 'APPROVED' || status === 'CONVERTED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
            route: `/admin/enquiries?search=${encodeURIComponent(email || senderName)}`,
            meta: email,
          });
        }
      }
    }

    // Limit displayed items for snappy rendering
    if (!q && activeCategory === 'ALL') {
      const sampleUsers = items.filter((i) => i.category === 'USERS').slice(0, 3);
      const sampleProjects = items.filter((i) => i.category === 'PROJECTS').slice(0, 3);
      const sampleEnquiries = items.filter((i) => i.category === 'ENQUIRIES').slice(0, 3);
      return [...sampleUsers, ...sampleProjects, ...sampleEnquiries];
    }

    return items.slice(0, 18);
  }, [query, activeCategory, users, projects, enquiries]);

  // Reset highlighted index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    navigate(item.route);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  const counts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        users: users.length,
        projects: projects.length,
        enquiries: enquiries.length,
      };
    }
    const uCount = users.filter((u) => {
      const anyU = u as any;
      const name = `${u.firstName || ''} ${u.lastName || ''} ${anyU.fullName || ''}`.toLowerCase();
      return (
        name.includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    }).length;

    const pCount = projects.filter((p) => {
      const title = `${p.projectTitle || ''} ${p.name || ''} ${p.projectCode || ''}`.toLowerCase();
      const desc = `${p.projectDescription || ''} ${p.description || ''}`.toLowerCase();
      return title.includes(q) || desc.includes(q) || (p.projectType || '').toLowerCase().includes(q);
    }).length;

    const eCount = enquiries.filter((e) => {
      const sender = `${e.name || ''} ${e.firstName || ''} ${e.lastName || ''} ${e.company || ''}`.toLowerCase();
      const body = `${e.subject || ''} ${e.message || ''} ${e.serviceInterest || ''}`.toLowerCase();
      return sender.includes(q) || (e.email || '').toLowerCase().includes(q) || body.includes(q);
    }).length;

    return { users: uCount, projects: pCount, enquiries: eCount };
  }, [query, users, projects, enquiries]);

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'USERS':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'PROJECTS':
        return <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'ENQUIRIES':
        return <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      {/* Search Trigger Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="Search users, projects, or inquiries... (Ctrl+K)"
          aria-label="Global admin search across users, projects, and inquiries"
          aria-expanded={isOpen}
          className="w-full pl-9 pr-16 py-1.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
            className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded absolute right-2 pointer-events-none">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        )}
      </div>

      {/* Categorized Global Search Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Global search results"
          className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[540px] lg:w-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
            <div className="flex items-center gap-1">
              {(
                [
                  {
                    id: 'ALL',
                    label: 'All',
                    count: counts.users + counts.projects + counts.enquiries,
                  },
                  { id: 'USERS', label: 'Users', count: counts.users },
                  { id: 'PROJECTS', label: 'Projects', count: counts.projects },
                  { id: 'ENQUIRIES', label: 'Inquiries', count: counts.enquiries },
                ] as const
              ).map((tab) => {
                const active = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded tabular-nums ${
                        active
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5"
            >
              Esc
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <span className="text-xs font-medium">
                  Indexing users, projects, and inquiries...
                </span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 px-6 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No matching records found for "{query}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Try searching by user name, email, role, project title, technology stack, or client inquiry subject.
                </p>
              </div>
            ) : (
              results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelectResult(item)}
                    className={`w-full px-4 py-3 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 dark:bg-slate-800/90'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${item.statusColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-md">
                          {item.subtitle}
                        </p>
                        {item.meta && (
                          <span className="inline-block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {item.meta}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {item.category === 'ENQUIRIES' ? 'Inquiry' : item.category.slice(0, -1)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Directory Footer Links */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {query.trim()
                ? `Found ${counts.users} users, ${counts.projects} projects, ${counts.enquiries} inquiries`
                : 'Showing recent records across Users, Projects & Inquiries'}
            </span>
            <div className="flex items-center gap-3 font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate(
                    query.trim()
                      ? `/admin/users?search=${encodeURIComponent(query.trim())}`
                      : '/admin/users'
                  );
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate(
                    query.trim()
                      ? `/admin/projects?search=${encodeURIComponent(query.trim())}`
                      : '/admin/projects'
                  );
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate(
                    query.trim()
                      ? `/admin/enquiries?search=${encodeURIComponent(query.trim())}`
                      : '/admin/enquiries'
                  );
                }}
                className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Inquiries
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSearch;
