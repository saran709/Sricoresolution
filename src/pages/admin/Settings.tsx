import React from 'react';
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
