export const createRazorpayOrder = async (amount: number, currency: string = "INR", receipt: string, notes: any = {}) => {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create order");
  }

  return response.json();
};

export const verifyRazorpayPayment = async (
  razorpay_order_id: string, 
  razorpay_payment_id: string, 
  razorpay_signature: string,
  email?: string
) => {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Payment verification failed");
  }

  return response.json();
};

// Hook to load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
