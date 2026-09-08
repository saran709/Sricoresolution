import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  key?: React.Key;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  href: string;
}

export function ProjectCard({ title, category, description, imageUrl, href }: ProjectCardProps) {
  return (
    <Link to={href} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <span className="font-medium">Project Preview</span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">{category}</span>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6 flex-grow line-clamp-3">{description}</p>
        <div className="flex items-center text-sm font-semibold text-slate-900 mt-auto">
          View Case Study <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
