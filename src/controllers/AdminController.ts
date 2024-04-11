import express, { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transection, Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
  const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVendorInput>req.body;

  const existingVendor = await FindVendor("", email);

  if (existingVendor !== null) {
    return res.json({ message: "Vendor is already exist with this email" });
  }

  // generate a salt
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  // encrypt the password using the salt

  const createdVendor = await Vendor.create({
    name: name,
    address: address,
    pincode: pincode,
    foodType: foodType,
    email: email,
    password: userPassword,
    salt: salt,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImage: [],
    foods: [],
    lat: 0,
    lng: 0,
  });

  return res.json(createdVendor);
};

export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }

  return res.json({ message: "Vendors data is not available" });
};

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {
  const vendorId = req.params.id;

  const vendor = await FindVendor(vendorId);

  if (vendor !== null) {
    return res.json(vendor);
  }

  return res.json({ message: "Vendor data not available" });
};

export const GetTransections = async (req: Request, res: Response, next: NextFunction) => {
  const transections = await Transection.find();

  if (transections) {
    return res.status(200).json(transections);
  }

  return res.json({ message: "Transections data not available" });
};

export const GetTransectionById = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const transection = await Transection.findById(id);

  if (transection) {
    return res.status(200).json(transection);
  }

  return res.json({ message: "Transection data not available" });
};

export const GetDeliveryUsers = async (req: Request, res: Response, next: NextFunction) => {
  const deliveryUsers = await DeliveryUser.find();

  if (deliveryUsers) {
    return res.status(200).json(deliveryUsers);
  }

  return res.status(400).json({ message: "Delivery Users data is not available" });
};

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) => {
  const { _id, status } = req.body;

  if (_id) {
    const profile = await DeliveryUser.findById(_id);

    if (profile) {
      profile.verified = status;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }

  return res.status(400).json({ message: "Unable to verify Delivery User" });
};
