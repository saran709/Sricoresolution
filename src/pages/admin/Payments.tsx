import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp , onSnapshot} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Payment } from '../../types';
import { DollarSign, Search, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { logActivity } from '../../lib/activityLogger';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminPayments() {
  const { userProfile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dashboard stats
  const [stats, setStats] = useState({
    totalCollected: 0,
    pending: 0,
    successful: 0,
    failed: 0,
    refunds: 0,
    internshipRevenue: 0,
    projectRevenue: 0
  });

  useEffect(() => {
    const unsubscribe = setupSubscription();
    return () => unsubscribe && unsubscribe();
  }, []);

  const setupSubscription = () => {
    setLoading(true);

      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const items: Payment[] = [];
        
        let totalCollected = 0;
        let pending = 0;
        let successful = 0;
        let failed = 0;
        let refunds = 0;
        let internshipRevenue = 0;
        let projectRevenue = 0;

        snapshot.forEach(doc => {
          const p = { id: doc.id, ...doc.data() } as Payment;
          items.push(p);
          
          if (p.status === 'SUCCESS') {
            successful++;
            totalCollected += p.amount;
            if ((p as any).type === 'INTERNSHIP') internshipRevenue += p.amount;
            if ((p as any).type === 'PROJECT') projectRevenue += p.amount;
          } else if (p.status === 'PENDING' || p.status === 'INITIATED') {
            pending++;
          } else if (p.status === 'FAILED') {
            failed++;
          } else if (p.status === 'REFUNDED') {
            refunds++;
          }
        });

        setPayments(items);
        setStats({
          totalCollected,
          pending,
          successful,
          failed,
          refunds,
          internshipRevenue,
          projectRevenue
        });
        setLoading(false);
      });
  };

  const handleRefund = async (payment: Payment) => {
    if (payment.status !== 'SUCCESS') {
      alert("Can only refund successful payments.");
      return;
    }
    
    const confirmStr = prompt(`Type "REFUND" to confirm refunding ₹${payment.amount} for payment ${payment.paymentId || payment.id}`);
    if (confirmStr !== "REFUND") return;

    try {
      // In a real app, you would call your backend API here which then calls Razorpay Refunds API
      // await fetch('/api/payments/refund', { method: 'POST', body: JSON.stringify({ paymentId: payment.id }) })
      
      await updateDoc(doc(db, 'payments', payment.id!), {
        status: 'REFUNDED',
        updatedAt: serverTimestamp()
      });
      
      if (userProfile?.uid) {
        await logActivity('PAYMENT_REFUNDED', userProfile.uid, payment.id!, 'payment', `Refunded ₹${payment.amount}`);
      }
      
      
      alert("Refund initiated successfully");
    } catch (error) {
      console.error("Error processing refund", error);
      alert("Failed to process refund");
    }
  };

  const filteredPayments = payments.filter(p => 
    p.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance & Payments</h1>
          <p className="text-sm text-slate-500">Overview of all payment transactions and refunds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Collected</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats.totalCollected.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Internship Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats.internshipRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Project Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{stats.projectRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <h3 className="text-xl font-bold text-slate-900">{stats.pending}</h3>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Failed/Refunds</p>
                <h3 className="text-xl font-bold text-slate-900">{stats.failed} / {stats.refunds}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Payment ID, Order ID, or Purpose..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading payments...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No payment records found.</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 capitalize">{payment.paymentType.replace('_', ' ')}</div>
                      <div className="text-slate-500 text-xs mt-1 font-mono">{payment.paymentId || payment.orderId}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹{payment.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full
                        ${payment.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                          payment.status === 'PENDING' || payment.status === 'INITIATED' ? 'bg-orange-100 text-orange-700' :
                          payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.createdAt?.toDate ? new Date(payment.createdAt.toDate()).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'SUCCESS' && (
                        <Button variant="outline" size="sm" onClick={() => handleRefund(payment)}>
                          Refund
                        </Button>
                      )}
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
