import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: {
      type: String,
      required: true,
      unique: true, 
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);