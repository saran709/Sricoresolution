import { firebaseService } from '../../lib/firebaseService';
import React, { useEffect, useState } from 'react';
import { readFromSheet } from '../../lib/sheets';

import { Users, Briefcase, MessageSquare, GraduationCap, Clock, AlertCircle, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    activeEmployees: 0,
    interns: 0,
    mentors: 0,
    clients: 0,
    activeProjects: 0,
    pendingEnquiries: 0,
    internApplications: 0,
    pendingPayments: 0,
  });
  
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let usersData: any[] = [];
    let projectsData: any[] = [];
    let requestsData: any[] = [];
    let appsData: any[] = [];
    let paymentsData: any[] = [];
    let auditLogsData: any[] = [];
    let tasksData: any[] = [];

    const updateDashboard = () => {
      setStats({
        employees: usersData.filter((u: any) => u.role === 'EMPLOYEE').length,
        activeEmployees: usersData.filter((u: any) => u.role === 'EMPLOYEE' && String(u.isActive) === 'true').length,
        interns: usersData.filter((u: any) => u.role === 'INTERN').length,
        mentors: usersData.filter((u: any) => u.role === 'MENTOR').length,
        clients: usersData.filter((u: any) => u.role === 'CLIENT').length,
        activeProjects: projectsData.filter((p: any) => String(p.status).toLowerCase() === 'active').length,
        pendingEnquiries: requestsData.filter((r: any) => String(r.status).toLowerCase() === 'new' || !r.status).length,
        internApplications: appsData.filter((a: any) => String(a.status).toLowerCase() === 'pending' || !a.status).length,
        pendingPayments: paymentsData.filter((p: any) => String(p.status).toLowerCase() === 'pending' || !p.status).length
      });
      
      setActivities((auditLogsData || []).sort((a: any, b: any) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()).slice(0, 5));
      
      const activeTasks = (tasksData || []).filter((t: any) => ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW'].includes(t.status));
      setTasks(activeTasks.slice(0, 5));
      setLoading(false);
    };

    const unsubUsers = firebaseService.subscribeToCollection('users', (data) => { usersData = data; updateDashboard(); });
    const unsubProjects = firebaseService.subscribeToCollection('projects', (data) => { projectsData = data; updateDashboard(); });
    const unsubRequests = firebaseService.subscribeToCollection('project_requests', (data) => { requestsData = data; updateDashboard(); });
    const unsubApps = firebaseService.subscribeToCollection('internship_applications', (data) => { appsData = data; updateDashboard(); });
    const unsubPayments = firebaseService.subscribeToCollection('payments', (data) => { paymentsData = data; updateDashboard(); });
    const unsubAudit = firebaseService.subscribeToCollection('auditLogs', (data) => { auditLogsData = data; updateDashboard(); });
    const unsubTasks = firebaseService.subscribeToCollection('tasks', (data) => { tasksData = data; updateDashboard(); });

    // Safety timeout in case snapshots take too long or are empty
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (unsubUsers) unsubUsers();
      if (unsubProjects) unsubProjects();
      if (unsubRequests) unsubRequests();
      if (unsubApps) unsubApps();
      if (unsubPayments) unsubPayments();
      if (unsubAudit) unsubAudit();
      if (unsubTasks) unsubTasks();
    };
  }, []);

  const statCards = [
    { name: 'Active Employees', value: stats.activeEmployees, total: stats.employees, icon: Users, color: 'bg-amber-500', link: '/admin/employees' },
    { name: 'Mentors', value: stats.mentors, total: null, icon: Users, color: 'bg-indigo-500', link: '/admin/mentors' },
    { name: 'Interns', value: stats.interns, total: null, icon: GraduationCap, color: 'bg-teal-500', link: '/admin/interns' },
    { name: 'Clients', value: stats.clients, total: null, icon: Users, color: 'bg-cyan-500', link: '/admin/clients' },
    { name: 'Active Projects', value: stats.activeProjects, total: null, icon: Briefcase, color: 'bg-emerald-500', link: '/admin/projects' },
    { name: 'Pending Enquiries', value: stats.pendingEnquiries, total: null, icon: MessageSquare, color: 'bg-amber-500', link: '/admin/enquiries' },
    { name: 'Intern Applications', value: stats.internApplications, total: null, icon: GraduationCap, color: 'bg-purple-500', link: '/admin/internships' },
    { name: 'Pending Payments', value: stats.pendingPayments, total: null, icon: FileText, color: 'bg-rose-500', link: '/admin/payments' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Administrator Control Center</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link 
              key={stat.name} 
              to={stat.link}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className={`p-4 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  {stat.total !== null && (
                    <p className="text-sm text-slate-400">/ {stat.total}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Recent Activities
            </h2>
            <Link to="/admin/audit" className="text-sm font-medium text-amber-600 hover:text-amber-700">View All</Link>
          </div>
          <div className="p-0">
            {activities.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {activities.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                        <p className="text-xs text-slate-500 mt-1">By: {activity.performedBy} • {activity.details}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {activity.timestamp ? format(activity.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No recent activities found.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Tasks Requiring Attention
            </h2>
            <Link to="/admin/tasks" className="text-sm font-medium text-amber-600 hover:text-amber-700">View All</Link>
          </div>
          <div className="p-0">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <li key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-1">Assigned to: {task.assignedTo}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${task.status === 'TODO' ? 'bg-slate-100 text-slate-800' : ''}
                        ${task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : ''}
                        ${task.status === 'BLOCKED' ? 'bg-red-100 text-red-800' : ''}
                        ${task.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : ''}
                      `}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No active tasks found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
