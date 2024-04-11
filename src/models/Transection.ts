import mongoose, { Schema, Document, Model } from "mongoose";

export interface TransectionDoc extends Document {
  customer: string;
  vendorId: string;
  orderId: string;
  orderValue: number;
  offerUsed: string;
  status: string;
  paymentMode: string;
  paymentResponse: string;
}

const TransectionSchema = new Schema(
  {
    customer: {
      type: String,
    },
    vendorId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    orderValue: {
      type: String,
    },
    offerUsed: {
      type: String,
    },
    status: {
      type: String,
    },
    paymentMode: {
      type: String,
    },
    paymentResponse: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const Transection = mongoose.model<TransectionDoc>("transection", TransectionSchema);

export { Transection };
