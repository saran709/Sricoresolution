import React from 'react';
import { BarChart3, TrendingUp, Users, Activity, PieChart } from 'lucide-react';
import { Container } from '../../components/ui/Container';

export default function BusinessInsights() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Insights</h1>
          <p className="text-sm text-slate-500">Analytics, lead volume, and conversion pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Total Leads</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">42</div>
          <p className="text-sm text-emerald-600 font-medium mt-2">+12% this month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Conversion Rate</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">18.5%</div>
          <p className="text-sm text-emerald-600 font-medium mt-2">+2.4% this month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Users className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Active Proposals</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">7</div>
          <p className="text-sm text-slate-500 font-medium mt-2">In negotiation phase</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
            <h3 className="font-semibold text-slate-700">Project Rescues</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">3</div>
          <p className="text-sm text-slate-500 font-medium mt-2">Current quarter</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-slate-400 text-center">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">Acquisition Pipeline Visualization</p>
          <p className="text-sm mt-1">Data mapping required for live rendering</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-slate-400 text-center">
          <PieChart className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">Request Distribution by Industry</p>
          <p className="text-sm mt-1">Data mapping required for live rendering</p>
        </div>
      </div>
    </div>
  );
}
