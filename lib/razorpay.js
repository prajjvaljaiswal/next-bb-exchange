let razorpayScriptLoaded = false;

export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (razorpayScriptLoaded && window.Razorpay) {
      return resolve(window.Razorpay);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve(window.Razorpay);
    };
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}

export async function openRazorpayCheckout({ orderId, amount, currency = "INR", name, description, prefill, onSuccess, onError }) {
  const Razorpay = await loadRazorpay();

  const rzp = new Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount,
    currency,
    name: "Bloodexchange.in",
    description,
    order_id: orderId,
    prefill,
    theme: { color: "#B91C1C" },
    handler: (response) => {
      onSuccess?.(response);
    },
    modal: {
      ondismiss: () => onError?.({ code: "DISMISSED", message: "Payment cancelled" }),
    },
  });

  rzp.open();
}
