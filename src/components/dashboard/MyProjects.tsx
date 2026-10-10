import React, { useState } from 'react';
import { Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useMyProjects } from '../../hooks/useDashboardQueries';
import { Clock, Download, Search } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AdSlot } from '../ui/AdSlot';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function MyProjects() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useMyProjects(userProfile?.uid);
  const projects = data?.projects || [];
  const tasks = data?.tasks || [];

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePDF = (project: Project) => {
    const doc = new jsPDF();
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    doc.text(`Project Summary: ${project.name}`, 14, 15);
    doc.text(`Status: ${project.status}`, 14, 22);
    doc.text(`Description: ${project.description}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Task', 'Status', 'Due Date']],
      body: projectTasks.map(task => [
        task.title,
        task.status,
        task.dueDate?.toDate ? new Date(task.dueDate.toDate()).toLocaleDateString() : 'TBD'
      ]),
    });
    
    doc.save(`${project.name}_Summary.pdf`);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">My Projects</h2>
        <div className="relative w-64">
          <Input 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
      </div>
      
      <AdSlot isLoading={isLoading} />
      
      {filteredProjects.length === 0 ? (
        <p className="text-slate-500">No projects match your search.</p>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase font-bold">{project.status}</span>
                  <Button variant="outline" size="sm" onClick={() => generatePDF(project)} className="flex items-center gap-1">
                    <Download className="w-4 h-4" /> PDF
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-3">{project.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Milestones</h4>
                {tasks.filter(t => t.projectId === project.id && t.status !== 'COMPLETED').length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No upcoming milestones.</p>
                ) : (
                  tasks.filter(t => t.projectId === project.id && t.status !== 'COMPLETED').map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {task.title} - Due: {task.dueDate?.toDate ? new Date(task.dueDate.toDate()).toLocaleDateString() : 'TBD'}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
