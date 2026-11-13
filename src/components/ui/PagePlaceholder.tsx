import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { Button } from './Button';
import { ArrowLeft, Compass, Home, LogIn, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function PagePlaceholder({ title }: { title: string }) {
  const { currentUser } = useAuth();

  return (
    <div className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 min-h-[70vh] flex items-center transition-colors">
      <Container>
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 text-center shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5">
            <Compass className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
            The address you opened doesn&apos;t match an active page, or it may have moved.
            Choose one of the verified destinations below to continue without losing your place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-7">
            <Link
              to="/"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-colors flex items-center gap-3 bg-slate-50/60 dark:bg-slate-800/40"
            >
              <Home className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Home & Services</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Software, IoT, AI & Research overview
                </p>
              </div>
            </Link>

            <Link
              to="/enquiry"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-colors flex items-center gap-3 bg-slate-50/60 dark:bg-slate-800/40"
            >
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Request Project Quote
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Submit requirements in 2 minutes
                </p>
              </div>
            </Link>

            <Link
              to="/internships"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-colors flex items-center gap-3 bg-slate-50/60 dark:bg-slate-800/40"
            >
              <Compass className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Internship Programs
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Industrial cohorts & applications
                </p>
              </div>
            </Link>

            <Link
              to={currentUser ? '/dashboard' : '/login'}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-colors flex items-center gap-3 bg-slate-50/60 dark:bg-slate-800/40"
            >
              <LogIn className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser ? 'Open My Workspace' : 'Sign In to Portal'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Client, Staff, Mentor & Intern dashboard
                </p>
              </div>
            </Link>
          </div>

          <Link to="/">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
