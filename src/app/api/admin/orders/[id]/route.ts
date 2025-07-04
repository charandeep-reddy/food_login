import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { z } from "zod";

const orderStatusSchema = z.object({
  status: z.enum(["Pending", "Preparing", "Out for Delivery", "Delivered"]),
});

const ALLOWED_STATUSES = ["Pending", "Preparing", "Out for Delivery", "Delivered"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const result = orderStatusSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid data", details: result.error.errors },
            { status: 400 }
        );
    }

    const { status } = result.data;

    await connectDB();

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const { id } = params;
    const order = await Order.findOne({ _id: id, user: session.user.id })
      .populate("items.item") // assumes items: [{ item: ObjectId, ... }]
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}