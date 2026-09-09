import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { createRazorpayOrder, verifyRazorpayPayment, loadRazorpayScript } from '../../lib/payments';
import { writeToSheet } from '../../lib/sheets';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Payment } from '../../types';

interface CheckoutButtonProps {
  amount: number;
  purpose: string; // Used for UI only (Razorpay description), not stored directly in payment table
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
  paymentType,
  onSuccess,
  className,
  label = "Pay Now" 
}: CheckoutButtonProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!userProfile) {
      alert("Please login to proceed with payment.");
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 2. Create Payment Record (INITIATED)
      const paymentRecord: Omit<Payment, 'id'> = {
        clientId: userProfile.uid,
        amount,
        currency: 'INR',
        status: 'INITIATED',
        verificationStatus: 'pending',
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        paymentType: paymentType || 'other'
      };
      
      if (referenceType === 'project') paymentRecord.projectId = referenceId;
      if (referenceType === 'service' || purpose.toLowerCase().includes('invoice')) paymentRecord.invoiceId = referenceId;
      
      const paymentDoc = await addDoc(collection(db, 'payments'), paymentRecord);

      // 3. Create Order on Server
      const order = await createRazorpayOrder(amount, "INR", paymentDoc.id, {
        userId: userProfile.uid,
        purpose
      });

      // Update payment record with Order ID
      await updateDoc(doc(db, 'payments', paymentDoc.id), {
        orderId: order.id
      });

      // 4. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "dummy_key",
        amount: order.amount,
        currency: order.currency,
        name: "Sricore Solutions",
        description: purpose,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 5. Verify payment on Server
            await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              userProfile.email || undefined
            );

            // 6. Update local Firestore doc status to SUCCESS (Real app would use webhook/server)
            await updateDoc(doc(db, 'payments', paymentDoc.id), {
              status: 'SUCCESS',
              paymentId: response.razorpay_payment_id,
              verificationStatus: 'verified',
              updatedAt: serverTimestamp()
            });

            alert("Payment Successful!");
            if (onSuccess) onSuccess();
          } catch (err) {
            console.error(err);
            await updateDoc(doc(db, 'payments', paymentDoc.id), {
              status: 'FAILED',
              verificationStatus: 'failed',
              updatedAt: serverTimestamp()
            });
            alert("Payment Verification Failed. If money was deducted, it will be refunded.");
          }
        },
        prefill: {
          name: userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : '',
          email: userProfile.email || '',
          contact: userProfile.phone || ''
        },
        theme: {
          color: "#2563EB"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      
      rzp1.on('payment.failed', async function (response: any) {
        await updateDoc(doc(db, 'payments', paymentDoc.id), {
          status: 'FAILED',
          updatedAt: serverTimestamp()
        });
        alert(`Payment Failed: ${response.error.description}`);
      });
      
      rzp1.open();

    } catch (error) {
      console.error("Payment flow error:", error);
      alert("Something went wrong during payment initialization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading} 
      className={className}
    >
      {loading ? 'Processing...' : label}
    </Button>
  );
}
