import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Database Connect : ${mongoose.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
