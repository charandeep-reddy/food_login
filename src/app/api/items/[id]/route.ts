import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// PATCH /api/items/[id] - Edit item (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { name, price, image } = await req.json();
  const { id } = await params;
  const item = await Item.findByIdAndUpdate(
    id,
    { name, price, image },
    { new: true }
  );
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json(item);
}

// DELETE /api/items/[id] - Delete item (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const item = await Item.findByIdAndDelete(id);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ message: "Item deleted" });
}