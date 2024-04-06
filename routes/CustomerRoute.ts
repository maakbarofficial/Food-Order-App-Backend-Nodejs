import express, { Request, Response, NextFunction } from "express";
import { Authenticate } from "../middlewares";
import { CustomerLogin, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOTP } from "../controllers";

const router = express.Router();

// Signup Customer
router.post("/signup", CustomerSignUp);

// Login
router.post("/login", CustomerLogin);

//Authentication
// Verify Customer Account
router.patch("/verify", Authenticate, CustomerVerify);

// OTP / Requesting OTP
router.get("/otp", Authenticate, RequestOTP);

// Profile
router.get("/profile", Authenticate, GetCustomerProfile);
router.patch("/profile", Authenticate, EditCustomerProfile);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from customers" });
});

export { router as CustomerRoute };
