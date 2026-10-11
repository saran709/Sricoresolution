import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Payment, CompanySettings } from '../../types';
import { QrCode, X, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CheckoutButtonProps {
  amount: number;
  purpose: string;
  referenceId?: string; // e.g. projectId or invoiceId
  referenceType?: 'project' | 'internship' | 'service';
  paymentType?: Payment['paymentType'];
  onSuccess?: () => void;
  className?: string;
  label?: string;
}

export function CheckoutButton({ 
  amount, 
  purpose, 
  referenceId, 
  referenceType, 
  paymentType = 'other',
  onSuccess,
  className,
  label = "Pay via QR Code" 
}: CheckoutButtonProps) {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  
  // Form submission state
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedPaymentId, setSubmittedPaymentId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company billing / UPI settings when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchBillingSettings = async () => {
      setLoadingSettings(true);
      try {
        const snap = await getDoc(doc(db, 'settings', 'company_billing'));
        if (snap.exists()) {
          setSettings(snap.data() as CompanySettings);
        }
      } catch (err) {
        console.error("Failed to load billing settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchBillingSettings();
  }, [isOpen]);

  const fallbackUpiId = "sricoresolutions@upi";
  const upiId = settings?.upiId || fallbackUpiId;
  const payeeName = settings?.upiName || settings?.companyName || "Sricore Solutions";

  // Build standard UPI URI for QR code generation
  // Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
  const cleanPurpose = purpose.replace(/[^a-zA-Z0-9 ]/g, ' ').substring(0, 30);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(cleanPurpose)}`;

  // Quick online dynamic QR code URL
  const qrImageSrc = settings?.qrCodeUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      alert("Please log in to complete payment submission.");
      return;
    }

    if (!transactionRef.trim()) {
      setError("Please enter your UPI Reference / UTR Number");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const paymentRecord: Omit<Payment, 'id'> = {
        clientId: userProfile.uid,
        amount,
        currency: 'INR',
        status: 'PENDING',
        verificationStatus: 'pending',
        method: 'UPI_QR',
        transactionId: transactionRef.trim(),
        paymentId: transactionRef.trim(),
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentType,
        notes: notes.trim() || undefined
      };

      if (referenceType === 'project') paymentRecord.projectId = referenceId;
      if (referenceType === 'service' || purpose.toLowerCase().includes('invoice')) paymentRecord.invoiceId = referenceId;

      const docRef = await addDoc(collection(db, 'payments'), paymentRecord);

      // If tied to an invoice, link this reference
      if (paymentRecord.invoiceId) {
        try {
          await updateDoc(doc(db, 'invoices', paymentRecord.invoiceId), {
            paymentId: docRef.id
          });
        } catch (e) {
          console.warn("Could not link payment to invoice:", e);
        }
      }

      setSubmittedPaymentId(docRef.id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Payment submission failed:", err);
      setError(err?.message || "Failed to submit payment details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmittedPaymentId(null);
    setTransactionRef('');
    setNotes('');
    setError(null);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className={`flex items-center gap-2 ${className || ''}`}
      >
        <QrCode className="w-4 h-4" />
        {label}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">UPI QR Code Payment</h3>
                  <p className="text-xs text-blue-100">Scan & Pay securely via any UPI App</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedPaymentId ? (
              /* Success confirmation state */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Payment Submitted for Verification!</h4>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you! We received your UTR reference <span className="font-mono font-semibold text-slate-800">{transactionRef}</span>. 
                  Our team will verify the payment and update your invoice status shortly.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
                  <p><span className="font-semibold">Amount:</span> ₹{amount.toLocaleString('en-IN')}</p>
                  <p><span className="font-semibold">Purpose:</span> {purpose}</p>
                  <p><span className="font-semibold">Reference ID:</span> {submittedPaymentId}</p>
                  <p><span className="font-semibold">Status:</span> <span className="text-amber-600 font-medium">Pending Verification</span></p>
                </div>
                <div className="pt-2">
                  <Button onClick={handleClose} fullWidth>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* Payment instructions & QR code */
              <div className="p-6 space-y-6">
                {/* Amount display */}
                <div className="text-center bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Payable Amount</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500 mt-1">{purpose}</p>
                </div>

                {/* QR Code section */}
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white border-2 border-dashed border-blue-300 rounded-2xl shadow-sm">
                    {loadingSettings ? (
                      <div className="w-52 h-52 flex items-center justify-center bg-slate-50 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <img 
                        src={qrImageSrc} 
                        alt="Scan QR code to pay"
                        className="w-52 h-52 object-contain rounded-lg"
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Compatible with GPay, PhonePe, Paytm, BHIM, or any banking UPI app
                  </p>
                </div>

                {/* UPI ID Details */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">UPI ID / VPA</p>
                    <p className="text-sm font-mono font-bold text-slate-800 select-all">{upiId}</p>
                    <p className="text-xs text-slate-500">{payeeName}</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1.5 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Proof submission form */}
                <form onSubmit={handleConfirmPayment} className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Enter UPI Transaction ID / UTR Number <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">12-digit number from payment app</span>
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 429182749102"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="text-left">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Optional Note / Payer Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Paid from HDFC account"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your transaction will be verified by the admin team against the bank statement.</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      isLoading={submitting}
                      className="flex-1 flex items-center justify-center gap-1.5"
                    >
                      <span>I Have Paid</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
