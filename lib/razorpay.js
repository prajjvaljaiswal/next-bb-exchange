const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

let razorpayScriptLoaded = false;

export function loadRazorpay() {
  if (IS_DEV) return Promise.resolve(null); // no real script needed in dev

  return new Promise((resolve, reject) => {
    if (razorpayScriptLoaded && window.Razorpay) {
      return resolve(window.Razorpay);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve(window.Razorpay);
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  orderId,
  amount,
  currency = 'INR',
  name,
  description,
  prefill,
  onSuccess,
  onError,
}) {
  if (IS_DEV) {
    // Show a dev payment modal instead of real Razorpay
    const confirmed = window.confirm(
      `[DEV MODE — Mock Payment]\n\n` +
      `Amount: ₹${amount / 100}\n` +
      `Order ID: ${orderId}\n` +
      `Description: ${description || 'Payment'}\n\n` +
      `Click OK to simulate a successful payment, Cancel to simulate failure.`
    );

    if (confirmed) {
      const mockPaymentId = `pay_DEV_${Date.now()}`;
      console.log(`[DEV] Mock payment success: orderId=${orderId} paymentId=${mockPaymentId}`);
      // Small delay to simulate async
      await new Promise((r) => setTimeout(r, 600));
      onSuccess?.({
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'dev_signature_bypass',
      });
    } else {
      onError?.({ code: 'DISMISSED', message: 'Payment cancelled (dev mode)' });
    }
    return;
  }

  // Production Razorpay
  const Razorpay = await loadRazorpay();
  const rzp = new Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency,
    name: 'Bloodexchange.in',
    description,
    order_id: orderId,
    prefill,
    theme: { color: '#B91C1C' },
    handler: (response) => {
      onSuccess?.(response);
    },
    modal: {
      ondismiss: () => onError?.({ code: 'DISMISSED', message: 'Payment cancelled' }),
    },
  });
  rzp.open();
}
