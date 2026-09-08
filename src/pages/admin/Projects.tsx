import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Project, ProjectStage, ActivityHistory } from '../../types';
import { Search, Plus, Filter, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

const COMMERCIAL_STAGES: { value: ProjectStage; label: string }[] = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'requirement_discussion', label: 'Requirement Discussion' },
  { value: 'technical_analysis', label: 'Technical Analysis' },
  { value: 'feasibility', label: 'Feasibility' },
  { value: 'cost_estimation', label: 'Cost Estimation' },
  { value: 'quotation', label: 'Quotation' },
  { value: 'client_approval', label: 'Client Approval' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'advance_payment', label: 'Advance Payment' },
  { value: 'team_formation', label: 'Team Formation' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'demonstration', label: 'Demonstration' },
  { value: 'client_feedback', label: 'Client Feedback' },
  { value: 'revision', label: 'Revision' },
  { value: 'final_approval', label: 'Final Approval' },
  { value: 'final_payment', label: 'Final Payment' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'support', label: 'Support' }
];

const STUDENT_STAGES: { value: ProjectStage; label: string }[] = [
  { value: 'student_enquiry', label: 'Enquiry' },
  { value: 'requirement', label: 'Requirement' },
  { value: 'project_idea', label: 'Project Idea' },
  { value: 'student_feasibility', label: 'Feasibility' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'cost_discussion', label: 'Cost Discussion' },
  { value: 'student_approval', label: 'Approval' },
  { value: 'student_payment', label: 'Payment' },
  { value: 'student_development', label: 'Development' },
  { value: 'student_testing', label: 'Testing' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'student_demo', label: 'Demo' },
  { value: 'completion', label: 'Completion' }
];

const RESEARCH_STAGES: { value: ProjectStage; label: string }[] = [
  { value: 'topic_discussion', label: 'Topic Discussion' },
  { value: 'literature_review', label: 'Literature Review' },
  { value: 'methodology_assistance', label: 'Methodology Assistance' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'model_development', label: 'Model Development' },
  { value: 'technical_documentation', label: 'Technical Documentation' },
  { value: 'paper_preparation', label: 'Paper Preparation' },
  { value: 'formatting', label: 'Formatting' },
  { value: 'submission_assistance', label: 'Submission Assistance' },
  { value: 'revision_assistance', label: 'Revision Assistance' }
];

export default function AdminProjects() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Project[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(items);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (project: Project, newStage: ProjectStage) => {
    try {
      if (!project.id) return;
      await updateDoc(doc(db, 'projects', project.id), {
        stage: newStage,
        updatedAt: serverTimestamp()
      });
      
      setProjects(projects.map(p => p.id === project.id ? { ...p, stage: newStage } : p));
      
      if (userProfile?.uid) {
        await logActivity(
          'PROJECT_STAGE_UPDATED',
          userProfile.uid,
          project.id,
          'project',
          `Project stage updated from ${project.stage} to ${newStage}`
        );
      }
    } catch (error) {
      console.error("Failed to update project stage", error);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.projectType === filterType;
    return matchesSearch && matchesType;
  });

  const getStagesForType = (type: string) => {
    if (type === 'student') return STUDENT_STAGES;
    if (type === 'research') return RESEARCH_STAGES;
    return COMMERCIAL_STAGES;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects Workflow</h1>
          <p className="text-sm text-slate-500">Manage all operational project stages and deliveries</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects by name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Types</option>
              <option value="commercial">Commercial Workflow</option>
              <option value="student">Student Workflow</option>
              <option value="research">Research Workflow</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Type & Status</th>
                <th className="px-6 py-4">Current Workflow Stage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const stageOptions = getStagesForType(project.projectType);
                  return (
                    <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{project.name}</div>
                        <div className="text-slate-500 text-xs mt-1">ID: {project.id?.slice(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {project.projectType}
                          </span>
                          <span className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                            ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              project.status === 'on_hold' ? 'bg-amber-100 text-amber-700' :
                              project.status === 'completed' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'}`}
                          >
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={project.stage || stageOptions[0].value}
                          onChange={(e) => handleStageChange(project, e.target.value as ProjectStage)}
                          className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-full max-w-[200px]"
                        >
                          {stageOptions.map(stage => (
                            <option key={stage.value} value={stage.value}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
