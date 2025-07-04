"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";

type CartItem = {
  item: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
};

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    fetch("/api/cart")
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load cart");
        setLoading(false);
      });
  }, [session, status, router]);

  // Update quantity
  const handleUpdate = async (itemId: string, quantity: number) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update cart");
      setCart(data);
      refreshCart();
    } catch (err) {
      alert("Error updating cart");
    } finally {
      setUpdating(false);
    }
  };

  // Remove item
  const handleRemove = async (itemId: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove item");
      setCart(data);
      refreshCart();
    } catch (err) {
      alert("Error removing item");
    } finally {
      setUpdating(false);
    }
  };

  // Calculate total
  const total = cart.reduce(
    (sum, c) => sum + (c.item?.price || 0) * c.quantity,
    0
  );

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  if (!cart.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        Your cart is empty. <a href="/menu" className="text-blue-600 hover:underline">Go to Menu</a>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
      <div className="space-y-6">
        {cart.map((cartItem) => (
          <div key={cartItem.item._id} className="flex items-center gap-4 bg-white rounded shadow p-4">
            <img
              src={cartItem.item.image}
              alt={cartItem.item.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <div className="font-medium">{cartItem.item.name}</div>
              <div className="text-gray-600 text-sm">₹{cartItem.item.price}</div>
              <div className="flex items-center gap-2 mt-2">
                <label className="text-sm">Qty:</label>
                <input
                  type="number"
                  min={1}
                  value={cartItem.quantity}
                  disabled={updating}
                  onChange={e =>
                    handleUpdate(cartItem.item._id, Number(e.target.value))
                  }
                  className="w-16 border rounded px-2 py-1"
                />
                <button
                  onClick={() => handleRemove(cartItem.item._id)}
                  disabled={updating}
                  className="text-red-600 hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="font-bold text-green-700">
              ₹{cartItem.item.price * cartItem.quantity}
            </div>
          </div>
        ))}
      </div>
      <div className="text-right text-xl font-bold mt-8">
        Total: ₹{total}
      </div>
      <div className="flex justify-end mt-4">
        <a
          href="/checkout"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Proceed to Checkout
        </a>
      </div>
    </main>
  );
}