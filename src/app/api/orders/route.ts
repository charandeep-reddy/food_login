import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Razorpay from "razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

  // 1. Verify payment signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // 2. Get user's cart and calculate total
  const user = await User.findById(session.user.id);
  if (!user || !user.cart.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Manually fetch item details (since populate may not work)
  const cartWithItems = await Promise.all(
    user.cart.map(async (c: any) => {
      const item = await (await import("@/models/Item")).default.findById(c.item);
      return {
        item,
        quantity: c.quantity,
      };
    })
  );
  const total = cartWithItems.reduce(
    (sum, c) => sum + (c.item?.price || 0) * c.quantity,
    0
  );

  // 3. Create order
  const order = await Order.create({
    user: user._id,
    items: user.cart.map((c: any) => ({
      item: c.item,
      quantity: c.quantity,
    })),
    total,
    status: "Pending",
    paymentId: razorpay_payment_id,
    address: user.address || "",
    phone: user.phone || "",
  });

  // 4. Clear user's cart
  user.cart = [];
  await user.save();

  return NextResponse.json({ message: "Order placed successfully", order });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();

  // Fetch all orders for the logged-in user, most recent first
  const orders = await Order.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Manually populate item details for each order
  for (const order of orders) {
    for (const cartItem of order.items) {
      const item = await (await import("@/models/Item")).default.findById(cartItem.item);
      cartItem.item = item;
    }
  }

  return NextResponse.json(orders);
}