import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IItem extends Document {
  name: string;
  price: number;
  image: string;
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

export default models.Item || model<IItem>("Item", ItemSchema);