import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Item from "@/models/Item";
import User from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const order = await Order.findById(params.id).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Only allow the user who placed the order or an admin to view
  if (order.user.toString() !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Populate items
  for (const cartItem of order.items) {
    const item = await Item.findById(cartItem.item).lean();
    cartItem.item = item;
  }
  return NextResponse.json(order);
}