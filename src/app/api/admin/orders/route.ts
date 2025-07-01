import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Item from "@/models/Item";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // 1. Check if user is admin
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // 2. Fetch all orders, populate user and item details
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .lean();

  // Manually populate user and item details
  for (const order of orders) {
    // Attach user info
    const user = await User.findById(order.user).lean();
    order.user = user ? { name: user.name, email: user.email, _id: user._id } : null;

    // Attach item info for each order item
    for (const cartItem of order.items) {
      const item = await Item.findById(cartItem.item).lean();
      cartItem.item = item;
    }
  }

  return NextResponse.json(orders);
}