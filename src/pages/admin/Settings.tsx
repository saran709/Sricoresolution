import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Database, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { readFromSheet } from '../../lib/sheets';
import { firebaseService } from '../../lib/firebaseService';

export default function Settings() {
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{ type: 'idle' | 'running' | 'success' | 'error', message: string }>({
    type: 'idle',
    message: ''
  });

  const handleMigration = async () => {
    // confirm removed
    
    setMigrating(true);
    setMigrationStatus({ type: 'running', message: 'Starting migration...' });

    const collectionsToMigrate = [
      'users', 
      'departments', 
      'vendors', 
      'attendance', 
      'leaveRequests', 
      'notifications', 
      'projects', 
      'tasks', 
      'payments', 
      'project_requests', 
      'internship_applications', 
      'auditLogs',
      'reports',
      'internship_programs',
      'documents',
      'newsletter_subscribers'
    ];

    try {
      for (const collection of collectionsToMigrate) {
        setMigrationStatus({ type: 'running', message: `Fetching ${collection} from Google Sheets...` });
        const sheetData = await readFromSheet(collection);
        
        if (sheetData && sheetData.length > 0) {
          setMigrationStatus({ type: 'running', message: `Migrating ${sheetData.length} records into ${collection}...` });
          for (const record of sheetData) {
            // Use existing ID if present, otherwise generate one
            const id = record.id || record.uid || `migrated-${Math.random().toString(36).substr(2, 9)}`;
            await firebaseService.createWithId(collection, String(id), record);
          }
        }
      }
      
      setMigrationStatus({ type: 'success', message: 'Migration completed successfully! All data is now in Firebase.' });
    } catch (error: any) {
      console.error("Migration failed:", error);
      setMigrationStatus({ type: 'error', message: `Migration failed: ${error.message}` });
    } finally {
      setMigrating(false);
    }
  };

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

      <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-amber-800">
          <Database className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Database Migration Tool</h2>
        </div>
        <p className="text-slate-600 mb-6">
          Use this tool to pull all historical data from your old Google Sheets database and permanently transfer it into the new, lightning-fast Firebase Cloud Firestore database.
        </p>

        {migrationStatus.type !== 'idle' && (
          <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
            migrationStatus.type === 'running' ? 'bg-blue-50 text-blue-800' :
            migrationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
            'bg-rose-50 text-rose-800'
          }`}>
            {migrationStatus.type === 'running' && <Loader2 className="w-5 h-5 animate-spin mt-0.5" />}
            {migrationStatus.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5" />}
            {migrationStatus.type === 'error' && <AlertTriangle className="w-5 h-5 mt-0.5" />}
            <div>
              <p className="font-medium">{migrationStatus.message}</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleMigration} 
          disabled={migrating || migrationStatus.type === 'success'}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {migrating ? 'Migrating Data...' : 'Start Migration from Sheets to Firebase'}
        </Button>
      </div>
    </div>
  );
}
