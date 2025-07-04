"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";



export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { count, refreshCart } = useCart();

  return (
    <nav className="bg-white shadow mb-8">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo/Home */}
        <Link href="/" className="text-xl font-bold text-blue-700">
          FoodLogin
        </Link>
        <div className="flex items-center gap-4">
          {/* Menu */}
          <Link
            href="/menu"
            className={`hover:underline ${pathname === "/menu" ? "font-semibold text-blue-600" : ""}`}
          >
            Menu
          </Link>
          {/* Cart */}
          <Link
            href="/cart"
            className={`relative hover:underline ${pathname === "/cart" ? "font-semibold text-blue-600" : ""}`}
          >
            Cart
            {count > 0 && (
              <span className="ml-1 bg-green-600 text-white rounded-full px-2 text-xs absolute -top-2 -right-3">
                {count}
              </span>
            )}
          </Link>
          {/* Orders */}
          {session?.user && (
            <Link
              href="/orders"
              className={`hover:underline ${pathname === "/orders" ? "font-semibold text-blue-600" : ""}`}
            >
              Orders
            </Link>
          )}
          {/* Profile */}
          {session?.user && (
            <Link
              href="/profile"
              className={`hover:underline ${pathname === "/profile" ? "font-semibold text-blue-600" : ""}`}
            >
              Profile
            </Link>
          )}
          {/* Admin Dashboard */}
          {session?.user?.isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`hover:underline ${pathname === "/admin/dashboard" ? "font-semibold text-blue-600" : ""}`}
            >
              Admin
            </Link>
          )}
          {/* Menu Items */}
          {session?.user?.isAdmin && (
            <Link
              href="/admin/menu"
              className={`hover:underline ${pathname === "/admin/menu" ? "font-semibold text-blue-600" : ""}`}
            >
              Manage-Menu
            </Link>
          )}
          {/* Auth */}
          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 text-red-600 hover:underline"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className={`hover:underline ${pathname === "/login" ? "font-semibold text-blue-600" : ""}`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}