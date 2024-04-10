import express, { Request, Response, NextFunction } from "express";
import { CreateFoodInputs, EditVendorInput, VendorLoginInput } from "../dto";
import { Food } from "../models";
import { GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./AdminController";
import { Order } from "../models/Order";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = <VendorLoginInput>req.body;

  const existingVendor = await FindVendor("", email);

  if (existingVendor !== null) {
    // validation and give access
    const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt);

    if (validation) {
      const signature = GenerateSignature({
        _id: existingVendor.id,
        email: existingVendor.email,
        foodTypes: existingVendor.foodType,
        name: existingVendor.name,
      });

      return res.json(signature);
    } else {
      return res.json({ message: "Login credentials not valid" });
    }
  }

  res.json({ message: "Login credentials not valid" });
};

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id);

    return res.json(existingVendor);
  }

  return res.json({ meesage: "Vendor not found" });
};

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
  const { name, address, foodTypes, phone } = <EditVendorInput>req.body;

  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id);

    if (existingVendor !== null) {
      existingVendor.name = name;
      existingVendor.address = address;
      existingVendor.foodType = foodTypes;
      existingVendor.phone = phone;

      const savedResult = await existingVendor.save();

      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({ meesage: "Vendor information not found" });
};

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      vendor.coverImages.push(...images);

      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({ meesage: "Something went wrong, with updating Vendor cover image" });
};

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id);

    if (existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      const savedResult = await existingVendor.save();

      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({ meesage: "Vendor information not found" });
};

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const { name, description, category, foodType, readyTime, price } = <CreateFoodInputs>req.body;

    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      const createdFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        images: images,
        readyTime: readyTime,
        price: price,
        rating: 0,
      });

      vendor.foods.push(createdFood);

      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({ meesage: "Something went wrong, with adding Food" });
};

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const foods = await Food.find({ vendorId: user._id });

    if (foods !== null) {
      return res.json(foods);
    }
  }

  return res.json({ meesage: "Foods information not found" });
};

export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate("items.food");

    if (orders !== null) {
      return res.status(200).json(orders);
    }
  }

  return res.json({ meesage: "Order not found" });
};

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    if (order !== null) {
      return res.status(200).json(order);
    }
  }

  return res.json({ meesage: "Order not found" });
};

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.id;

  const { status, remarks, time } = req.body; // ACCEPT, REJECT, UNDER-PROCESS, READY

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    order.orderStatus = status;
    order.remarks = remarks;
    if (time) {
      order.readyTime = time;
    }

    const orderResult = await order.save();

    if (orderResult !== null) {
      return res.status(200).json(orderResult);
    }
  }

  return res.json({ meesage: "Unable to process Order!" });
};
