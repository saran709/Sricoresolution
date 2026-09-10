const fs = require('fs');
const path = require('path');

const dir = 'src/pages/admin';

function createPage(name, title, sheetName, filterLogic = '') {
  let dataFetching = `const data = await readFromSheet('${sheetName}');`;
  if (filterLogic) {
    dataFetching += `\n        const filtered = data.filter(${filterLogic});\n        setItems(filtered);`;
  } else {
    dataFetching += `\n        setItems(data || []);`;
  }

  const content = `import React, { useState, useEffect } from 'react';
import { readFromSheet } from '../../lib/sheets';
import { Loader2 } from 'lucide-react';

export default function ${name}() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        ${dataFetching}
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
        <h1 className="text-2xl font-bold text-slate-900">${title}</h1>
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
`;
  fs.writeFileSync(path.join(dir, `${name}.tsx`), content);
}

// Generate the simpler table pages
createPage('Departments', 'Departments', 'departments');
createPage('Mentors', 'Mentors', 'users', "(u: any) => u.role === 'MENTOR'");
createPage('Interns', 'Interns', 'users', "(u: any) => u.role === 'INTERN'");
createPage('Candidates', 'Candidates', 'users', "(u: any) => u.role === 'CANDIDATE'");
createPage('Attendance', 'Attendance', 'attendance');
createPage('Leave', 'Leave Requests', 'leaveRequests');
createPage('Vendors', 'Vendors', 'vendors');
createPage('Notifications', 'Notifications', 'notifications');
createPage('Reports', 'Reports', 'reports');

// Settings page can be a little different (form-based stub)
const settingsContent = `import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">General Configuration</h2>
        <div className="space-y-4">
          <Input label="Platform Name" defaultValue="SRI Core Solutions" />
          <Input label="Support Email" defaultValue="support@sricoresolutions.com" />
          <Input label="Timezone" defaultValue="UTC" />
          <Button className="mt-4">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(dir, 'Settings.tsx'), settingsContent);

console.log("Generated 10 new admin pages.");
