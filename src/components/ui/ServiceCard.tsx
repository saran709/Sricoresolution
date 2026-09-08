import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  className?: string;
  colorScheme?: 'amber' | 'emerald' | 'purple' | 'orange';
}

export function ServiceCard({ title, description, icon, href, className, colorScheme = 'amber' }: ServiceCardProps) {
  const colorStyles = {
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
  };

  const borderStyles = {
    amber: 'hover:border-amber-300',
    emerald: 'hover:border-emerald-300',
    purple: 'hover:border-purple-300',
    orange: 'hover:border-orange-300',
  };

  return (
    <Link 
      to={href}
      className={cn(
        "group flex flex-col p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors duration-300",
        borderStyles[colorScheme],
        className
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors duration-300", colorStyles[colorScheme])}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow">{description}</p>
    </Link>
  );
}
