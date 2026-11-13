import React, { useMemo, useState } from 'react';
import { Search, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useAdminAuditLogs } from '../../hooks/useDashboardQueries';
import { ShimmerTableRows } from '../../components/ui/DashboardSuspense';

export default function AdminAudit() {
  const { data: allLogs = [], isLoading: loading } = useAdminAuditLogs(500);
  const [searchTerm, setSearchTerm] = useState('');

  const logs = useMemo(() => allLogs.slice(0, 100), [allLogs]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) =>
        `${log.action} ${log.performedBy} ${log.details}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [logs, searchTerm]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
          <p className="text-sm text-slate-500">Track sensitive administrator actions and system events</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-lg flex items-center gap-2 text-slate-600 text-sm font-medium border border-slate-200">
          <Shield className="w-4 h-4 text-blue-600" />
          Append-Only Log
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search actions or users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Performed By (UID)</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <ShimmerTableRows rows={6} cols={4} />
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                      {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {log.performedBy}
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
