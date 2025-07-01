"use client";
import React from "react";

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

type Props = {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
};

export default function MenuItemRow({ item, onEdit, onDelete }: Props) {
  return (
    <tr className="border-t">
      <td className="px-4 py-2">{item.name}</td>
      <td className="px-4 py-2">₹{item.price}</td>
      <td className="px-4 py-2">
        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
      </td>
      <td className="px-4 py-2">
        <button
          className="text-blue-600 hover:underline mr-2"
          onClick={() => onEdit(item)}
        >
          Edit
        </button>
        <button
          className="text-red-600 hover:underline"
          onClick={() => onDelete(item._id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
