import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Download, FileText, Loader2, DollarSign, Users, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';

type ReportType = 'payments' | 'internships' | 'enquiries' | 'projects';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('payments');
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, metric: 0, metricLabel: '' });

  const fetchReportData = async (type: ReportType) => {
    setLoading(true);
    try {
      let collectionName = '';
      if (type === 'payments') collectionName = 'payments';
      if (type === 'internships') collectionName = 'internship_applications';
      if (type === 'enquiries') collectionName = 'enquiries';
      if (type === 'projects') collectionName = 'projects';

      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      
      snapshot.forEach(doc => {
        const itemData = doc.data();
        // format firestore timestamps
        if (itemData.createdAt && itemData.createdAt.toDate) {
          itemData.createdAt = format(itemData.createdAt.toDate(), 'yyyy-MM-dd HH:mm:ss');
        }
        if (itemData.date && itemData.date.toDate) {
          itemData.date = format(itemData.date.toDate(), 'yyyy-MM-dd HH:mm:ss');
        }
        items.push({ id: doc.id, ...itemData });
      });

      setData(items);

      // Compute stats
      let metric = 0;
      let metricLabel = '';
      if (type === 'payments') {
        metric = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        metricLabel = 'Total Revenue';
      } else if (type === 'internships') {
        metric = items.filter(i => i.status === 'approved').length;
        metricLabel = 'Approved Applications';
      } else if (type === 'enquiries') {
        metric = items.filter(i => i.status === 'new').length;
        metricLabel = 'New Enquiries';
      } else if (type === 'projects') {
        metric = items.filter(i => i.status === 'completed').length;
        metricLabel = 'Completed Projects';
      }

      setStats({ total: items.length, metric, metricLabel });
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(reportType);
  }, [reportType]);

  const downloadCSV = () => {
    if (data.length === 0) return;
    
    // Get headers
    const headers = Array.from(new Set(data.flatMap(Object.keys)));
    
    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let val = row[header as string] === undefined || row[header as string] === null ? '' : row[header as string];
          if (typeof val === 'object') val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""'); // escape quotes
          return `"${val}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">Generate and export system reports</p>
        </div>
        <Button onClick={downloadCSV} disabled={data.length === 0 || loading} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export to CSV
        </Button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {(['payments', 'internships', 'enquiries', 'projects'] as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              reportType === type 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type} Data
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Records</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            {reportType === 'payments' ? <DollarSign className="w-6 h-6" /> : 
             reportType === 'internships' ? <Users className="w-6 h-6" /> : 
             reportType === 'projects' ? <Briefcase className="w-6 h-6" /> : 
             <TrendingUp className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{stats.metricLabel}</p>
            <p className="text-2xl font-bold text-slate-900">
              {reportType === 'payments' ? `$${stats.metric.toLocaleString()}` : stats.metric}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{reportType} Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                {data.length > 0 ? (
                  Object.keys(data[0])
                    .filter(key => key !== 'id') // Hide ID in preview to save space
                    .slice(0, 5) // Show max 5 columns in preview
                    .map((key) => (
                      <th key={key} className="px-6 py-4 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</th>
                    ))
                ) : (
                  <th className="px-6 py-4">Data</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    <p className="text-slate-500 mt-2">Loading data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No records found for {reportType}.
                  </td>
                </tr>
              ) : (
                data.slice(0, 10).map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-slate-50">
                    {Object.keys(item)
                      .filter(key => key !== 'id')
                      .slice(0, 5)
                      .map((key) => (
                        <td key={key} className="px-6 py-4 truncate max-w-xs">
                          {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key] || '-')}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {data.length > 10 && (
            <div className="px-6 py-4 bg-slate-50 text-center text-sm text-slate-500 border-t border-slate-100">
              Showing 10 of {data.length} records. Export to CSV to view all.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
