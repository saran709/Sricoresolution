import { auth } from './firebase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      // Leave unauthenticated header if token unavailable
    }
  }
  return headers;
}

export const createRazorpayOrder = async (amount: number, currency: string = 'INR', receipt: string, notes: any = {}) => {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
};

export const verifyRazorpayPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  email?: string
) => {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Payment verification failed');
  }

  return response.json();
};

let razorpayScriptPromise: Promise<boolean> | null = null;

// Deduplicated singleton loader for Razorpay Checkout script
export const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return Promise.resolve(true);
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => {
        razorpayScriptPromise = null;
        resolve(false);
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};
