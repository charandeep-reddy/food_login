"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = {
  item: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentId: string;
  address: string;
  phone: string;
  createdAt: string;
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order.");
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !order) {
    return (
      <div className="text-center py-12 text-red-500">
        {error || "Order not found."}
        <div>
          <a href="/" className="text-blue-600 hover:underline">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Order Confirmed!</h1>
      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="mb-2">
          <span className="font-semibold">Order ID:</span> {order._id}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span> {order.status}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Payment ID:</span> {order.paymentId}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Delivery Address:</span> {order.address}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Phone:</span> {order.phone}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Items</h2>
        <div className="space-y-2">
          {order.items.map((orderItem, idx) => (
            <div key={orderItem.item._id + idx} className="flex items-center gap-4">
              <img
                src={orderItem.item.image}
                alt={orderItem.item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{orderItem.item.name}</div>
                <div className="text-gray-600 text-sm">
                  ₹{orderItem.item.price} × {orderItem.quantity}
                </div>
              </div>
              <div className="font-bold text-green-700">
                ₹{orderItem.item.price * orderItem.quantity}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-right text-xl font-bold mb-6">
        Total: ₹{order.total}
      </div>
      <div className="flex justify-center gap-4">
        <a
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </a>
        <a
          href="/orders"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          View My Orders
        </a>
      </div>
    </main>
  );
}