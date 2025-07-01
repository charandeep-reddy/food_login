"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Order = {
  _id: string;
  user: { name: string; email: string };
  items: { item: { name: string }; quantity: number }[];
  total: number;
  status: string;
  paymentId: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemNameQuery, setItemNameQuery] = useState("");
  const [paymentIdQuery, setPaymentIdQuery] = useState("");
  const [orderIdQuery, setOrderIdQuery] = useState("");

  const ALLOWED_STATUSES = [
    "Pending",
    "Preparing",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login");
    } else if (!session.user.isAdmin) {
      alert("You are not authorized to access this page");
      router.replace("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!session?.user?.isAdmin) return;
    setLoading(true);
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch orders");
        setLoading(false);
      });
  }, [session]);

  const filteredOrders = orders.filter(order => {
    // Status filter
    const statusMatch = statusFilter === "All" || order.status === statusFilter;

    // User search filter
    const user = order.user || {};
    const search = searchQuery.toLowerCase();
    const userMatch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search);

    // Date filter
    const orderDate = new Date(order.createdAt);
    const startMatch = !startDate || orderDate >= new Date(startDate);
    const endMatch = !endDate || orderDate <= new Date(endDate + "T23:59:59");

    // Item name filter
    const itemName = itemNameQuery.toLowerCase();
    const itemMatch =
      !itemNameQuery ||
      order.items.some(orderItem =>
        orderItem.item?.name?.toLowerCase().includes(itemName)
      );

    // Payment ID filter
    const paymentIdMatch =
      !paymentIdQuery ||
      order.paymentId?.toLowerCase().includes(paymentIdQuery.toLowerCase());

    // Order ID filter
    const orderIdMatch =
      !orderIdQuery ||
      order._id?.toLowerCase().includes(orderIdQuery.toLowerCase());

    return (
      statusMatch &&
      (!searchQuery || userMatch) &&
      startMatch &&
      endMatch &&
      itemMatch &&
      paymentIdMatch &&
      orderIdMatch
    );
  });

  if (status === "loading" || !session?.user?.isAdmin || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
        {/* Status Filter Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Search (User Name or Email)</label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type to search..."
            className="border rounded px-2 py-1"
          />
        </div>
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <input
            type="text"
            value={itemNameQuery}
            onChange={e => setItemNameQuery(e.target.value)}
            placeholder="Search item name..."
            className="border rounded px-2 py-1"
          />
        </div>
        {/* Payment ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Payment ID</label>
          <input
            type="text"
            value={paymentIdQuery}
            onChange={e => setPaymentIdQuery(e.target.value)}
            placeholder="Search payment ID..."
            className="border rounded px-2 py-1"
          />
        </div>
        {/* Order ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Order ID</label>
          <input
            type="text"
            value={orderIdQuery}
            onChange={e => setOrderIdQuery(e.target.value)}
            placeholder="Search order ID..."
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Payment ID</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="px-4 py-2">{order._id}</td>
                <td className="px-4 py-2">
                  {order.user?.name} <br />
                  <span className="text-xs text-gray-500">{order.user?.email}</span>
                </td>
                <td className="px-4 py-2">
                  <ul className="list-disc pl-4">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.item?.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 font-bold text-green-700">₹{order.total}</td>
                <td className="px-4 py-2">
                  <select
                    value={order.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        const res = await fetch(`/api/admin/orders/${order._id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: newStatus }),
                        });
                        if (!res.ok) throw new Error("Failed to update status");
                        setOrders((prev) =>
                          prev.map((o) =>
                            o._id === order._id ? { ...o, status: newStatus } : o
                          )
                        );
                      } catch (err) {
                        alert("Error updating status");
                      }
                    }}
                    className="border rounded px-2 py-1"
                  >
                    {ALLOWED_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-xs">{order.paymentId}</td>
                <td className="px-4 py-2 text-xs">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}