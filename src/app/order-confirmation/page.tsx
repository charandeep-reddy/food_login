"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Order = {
  _id: string;
  items: Array<{ item: { name: string; price: number }; quantity: number }>;
  total: number;
  address: string;
  status: string;
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
      <p className="mb-2">Order ID: <span className="font-mono">{order._id}</span></p>
      <p className="mb-2">Status: <span className="font-semibold">{order.status}</span></p>
      <p className="mb-2">Delivery Address: {order.address}</p>
      <h2 className="mt-4 font-semibold">Items:</h2>
      <ul className="mb-4">
        {order.items.map((cartItem, idx) => (
          <li key={idx}>
            {cartItem.item.name} × {cartItem.quantity} — ₹{cartItem.item.price * cartItem.quantity}
          </li>
        ))}
      </ul>
      <div className="font-bold text-lg">Total: ₹{order.total}</div>
    </div>
  );
}