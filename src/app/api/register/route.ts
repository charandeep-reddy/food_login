import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(4),
  isAdmin: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid data", details: result.error.errors },
      { status: 400 }
    );
  }

  const { name, email, password, isAdmin } = result.data;
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