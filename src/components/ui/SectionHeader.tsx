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
    <div className={cn('mb-5 md:mb-6', align === 'center' ? 'text-center' : 'text-left', className)}>
      {badge && (
        <span className="inline-block py-0.5 px-2.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
          {badge}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h2>
      {description && (
        <p className={cn('text-xs md:text-sm text-slate-600', align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl')}>
          {description}
        </p>
      )}
    </div>
  );
}
