"use client";
import React, { useState } from "react";

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

type Props = {
  item: MenuItem;
  onSave: (updated: MenuItem) => void;
  onCancel: () => void;
};

export default function EditMenuItemForm({ item, onSave, onCancel }: Props) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [image, setImage] = useState(item.image);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/items/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update item");
      onSave(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr>
      <td colSpan={4}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 items-end"
        >
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="border rounded px-2 py-1"
          />
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            min={0}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            required
            className="border rounded px-2 py-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="ml-2 text-gray-500 hover:underline"
          >
            Cancel
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </td>
    </tr>
  );
}
