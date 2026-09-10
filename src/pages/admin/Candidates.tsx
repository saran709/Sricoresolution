import React, { useState, useEffect } from 'react';
import { readFromSheet } from '../../lib/sheets';
import { Loader2 } from 'lucide-react';

export default function Candidates() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await readFromSheet('users');
        const filtered = data.filter((u: any) => u.role === 'CANDIDATE');
        setItems(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                {items.length > 0 ? (
                  Object.keys(items[0]).slice(0, 5).map((key) => (
                    <th key={key} className="px-6 py-4">{key}</th>
                  ))
                ) : (
                  <th className="px-6 py-4">Data</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {Object.keys(item).slice(0, 5).map((key) => (
                      <td key={key} className="px-6 py-4">
                        {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key] || '-')}
                      </td>
                    ))}
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
