import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await connectDB();
  const users = await User.find();
  return NextResponse.json(users);
}