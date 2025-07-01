import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// GET: Return current user's profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Only return safe fields
  return NextResponse.json({
    name: user.name,
    address: user.address || "",
    phone: user.phone || "",
    email: user.email,
  });
}

// PATCH: Update current user's profile
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { name, address, phone } = await req.json();
  // You can add validation here if you want
  const user = await User.findByIdAndUpdate(
    session.user.id,
    { name, address, phone },
    { new: true }
  ).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    name: user.name,
    address: user.address || "",
    phone: user.phone || "",
    email: user.email,
  });
}
