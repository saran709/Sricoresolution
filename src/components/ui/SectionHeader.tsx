import React from 'react';
import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  badge?: string;
}

export function SectionHeader({ title, description, align = 'center', className, badge }: SectionHeaderProps) {
  return (
    <div className={cn('mb-6 md:mb-8', align === 'center' ? 'text-center' : 'text-left', className)}>
      {badge && (
        <span className="inline-block py-1 px-3 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-bold uppercase tracking-wider mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2.5">
        {title}
      </h2>
      {description && (
        <p className={cn('text-xs md:text-sm text-slate-600 leading-relaxed', align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl')}>
          {description}
        </p>
      )}
    </div>
  );
}
