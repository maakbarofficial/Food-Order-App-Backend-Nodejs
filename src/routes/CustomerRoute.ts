import express, { Request, Response, NextFunction } from "express";
import { Authenticate } from "../middlewares";
import { CreateOrder, CustomerLogin, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, GetOrderById, GetOrders, RequestOTP } from "../controllers";

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

// ORDERS
router.post("/create-order", Authenticate, CreateOrder);
router.get("/orders", Authenticate, GetOrders);
router.get("/order/:id", Authenticate, GetOrderById);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from customers" });
});

export { router as CustomerRoute };
