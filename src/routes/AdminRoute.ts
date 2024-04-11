import express, { Request, Response, NextFunction } from "express";
import { CreateVendor, GetDeliveryUsers, GetTransectionById, GetTransections, GetVendorByID, GetVendors, VerifyDeliveryUser } from "../controllers";

const router = express.Router();

router.post("/vendor", CreateVendor);

router.get("/vendors", GetVendors);

router.get("/vendor/:id", GetVendorByID);

router.get("/transections", GetTransections);

router.get("/transection/:id", GetTransectionById);

router.put("/delivery/verify", VerifyDeliveryUser);

router.get("/delivery/users", GetDeliveryUsers);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from admin" });
});

export { router as AdminRoute };
