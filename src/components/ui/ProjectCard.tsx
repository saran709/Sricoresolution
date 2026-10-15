import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Activity, Server } from 'lucide-react';

interface ProjectCardProps {
  key?: React.Key;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  href: string;
  code?: string;
  tags?: string[];
  metrics?: string;
}

export function ProjectCard({ 
  title, 
  category, 
  description, 
  imageUrl, 
  href, 
  code, 
  tags, 
  metrics 
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  // Select icon based on category keywords
  const isAiVision = category.toLowerCase().includes('ai') || title.toLowerCase().includes('vision') || title.toLowerCase().includes('quality');
  const isIot = category.toLowerCase().includes('iot') || category.toLowerCase().includes('hardware');
  
  const hasValidImage = imageUrl && !imageError;

  return (
    <Link 
      to={href} 
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
    >
      {/* Visual Header / Banner */}
      <div className="relative h-48 bg-slate-900 overflow-hidden flex flex-col justify-between p-4">
        {hasValidImage ? (
          <>
            <img 
              src={imageUrl} 
              alt={title} 
              loading="lazy"
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {/* Dark gradient overlay for optimal badge legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/50" />
          </>
        ) : (
          <>
            {/* Tech background pattern fallback */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:16px_16px]"></div>
            
            {/* Subtle radial glow */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          </>
        )}

        {/* Top metadata tags */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
            {isAiVision ? <Cpu className="w-3 h-3 text-amber-400" /> : isIot ? <Activity className="w-3 h-3 text-blue-400" /> : <Server className="w-3 h-3 text-purple-400" />}
            {category}
          </span>

          {code && (
            <span className="text-[10px] font-mono text-slate-200 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 shadow-xs">
              {code}
            </span>
          )}
        </div>

        {/* Bottom visual accent inside header */}
        <div className="relative z-10 mt-auto flex items-end justify-between">
          <div className="text-white/90 font-mono text-[11px] flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live System</span>
          </div>
          {metrics && (
            <span className="text-[10px] font-bold text-amber-300 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded border border-amber-400/30 shadow-xs">
              {metrics}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-amber-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-600 text-xs md:text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Tags if present */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Link Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 mt-auto">
          <span className="inline-flex items-center text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all">
            View Complete Case Study <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Sricore R&D
          </span>
        </div>
      </div>
    </Link>
  );
}
