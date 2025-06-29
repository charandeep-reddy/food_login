import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Razorpay from "razorpay";
import Item from "@/models/Item";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const user = await User.findById(session.user.id)
  if (!user || !user.cart.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // After fetching the user:
  const cartWithItems = await Promise.all(
    user.cart.map(async (c: any) => {
      const item = await Item.findById(c.item);
      return {
        item,
        quantity: c.quantity,
      };
    })
  );
  // Now use cartWithItems for your total calculation
  const total = cartWithItems.reduce(
    (sum, c) => sum + (c.item?.price || 0) * c.quantity,
    0
  );

  console.log("Razorpay keys:", process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
  console.log("Total amount:", total);

  // Create Razorpay order
  const options = {
    amount: total * 100, // in paise
    currency: "INR",
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ order, total });
  } catch (err) {
    console.error("Razorpay error:", err);
    return NextResponse.json({ error: "Razorpay order creation failed" }, { status: 500 });
  }
}
