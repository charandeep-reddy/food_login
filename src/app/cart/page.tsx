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
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

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
    if (quantity < 1) return; // Prevent negative quantities
    
    setUpdatingItem(itemId);
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
      setUpdatingItem(null);
    }
  };

  // Increase quantity
  const handleIncrease = (itemId: string, currentQuantity: number) => {
    handleUpdate(itemId, currentQuantity + 1);
  };

  // Decrease quantity
  const handleDecrease = (itemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      // If quantity is 1, remove the item instead
      handleRemove(itemId);
    } else {
      handleUpdate(itemId, currentQuantity - 1);
    }
  };

  // Remove item
  const handleRemove = async (itemId: string) => {
    setUpdatingItem(itemId);
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
      setUpdatingItem(null);
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
        {cart.map((cartItem) => {
          const isUpdating = updatingItem === cartItem.item._id;
          
          return (
            <div key={cartItem.item._id} className="flex items-center gap-4 bg-white rounded shadow p-4">
              <img
                src={cartItem.item.image}
                alt={cartItem.item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{cartItem.item.name}</div>
                <div className="text-gray-600 text-sm">₹{cartItem.item.price}</div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="text-sm font-medium">Quantity:</label>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleDecrease(cartItem.item._id, cartItem.quantity)}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    
                    <span className="px-4 py-1 min-w-[3rem] text-center font-medium bg-white">
                      {isUpdating ? "..." : cartItem.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleIncrease(cartItem.item._id, cartItem.quantity)}
                      disabled={isUpdating}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Manual Input (Optional) */}
                  <input
                    type="number"
                    min={1}
                    value={cartItem.quantity}
                    disabled={isUpdating}
                    onChange={e => {
                      const value = Number(e.target.value);
                      if (value >= 1) {
                        handleUpdate(cartItem.item._id, value);
                      }
                    }}
                    className="w-16 border rounded px-2 py-1 text-center"
                    aria-label="Manual quantity input"
                  />
                  
                  <button
                    onClick={() => handleRemove(cartItem.item._id)}
                    disabled={isUpdating}
                    className="text-red-600 hover:text-red-800 hover:underline ml-2 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="font-bold text-green-700 text-lg">
                ₹{cartItem.item.price * cartItem.quantity}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <div className="text-right text-2xl font-bold text-green-700">
          Total: ₹{total}
        </div>
        <div className="flex justify-end mt-4">
          <a
            href="/checkout"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Proceed to Checkout
          </a>
        </div>
      </div>
    </main>
  );
}