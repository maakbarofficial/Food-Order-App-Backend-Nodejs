import express from "express";
import { AdminRoute, VendorRoute } from "./routes";
import mongoose from "mongoose";
import { MONGO_URI } from "./config";

const app = express();

// parse application/json, basically parse incoming Request Object as a JSON Object
app.use(express.json());
// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(express.urlencoded({ extended: false }));
// parse incoming Request Object if object, with nested objects, or generally any type.
app.use(express.urlencoded({ extended: true }));

app.use("/admin", AdminRoute);
app.use("/Vendor", VendorRoute);

// Database
mongoose
  .connect(MONGO_URI)
  .then((result) => {
    // console.log(result);
    console.log(`Database Connect : ${result.connection.host}`);
  })
  .catch((error) => {
    console.log(error);
  });

// Server
app.listen(8000, () => {
  console.clear();
  console.log("App is listening to the port 8000");
});
