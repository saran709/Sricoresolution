import React from 'react';
import { motion } from 'motion/react';
import { Container } from './Container';

export function ServiceSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 w-full animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <Container>
          <div className="max-w-3xl">
            {/* Tag */}
            <div className="w-32 h-8 rounded-full bg-slate-800 mb-6"></div>
            {/* H1 */}
            <div className="w-full h-16 rounded-xl bg-slate-800 mb-4"></div>
            <div className="w-4/5 h-16 rounded-xl bg-slate-800 mb-6"></div>
            {/* Paragraph */}
            <div className="w-3/4 h-6 rounded-lg bg-slate-800 mb-3"></div>
            <div className="w-2/3 h-6 rounded-lg bg-slate-800 mb-8"></div>
            {/* Button */}
            <div className="w-48 h-14 rounded-lg bg-slate-800"></div>
          </div>
        </Container>
      </section>

      {/* Grid Content Skeleton */}
      <section className="py-24">
        <Container>
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="w-64 h-10 rounded-xl bg-slate-200 mb-4"></div>
            <div className="w-96 h-6 rounded-lg bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-slate-200 mb-6"></div>
                <div className="w-3/4 h-8 rounded-lg bg-slate-200 mb-3"></div>
                <div className="w-full h-4 rounded-md bg-slate-200 mb-2"></div>
                <div className="w-5/6 h-4 rounded-md bg-slate-200 mb-2"></div>
                <div className="w-4/5 h-4 rounded-md bg-slate-200"></div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
