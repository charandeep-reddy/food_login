import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user.cart);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { itemId, quantity } = await req.json();
  if (!itemId || !quantity) {
    return NextResponse.json({ error: "itemId and quantity required" }, { status: 400 });
  }
  const user = await User.findById(session.user.id);
  const existing = user.cart.find((c: any) => c.item.toString() === itemId);
  if (existing) {
    existing.quantity = quantity;
  } else {
    user.cart.push({ item: itemId, quantity });
  }
  await user.save();
  return NextResponse.json(user.cart);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { itemId } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }
  const user = await User.findById(session.user.id);
  user.cart = user.cart.filter((c: any) => c.item.toString() !== itemId);
  await user.save();
  return NextResponse.json(user.cart);
}