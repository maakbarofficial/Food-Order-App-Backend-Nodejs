import express, { Request, Response, NextFunction } from "express";
import { GetVendorProfile, UpdateVendorProfile, UpdateVendorService, VendorLogin } from "../controllers/VendorController";
import { Authenticate } from "../middlewares/CommonAuth";

const router = express.Router();

router.post("/login", VendorLogin);

// router.get(Authenticate); // Below this all routes will be protected

router.get("/profile", Authenticate, GetVendorProfile);

router.patch("/profile", UpdateVendorProfile);

router.patch("/service", UpdateVendorService);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from vendor" });
});

export { router as VendorRoute };
