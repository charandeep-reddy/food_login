import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await connectDB();

  const { name, email, password, isAdmin } = await req.json();
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "User exists" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, isAdmin: !!isAdmin });
  
  return NextResponse.json({
    message: "User created successfully",
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
}