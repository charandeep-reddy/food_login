import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  cart: { item: mongoose.Types.ObjectId; quantity: number }[];
  address?: string;
  phone?: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  cart: [
    {
      item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  address: { type: String },
  phone: { type: String },
});

export default models.User || model<IUser>("User", UserSchema);