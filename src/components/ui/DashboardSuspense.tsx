import React, { ErrorInfo, ReactNode, Suspense } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { SuspenseProgressIndicator } from './TopProgressBar';

export type DashboardSkeletonVariant = 'page' | 'cards' | 'chart' | 'table' | 'panel';

interface ShimmerBlockProps {
  className?: string;
}

/**
 * Single shimmer skeleton primitive using `.skeleton-shimmer` gradient sweep.
 */
export const ShimmerBlock: React.FC<ShimmerBlockProps> = ({ className = '' }) => (
  <div aria-hidden="true" className={`skeleton-shimmer rounded-md ${className}`} />
);

interface ShimmerTableRowsProps {
  rows?: number;
  cols?: number;
}

/**
 * Shimmer table row placeholders designed to drop straight inside `<tbody>`.
 */
export const ShimmerTableRows: React.FC<ShimmerTableRowsProps> = ({
  rows = 5,
  cols = 4,
}) => (
  <>
    {[...Array(rows)].map((_, rowIdx) => (
      <tr key={rowIdx} aria-hidden="true" className="border-b border-slate-100 dark:border-slate-800/80">
        {[...Array(cols)].map((__, colIdx) => (
          <td key={colIdx} className="px-6 py-4">
            {colIdx === 0 ? (
              <div className="flex items-center gap-3">
                <ShimmerBlock className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <ShimmerBlock className="h-3.5 w-32 max-w-full" />
                  <ShimmerBlock className="h-2.5 w-20" />
                </div>
              </div>
            ) : colIdx === cols - 1 ? (
              <div className="flex justify-end gap-2">
                <ShimmerBlock className="h-7 w-16 rounded-lg" />
              </div>
            ) : (
              <ShimmerBlock className="h-3.5 w-24 max-w-full" />
            )}
          </td>
        ))}
      </tr>
    ))}
  </>
);

interface DashboardModuleSkeletonProps {
  variant?: DashboardSkeletonVariant;
  label?: string;
  count?: number;
}

const CHART_BAR_HEIGHTS = ['h-20', 'h-32', 'h-24', 'h-40', 'h-28', 'h-44', 'h-36', 'h-24', 'h-36', 'h-28', 'h-48', 'h-32'];

/**
 * Structured, layout-matched shimmer skeleton rendered by React Suspense boundaries
 * and dashboard data-fetching states.
 */
export const DashboardModuleSkeleton: React.FC<DashboardModuleSkeletonProps> = ({
  variant = 'panel',
  label = 'Loading dashboard module...',
  count = 4,
}) => {
  if (variant === 'cards') {
    return (
      <div
        role="status"
        aria-label={label}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <SuspenseProgressIndicator />
        {[...Array(count)].map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-2xs"
          >
            <ShimmerBlock className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5 min-w-0">
              <ShimmerBlock className="h-3 w-24 max-w-full" />
              <div className="flex items-baseline gap-2">
                <ShimmerBlock className="h-7 w-14 rounded-lg" />
                <ShimmerBlock className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div
        role="status"
        aria-label={label}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
      >
        <SuspenseProgressIndicator />
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-2">
              <ShimmerBlock className="h-4 w-56 max-w-full" />
              <ShimmerBlock className="h-3 w-72 max-w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <ShimmerBlock className="h-8 w-24 rounded-lg" />
            <ShimmerBlock className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="p-4 sm:px-6 space-y-2">
              <ShimmerBlock className="h-3 w-24" />
              <ShimmerBlock className="h-6 w-16 rounded-lg" />
              <ShimmerBlock className="h-2.5 w-28" />
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <div className="h-56 w-full rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 px-6 pb-4 pt-6 flex items-end justify-between gap-2 sm:gap-3">
            {CHART_BAR_HEIGHTS.map((heightClass, idx) => (
              <div
                key={idx}
                className={`flex-1 flex flex-col justify-end ${idx > 7 ? 'hidden sm:flex' : ''}`}
              >
                <ShimmerBlock className={`w-full ${heightClass} rounded-t-md rounded-b-none`} />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        role="status"
        aria-label={label}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs"
      >
        <SuspenseProgressIndicator />
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="w-9 h-9 rounded-lg shrink-0" />
            <div className="space-y-1.5">
              <ShimmerBlock className="h-4 w-40" />
              <ShimmerBlock className="h-3 w-56" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-9 w-48 rounded-lg" />
            <ShimmerBlock className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ShimmerBlock className="w-9 h-9 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <ShimmerBlock className="h-3.5 w-36 max-w-full" />
                  <ShimmerBlock className="h-2.5 w-48 max-w-full" />
                </div>
              </div>
              <ShimmerBlock className="hidden sm:block h-6 w-20 rounded-md" />
              <ShimmerBlock className="hidden md:block h-3.5 w-24" />
              <ShimmerBlock className="h-7 w-16 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div role="status" aria-label={label} className="space-y-6">
        <SuspenseProgressIndicator />
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <ShimmerBlock className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2.5 flex-1 min-w-0">
              <ShimmerBlock className="h-5 w-56 max-w-full" />
              <ShimmerBlock className="h-3.5 w-80 max-w-full" />
            </div>
          </div>
          <ShimmerBlock className="hidden sm:block h-9 w-40 rounded-xl shrink-0" />
        </div>
        <DashboardModuleSkeleton variant="cards" count={4} label={label} />
        <DashboardModuleSkeleton variant="table" label={label} />
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  // 'panel' default
  return (
    <div
      role="status"
      aria-label={label}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xs"
    >
      <SuspenseProgressIndicator />
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-5 w-48 max-w-full" />
          <ShimmerBlock className="h-3.5 w-72 max-w-full" />
        </div>
        <ShimmerBlock className="h-8 w-28 rounded-lg shrink-0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ShimmerBlock className="h-24 w-full rounded-xl" />
        <ShimmerBlock className="h-24 w-full rounded-xl" />
      </div>
      <ShimmerBlock className="h-28 w-full rounded-xl" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  moduleName?: string;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Isolated Error Boundary for lazy-loaded dashboard modules so a transient chunk
 * failure or module error provides inline recovery without breaking the sidebar shell.
 */
export class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  declare readonly props: DashboardErrorBoundaryProps;
  declare setState: (state: Partial<DashboardErrorBoundaryState>) => void;
  state: DashboardErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unable to load this dashboard module.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard module boundary caught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {this.props.moduleName
                  ? `Could not load ${this.props.moduleName}`
                  : 'Dashboard module interrupted'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {this.state.errorMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export interface DashboardSuspenseProps {
  children: ReactNode;
  variant?: DashboardSkeletonVariant;
  label?: string;
  moduleName?: string;
}

/**
 * Combined ErrorBoundary + React.Suspense wrapper for lazy-loaded dashboard modules.
 */
export const DashboardSuspense: React.FC<DashboardSuspenseProps> = ({
  children,
  variant = 'panel',
  label,
  moduleName,
}) => {
  return (
    <DashboardErrorBoundary moduleName={moduleName}>
      <Suspense fallback={<DashboardModuleSkeleton variant={variant} label={label} />}>
        {children}
      </Suspense>
    </DashboardErrorBoundary>
  );
};

export default DashboardSuspense;
