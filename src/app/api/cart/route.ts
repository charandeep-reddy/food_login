import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Item from "@/models/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";  

const cartSchema = z.object({
  itemId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid itemId"),
  quantity: z.number().min(1),
});

const cartDeleteSchema = z.object({
  itemId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid itemId"),
});

type CartInput = z.infer<typeof cartSchema>;
type CartDeleteInput = z.infer<typeof cartDeleteSchema>;

// Helper to populate cart items with item details
async function getPopulatedCart(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  const cartWithItems = await Promise.all(
    (user.cart || []).map(async (c: any) => {
      const item = await Item.findById(c.item).lean();
      return {
        item,
        quantity: c.quantity,
      };
    })
  );
  return cartWithItems;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const cartWithItems = await getPopulatedCart(session.user.id);
  if (!cartWithItems) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(cartWithItems);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await req.json();
  const result = cartSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid data", details: result.error.errors },
      { status: 400 }
    );
  }

  const { itemId, quantity } = result.data;

  const user = await User.findById(session.user.id);
  const existing = user.cart.find((c: any) => c.item.toString() === itemId);
  if (existing) {
    existing.quantity = quantity;
  } else {
    user.cart.push({ item: itemId, quantity });
  }
  await user.save();
  const cartWithItems = await getPopulatedCart(session.user.id);
  return NextResponse.json(cartWithItems);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await req.json();
  const result = cartDeleteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid data", details: result.error.errors },
      { status: 400 }
    );
  }

  const { itemId } = result.data;

  const user = await User.findById(session.user.id);
  user.cart = user.cart.filter((c: any) => c.item.toString() !== itemId);
  await user.save();
  const cartWithItems = await getPopulatedCart(session.user.id);
  return NextResponse.json(cartWithItems);
}