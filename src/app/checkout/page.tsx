"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<{ address?: string; phone?: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoadingProfile(false);
      })
      .catch(() => setLoadingProfile(false));
  }, [session, status, router]);

  // Helper to load the Razorpay SDK script
  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (document.getElementById("razorpay-sdk")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject("Razorpay SDK failed to load");
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Create Razorpay order on backend
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!data.order) {
        setError(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // 2. Load Razorpay SDK
      await loadRazorpayScript();

      // 3. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "FoodLogin",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          // 4. Send payment details to backend to verify and place order
          const verifyRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.error) {
            setError(verifyData.error);
          } else {
            alert("Order placed successfully!");
            router.push(`/order-confirmation?orderId=${verifyData.order._id}`);
            // Optionally redirect or update UI
          }
        },
        prefill: {
          // Optionally prefill user info
        },
        theme: { color: "#3399cc" },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError("Checkout failed");
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!profile?.address) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 font-semibold mb-4">
          Please complete your profile with a delivery address before checking out.
        </div>
        <a
          href="/profile"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Profile
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        {loading ? "Processing..." : "Pay & Place Order"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
