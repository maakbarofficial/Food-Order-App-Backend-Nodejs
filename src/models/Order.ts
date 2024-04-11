import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string; // 546465
  items: [any]; // [{food, unit: 1}]
  totalAmount: number; // 456
  paidAmount: number;
  orderDate: Date;
  orderStatus: string; // waiting, preparing, onway, delivered, cancelled, failed
  remarks: string;
  deliveryId: string;
  readyTime: number; // max 60 min
}

const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
    },
    orderStatus: {
      type: String,
    },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v, delete ret.createdAt, delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
