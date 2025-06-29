import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: { item: mongoose.Types.ObjectId; quantity: number }[];
  total: number;
  status: "Pending" | "Preparing" | "Out for Delivery" | "Delivered";
  paymentId: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Out for Delivery", "Delivered"],
    default: "Pending",
  },
  paymentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Order || model<IOrder>("Order", OrderSchema);