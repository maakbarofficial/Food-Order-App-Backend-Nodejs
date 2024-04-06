import express, { Request, Response, NextFunction } from "express";
import { Authenticate } from "../middlewares";
import { GetFoodAvailablity, GetFoodIn30Min, GetTopRestaurants, RestaurantByID, SearchFoods } from "../controllers";

const router = express.Router();

// Food Availability
router.get("/:pincode", GetFoodAvailablity);

// Top Restaurants
router.get("/top-restaurants/:pincode", GetTopRestaurants);

// Food Available in 30 mins
router.get("/foods-in-30-min/:pincode", GetFoodIn30Min);

// Search Foods
router.get("/search/:pincode", SearchFoods);

// Find Restaurant by ID
router.get("/restaurant/:id", RestaurantByID);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from shopping" });
});

export { router as ShoppingRoute };
