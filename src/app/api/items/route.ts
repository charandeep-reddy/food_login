import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  image: z.string().min(1),
});

export async function GET(req: NextRequest) {
  await connectDB();
  const items = await Item.find();
  return NextResponse.json(items);
}

// POST /api/items - Add a new menu item (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const result = itemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid data", details: result.error.errors },
      { status: 400 }
    );
  }

  const { name, price, image } = result.data;

  if (await Item.findOne({ name })) {
    return NextResponse.json({ error: "Item already exists" }, { status: 400 });
  }
  const item = await Item.create({ name, price, image });
  return NextResponse.json(item, { status: 201 });
}