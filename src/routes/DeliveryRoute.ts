import express, { Request, Response, NextFunction } from "express";
import { Authenticate } from "../middlewares";
import { DeliveryUserLogin, DeliveryUserSignUp, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from "../controllers";

const router = express.Router();

// Signup Customer
router.post("/signup", DeliveryUserSignUp);

// Login
router.post("/login", DeliveryUserLogin);

//Authentication required for all routes below
router.use(Authenticate);

// Change Service Status
router.put("/change-status", UpdateDeliveryUserStatus);

// Profile
router.get("/profile", GetDeliveryUserProfile);
router.patch("/profile", EditDeliveryUserProfile);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from customers" });
});

export { router as DeliveryRoute };
