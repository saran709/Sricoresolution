import React, { useState } from 'react';
import { Shield, Settings, Activity, FolderSearch, PenTool, Bot } from 'lucide-react';
import { Container } from '../../components/ui/Container';

export default function Discovery() {
  const [activeTab, setActiveTab] = useState<'audits' | 'rescue' | 'blueprints'>('audits');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solution Discovery</h1>
          <p className="text-sm text-slate-500">Manage Audits, Rescues, and Technical Blueprints.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit">
        <button onClick={() => setActiveTab('audits')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'audits' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>Technology Audits</button>
        <button onClick={() => setActiveTab('rescue')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'rescue' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>Project Rescue</button>
        <button onClick={() => setActiveTab('blueprints')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'blueprints' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>Blueprints & Assessments</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[500px] flex items-center justify-center p-8">
        <div className="text-center text-slate-400">
          {activeTab === 'audits' && (
            <>
              <FolderSearch className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h2 className="text-lg font-medium text-slate-900 mb-2">Technology Audits</h2>
              <p className="max-w-md mx-auto">Manage ongoing code, architecture, and security reviews for prospective clients.</p>
            </>
          )}
          {activeTab === 'rescue' && (
            <>
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h2 className="text-lg font-medium text-slate-900 mb-2">Project Rescue Cases</h2>
              <p className="max-w-md mx-auto">Evaluate failing projects and coordinate recovery operations.</p>
            </>
          )}
          {activeTab === 'blueprints' && (
            <>
              <PenTool className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h2 className="text-lg font-medium text-slate-900 mb-2">Blueprints & Readiness</h2>
              <p className="max-w-md mx-auto">Design architecture blueprints and conduct AI/Data readiness assessments.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
