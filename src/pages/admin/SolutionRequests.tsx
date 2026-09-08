import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Shield, ChevronRight, Activity, Calendar, Clock, Banknote, Search, MessageSquare, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Container } from '../../components/ui/Container';

export default function SolutionRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'solutionRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(results);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'solutionRequests', id), {
        status: newStatus,
        updatedAt: new Date()
      });
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const statusColors: any = {
    'NEW': 'bg-amber-100 text-amber-800',
    'TRIAGE': 'bg-yellow-100 text-yellow-800',
    'DISCOVERY': 'bg-purple-100 text-purple-800',
    'FEASIBILITY': 'bg-indigo-100 text-indigo-800',
    'SOLUTION_DESIGN': 'bg-pink-100 text-pink-800',
    'POC': 'bg-orange-100 text-orange-800',
    'PROPOSAL': 'bg-teal-100 text-teal-800',
    'NEGOTIATION': 'bg-cyan-100 text-cyan-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'CONVERTED': 'bg-emerald-100 text-emerald-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'ON_HOLD': 'bg-slate-100 text-slate-800',
    'CLOSED': 'bg-gray-100 text-gray-800'
  };

  const statuses = [
    'NEW', 'TRIAGE', 'DISCOVERY', 'FEASIBILITY', 'SOLUTION_DESIGN',
    'POC', 'PROPOSAL', 'NEGOTIATION', 'APPROVED', 'CONVERTED',
    'REJECTED', 'ON_HOLD', 'CLOSED'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solution Requests Center</h1>
          <p className="text-sm text-slate-500">Manage incoming problems, triage, and convert to projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List View */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[800px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No requests found.</div>
            ) : (
              requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`w-full text-left p-4 rounded-lg transition-colors border ${
                    selectedRequest?.id === req.id 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-medium text-slate-500">{req.requestId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[req.status] || 'bg-slate-100 text-slate-800'}`}>
                      {req.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate">{req.organization}</h3>
                  <p className="text-sm text-slate-600 truncate">{req.name}</p>
                  <div className="mt-2 text-xs text-slate-500 truncate">{req.industry}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm h-[800px] overflow-y-auto">
          {selectedRequest ? (
            <div className="p-6 md:p-8 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedRequest.organization}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColors[selectedRequest.status] || 'bg-slate-100 text-slate-800'}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <p className="text-slate-500 font-mono text-sm">{selectedRequest.requestId}</p>
                </div>
                
                <select
                  value={selectedRequest.status}
                  onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium shadow-sm"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Contact Name</div>
                  <div className="font-medium text-slate-900">{selectedRequest.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <div className="font-medium text-slate-900 truncate" title={selectedRequest.email}>{selectedRequest.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Phone</div>
                  <div className="font-medium text-slate-900">{selectedRequest.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Industry</div>
                  <div className="font-medium text-slate-900">{selectedRequest.industry}</div>
                </div>
              </div>

              {/* The Problem */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  The Problem
                </h3>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedRequest.problem}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wider">Current Process</h4>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 min-h-[100px]">
                    {selectedRequest.currentProcess || 'Not provided'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wider">Expected Outcome</h4>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 min-h-[100px]">
                    {selectedRequest.expectedOutcome || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Requirements & Context */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Project Context</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <Clock className="w-6 h-6 text-slate-400 mb-2" />
                    <div className="text-xs text-slate-500 mb-1">Timeline</div>
                    <div className="font-semibold text-slate-900">{selectedRequest.timeline || 'Not specified'}</div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <Banknote className="w-6 h-6 text-slate-400 mb-2" />
                    <div className="text-xs text-slate-500 mb-1">Budget Range</div>
                    <div className="font-semibold text-slate-900">{selectedRequest.budget || 'Not specified'}</div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <Activity className="w-6 h-6 text-slate-400 mb-2" />
                    <div className="text-xs text-slate-500 mb-1">Existing Assets</div>
                    <div className="font-semibold text-slate-900">
                      {selectedRequest.existingSystem ? 'System: Yes ' : 'System: No '}
                      | 
                      {selectedRequest.existingPrototype ? ' Prototype: Yes' : ' Prototype: No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              {selectedRequest.technology && selectedRequest.technology.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Requested Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.technology.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-md">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3">
                <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">Start Discovery Case</Button>
                <Button variant="outline">Assess Readiness</Button>
                <Button variant="outline">Schedule Follow-up</Button>
                <div className="flex-1"></div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Convert to Project</Button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a request to view details</p>
              <p className="text-sm">Manage triage, discovery, and conversion workflows.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
