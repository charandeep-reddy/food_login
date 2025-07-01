"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  createdAt: string;
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login");
    }
  }, [session, status, router]);

  // Fetch orders
  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading your orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        You have no orders yet.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Orders</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow p-6 flex flex-col gap-2"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <div>
                <span className="font-semibold">Order ID:</span>{" "}
                <span className="text-gray-700">{order._id}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`${
                    order.status === "Delivered"
                      ? "text-green-600"
                      : order.status === "Out for Delivery"
                      ? "text-blue-600"
                      : order.status === "Preparing"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  } font-semibold`}
                >
                  {order.status}
                </span>
              </div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                <span className="text-gray-700">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="divide-y">
              {order.items.map((orderItem, idx) => (
                <div
                  key={orderItem.item._id + idx}
                  className="flex items-center gap-4 py-2"
                >
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
            <div className="text-right text-lg font-bold mt-2">
              Total: ₹{order.total}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Payment ID: {order.paymentId}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}