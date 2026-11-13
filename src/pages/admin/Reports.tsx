import React, { useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  TrendingUp, 
  Briefcase, 
  CreditCard, 
  GraduationCap, 
  Download,
} from 'lucide-react';
import {
  useAdminEnquiries,
  useAdminPayments,
  useAdminProjects,
  useAdminTasks,
  useAdminUsers,
} from '../../hooks/useDashboardQueries';
import { normalizeToCanonicalRole } from '../../lib/rbac';
import { ShimmerBlock } from '../../components/ui/DashboardSuspense';

export default function Reports() {
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: projects = [], isLoading: projectsLoading } = useAdminProjects();
  const { data: payments = [], isLoading: paymentsLoading } = useAdminPayments();
  const { data: enquiries = [], isLoading: enquiriesLoading } = useAdminEnquiries();
  const { data: tasks = [], isLoading: tasksLoading } = useAdminTasks(500);

  const loading =
    usersLoading && projectsLoading && paymentsLoading && enquiriesLoading && tasksLoading;

  const stats = useMemo(() => {
    const revenue = payments.reduce((sum, p) => {
      if (p.status === 'SUCCESS') {
        return sum + (Number(p.amount) || 0);
      }
      return sum;
    }, 0);

    const internsCount = users.filter(
      (u) => normalizeToCanonicalRole(u.role) === 'INTERN_STUDENT'
    ).length;

    return {
      totalUsers: users.length,
      totalProjects: projects.length,
      totalRevenue: revenue,
      totalEnquiries: enquiries.length,
      totalInterns: internsCount,
      activeTasks: tasks.length,
    };
  }, [users, projects, payments, enquiries, tasks]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Total Users,${stats.totalUsers}\n` +
      `Total Projects,${stats.totalProjects}\n` +
      `Total Verified Revenue (INR),${stats.totalRevenue}\n` +
      `Total Enquiries,${stats.totalEnquiries}\n` +
      `Active Interns,${stats.totalInterns}\n` +
      `Milestone Tasks,${stats.activeTasks}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sricore_executive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Real-time organizational performance metrics and ledger breakdown</p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Executive CSV
        </Button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">Verified Revenue</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? <ShimmerBlock className="h-8 w-24 rounded-lg" /> : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">UPI & Banking settlements</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">Total Enquiries</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? <ShimmerBlock className="h-8 w-16 rounded-lg" /> : stats.totalEnquiries}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Inbound client & student leads</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">Commercial Projects</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? <ShimmerBlock className="h-8 w-16 rounded-lg" /> : stats.totalProjects}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Active client deliverables</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-500">Active Interns</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {loading ? <ShimmerBlock className="h-8 w-16 rounded-lg" /> : stats.totalInterns}
            </div>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Guided trainees & developers</p>
          </div>
        </div>
      </div>

      {/* Secondary Metric Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          System Operational Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">User Directory Volume</p>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? <ShimmerBlock className="h-9 w-16 rounded-lg" /> : stats.totalUsers}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all role categories</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 mt-1">Issued for milestones & retainers</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">Engineered Tasks Logged</p>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? <ShimmerBlock className="h-9 w-16 rounded-lg" /> : stats.activeTasks}
            </div>
            <p className="text-xs text-slate-500 mt-1">Sprint items & milestone deliverables</p>
          </div>
        </div>
      </div>
    </div>
  );
}
