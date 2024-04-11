import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateDeliveryUserInputs, EditCustomerProfileInputs, OrderInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { DeliveryUser } from "../models";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utility";

export const DeliveryUserSignUp = async (req: Request, res: Response, next: NextFunction) => {
  const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);

  const inputErrors = await validate(deliveryUserInputs, { validationError: { target: true } });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const existingDeliveryUser = await DeliveryUser.findOne({ email: email });

  if (existingDeliveryUser !== null) {
    return res.status(409).json({ message: "An delivery user exist with the provided email" });
  }

  const result = await DeliveryUser.create({
    email: email,
    password: userPassword,
    salt: salt,
    firstName: firstName,
    lastName: lastName,
    address: address,
    phone: phone,
    pincode: pincode,
    verified: false,
    lat: 0,
    lng: 0,
    isAvailable: false,
  });

  if (result) {
    // Generate the signature
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });

    // Send the result to client
    return res.status(201).json({ signature: signature, email: result.email, verified: result.verified });
  }

  return res.status(400).json({ message: "Error while Sign Up" });
};

export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, { validationError: { target: true } });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = loginInputs;

  const deliveryUser = await DeliveryUser.findOne({ email: email });

  if (deliveryUser) {
    const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt);

    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });

      return res.status(201).json({ signature: signature, email: deliveryUser.email, verified: deliveryUser.verified });
    }
  }
  return res.status(400).json({ message: "Error while Login" });
};

export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  const deliveryUser = req.user;

  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({ message: "Delivery User doesnot exist!" });
};

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  const deliveryUser = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, { validationError: { target: true } });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, address } = profileInputs;

  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Error while updating delivery User profile" });
};

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  const deliveryUser = req.user;

  if (deliveryUser) {
    const { lat, lng } = req.body;

    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (profile) {
      if (lat && lng) {
        profile.lat = lat;
        profile.lng = lng;
      }

      profile.isAvailable = !profile.isAvailable;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Error with update Delivery User status" });
};
