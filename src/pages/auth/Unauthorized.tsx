import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12">
      <Container>
        <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-8">
            You don't have permission to access this page. If you believe this is a mistake, please contact your administrator.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
