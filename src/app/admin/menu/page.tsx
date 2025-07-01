"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import AddMenuItemForm from "@/components/admin/AddMenuItemForm";
import MenuItemRow from "@/components/admin/MenuItemRow";
import EditMenuItemForm from "@/components/admin/EditMenuItemForm";

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

export default function AdminMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch menu items");
        setLoading(false);
      });
  }, [session]);

  if (status === "loading" || !session?.user?.isAdmin || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Are you sure you want to delete this item?")) return;
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      setMenuItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item._id);
  };

  const handleEditSave = (updated: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((i) => (i._id === updated._id ? updated : i))
    );
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Menu Management</h1>
      <AddMenuItemForm
        onAdd={item => setMenuItems(prev => [...prev, item])}
      />
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <React.Fragment key={item._id}>
              {editingId === item._id ? (
                <EditMenuItemForm
                  item={item}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              ) : (
                <MenuItemRow
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </main>
  );
}
