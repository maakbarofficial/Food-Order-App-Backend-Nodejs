import express, { Request, Response, NextFunction } from "express";
import { CreateFoodInputs, CreateOfferInputs, EditVendorInput, VendorLoginInput } from "../dto";
import { Food, Offer } from "../models";
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

  const { lat, lng } = req.body;

  if (user) {
    const existingVendor = await FindVendor(user._id);

    if (existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      if (lat && lng) {
        existingVendor.lat = lat;
        existingVendor.lng = lng;
      }

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

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    let currentOffers = Array();

    const offers = await Offer.find().populate("vendors");

    if (offers) {
      offers.map((item) => {
        if (item.vendors) {
          item.vendors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffers.push(item);
            }
          });
        }

        if (item.offerType === "GENERIC") {
          currentOffers.push(item);
        }
      });
    }

    return res.json(currentOffers);
  }
  return res.json({ message: "Unable to get Offers!" });
};

export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const { offerType, title, description, minValue, offerAmount, startValidity, endValidity, promocode, promoType, bank, bins, pincode, isActive } = <CreateOfferInputs>req.body;

    const vendor = await FindVendor(user._id);

    if (vendor) {
      const offer = await Offer.create({
        offerType,
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        promocode,
        promoType,
        bank,
        bins,
        pincode,
        isActive,
        vendors: [vendor],
      });

      return res.status(200).json(offer);
    }
  }

  return res.json({ message: "Unable to create Offer!" });
};

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const offerId = req.params.id;

  if (user) {
    const { offerType, title, description, minValue, offerAmount, startValidity, endValidity, promocode, promoType, bank, bins, pincode, isActive } = <CreateOfferInputs>req.body;

    const currentOffer = await Offer.findById(offerId);

    if (currentOffer) {
      const vendor = await FindVendor(user._id);

      if (vendor) {
        currentOffer.offerType = offerType;
        currentOffer.title = title;
        currentOffer.description = description;
        currentOffer.minValue = minValue;
        currentOffer.offerAmount = offerAmount;
        currentOffer.startValidity = startValidity;
        currentOffer.endValidity = endValidity;
        currentOffer.promocode = promocode;
        currentOffer.promoType = promoType;
        currentOffer.bank = bank;
        currentOffer.bins = bins;
        currentOffer.pincode = pincode;
        currentOffer.isActive = isActive;

        const result = await currentOffer.save();

        return res.status(200).json(result);
      }
    }
  }

  return res.json({ message: "Unable to edit Offer!" });
};

export const DeleteOffer = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  const offerId = req.params.id;

  if (user) {
    const offers = await Offer.find().populate("vendors");

    if (offers) {
      // offers.map((item) => {
      //   if (item.vendors) {
      //     item.vendors.map((vendor) => {
      //       if (vendor._id.toString() === user._id) {
      //         const deletedOffer = await Offer.findByIdAndDelete(offerId);

      //         return res.status(200).json(deletedOffer);
      //       }
      //     });
      //   }
      // });

      const deletedOffers = [];
      await Promise.all(
        offers.map(async (item) => {
          if (item.vendors) {
            item.vendors.forEach(async (vendor) => {
              if (vendor._id.toString() === user._id) {
                const deletedOffer = await Offer.findByIdAndDelete(offerId);
                deletedOffers.push(deletedOffer);
              }
            });
          }
        })
      );

      return res.json({ message: `Offer ${offerId} deleted successfully` });
    }
  }

  return res.json({ message: "Unable to delete Offer!" });
};
