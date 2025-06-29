"use client";
import { signOut } from "next-auth/react";

export default function UserPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">You are a user</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}