import express, { Request, Response, NextFunction } from "express";
import {
  AddFood,
  AddOffer,
  DeleteOffer,
  EditOffer,
  GetCurrentOrders,
  GetFoods,
  GetOffers,
  GetOrderDetails,
  GetVendorProfile,
  ProcessOrder,
  UpdateVendorCoverImage,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
} from "../controllers/VendorController";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    // cb(null, new Date().toISOString() + "_" + file.originalname); // Not Working
    // const datePart = new Date().toISOString().replace(/:/g, "-"); // Replace ':' with '-' // Working
    // cb(null, datePart + "_" + file.originalname);
    // cb(null, file.originalname);
    cb(null, new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage }).array("images", 10);

router.post("/login", VendorLogin);

// router.use(Authenticate); // Below this all routes will be protected
router.get("/profile", Authenticate, GetVendorProfile);
router.patch("/profile", Authenticate, UpdateVendorProfile);
router.patch("/coverimage", Authenticate, upload, UpdateVendorCoverImage);
router.patch("/service", Authenticate, UpdateVendorService);

router.post("/food", upload, Authenticate, AddFood);
router.get("/foods", Authenticate, GetFoods);

// Orders
router.use(Authenticate);
router.get("/orders", GetCurrentOrders);
router.put("/order/:id/process", ProcessOrder);
router.get("/order/:id", GetOrderDetails);

// Offers
router.get("/offers", GetOffers);
router.post("/offer", AddOffer);
router.put("/offer/:id", EditOffer);
router.delete("/offer/:id", DeleteOffer);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from vendor" });
});

export { router as VendorRoute };
