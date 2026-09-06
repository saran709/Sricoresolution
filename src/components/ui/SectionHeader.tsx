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
    <div className={cn('mb-12 md:mb-16', align === 'center' ? 'text-center' : 'text-left', className)}>
      {badge && (
        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-700 text-sm font-bold uppercase tracking-wider mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
        {title}
      </h2>
      {description && (
        <p className={cn('text-lg text-slate-600', align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl')}>
          {description}
        </p>
      )}
    </div>
  );
}
