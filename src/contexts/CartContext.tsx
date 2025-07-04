"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// 1. Define the shape of the context
type CartContextType = {
  count: number;
  refreshCart: () => Promise<void>;
  setCount: React.Dispatch<React.SetStateAction<number>>;
};

// 2. Create the context with a default value
const CartContext = createContext<CartContextType>({
  count: 0,
  refreshCart: async () => {},
  setCount: () => {},
});

// 3. Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);

  // 4. Function to fetch cart and update count
  const refreshCart = async () => {
    if (!session?.user) {
      setCount(0);
      return;
    }
    const res = await fetch("/api/cart");
    if (res.ok) {
      const cart = await res.json();
      // Sum up the quantities for total count
      const total = cart.reduce(
        (sum: number, c: { quantity: number }) => sum + c.quantity,
        0
      );
      setCount(total);
    }
  };

  // 5. Fetch cart count on login or session change
  useEffect(() => {
    if (status === "authenticated") {
      refreshCart();
    } else {
      setCount(0);
    }
    // eslint-disable-next-line
  }, [status, session?.user?.id]);

  // 6. Provide the context value to children
  return (
    <CartContext.Provider value={{ count, refreshCart, setCount }}>
      {children}
    </CartContext.Provider>
  );
}

// 7. Custom hook for easy access
export function useCart() {
  return useContext(CartContext);
}
