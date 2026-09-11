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
    const fetchData = async () => {
      try {
        // Fetch sequentially or in smaller batches to avoid Google Apps Script concurrent rate limits
        const users = await firebaseService.getAll('users');
        const projects = await firebaseService.getAll('projects');
        const requests = await firebaseService.getAll('project_requests');
        const apps = await firebaseService.getAll('internship_applications');
        const payments = await firebaseService.getAll('payments');
        
        setStats({
          employees: users.filter((u: any) => u.role === 'EMPLOYEE').length,
          activeEmployees: users.filter((u: any) => u.role === 'EMPLOYEE' && String(u.isActive) === 'true').length,
          interns: users.filter((u: any) => u.role === 'INTERN').length,
          mentors: users.filter((u: any) => u.role === 'MENTOR').length,
          clients: users.filter((u: any) => u.role === 'CLIENT').length,
          activeProjects: projects.filter((p: any) => String(p.status).toLowerCase() === 'active').length,
          pendingEnquiries: requests.filter((r: any) => String(r.status).toLowerCase() === 'new' || !r.status).length,
          internApplications: apps.filter((a: any) => String(a.status).toLowerCase() === 'pending' || !a.status).length,
          pendingPayments: payments.filter((p: any) => String(p.status).toLowerCase() === 'pending' || !p.status).length
        });

        
        const auditLogs = await firebaseService.getAll('auditLogs');
        const allTasks = await firebaseService.getAll('tasks');
        
        setActivities((auditLogs || []).sort((a: any, b: any) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()).slice(0, 5));
        
        const activeTasks = (allTasks || []).filter((t: any) => ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW'].includes(t.status));
        setTasks(activeTasks.slice(0, 5));


      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
