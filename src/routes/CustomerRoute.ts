import express, { Request, Response, NextFunction } from "express";
import { Authenticate } from "../middlewares";
import {
  AddToCart,
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  EditCustomerProfile,
  GetCart,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOTP,
  VerifyOffer,
} from "../controllers";

const router = express.Router();

// Signup Customer
router.post("/signup", CustomerSignUp);

// Login
router.post("/login", CustomerLogin);

//Authentication required for all routes below
router.use(Authenticate);
// Verify Customer Account
router.patch("/verify", CustomerVerify);

// OTP / Requesting OTP
router.get("/otp", RequestOTP);

// Profile
router.get("/profile", GetCustomerProfile);
router.patch("/profile", EditCustomerProfile);

// Cart
router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

// Apply Offers
router.get("/offer/verify/:id", VerifyOffer);

// Orders
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/order/:id", GetOrderById);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from customers" });
});

export { router as CustomerRoute };
