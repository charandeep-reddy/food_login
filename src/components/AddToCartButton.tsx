"use client";

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";

type Props = {
  itemId: string;
};

export default function AddToCartButton({ itemId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { refreshCart } = useCart();
  const handleAddToCart = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      setMessage("Added!");
      refreshCart();
    } catch (err) {
      setMessage("Error adding to cart");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 1500);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition hover:cursor-pointer"
    >
      {loading ? "Adding..." : message ? message : "Add to Cart"}
    </button>
  );
}
