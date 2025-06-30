import { cookies, headers } from "next/headers";
import React from "react";
import AddToCartButton from "@/components/AddToCartButton";

type Item = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

async function getItems() {
  const host = headers().get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/items`, {
    headers: { Cookie: cookies().toString() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export default async function MenuPage() {
  const items = await getItems();

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-40 h-40 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
            <p className="text-lg font-medium text-green-600 mb-2">
              ₹{item.price}
            </p>
            <AddToCartButton itemId={item._id} />
          </div>
        ))}
      </div>
    </main>
  );
}
