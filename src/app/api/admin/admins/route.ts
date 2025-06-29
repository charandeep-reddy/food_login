import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await connectDB();
  const admins = await User.find({ isAdmin: true });
  return NextResponse.json(admins);
}