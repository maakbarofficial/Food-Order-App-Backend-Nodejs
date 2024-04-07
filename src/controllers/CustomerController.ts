import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInputs, EditCustomerProfileInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, OnRequestOTP, ValidatePassword } from "../utility";
import { Customer } from "../models";

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, { validationError: { target: true } });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOTP();

  const existCustomer = await Customer.findOne({ email: email });

  if (existCustomer !== null) {
    return res.status(409).json({ message: "Email already exist" });
  }

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    firstName: "firstName",
    lastName: "lastName",
    address: "address",
    phone: phone,
    verified: false,
    otp: otp,
    otp_expiry: expiry,
    lat: 0,
    lng: 0,
  });

  if (result) {
    // Sent the OTP to customer
    // await OnRequestOTP(otp, phone);

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

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, { validationError: { target: true } });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = loginInputs;

  const customer = await Customer.findOne({ email: email });

  if (customer) {
    const validation = await ValidatePassword(password, customer.password, customer.salt);

    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });

      return res.status(201).json({ signature: signature, email: customer.email, verified: customer.verified });
    }
  }
  return res.status(400).json({ message: "Error while Login" });
};

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
  const { otp } = req.body;

  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;

        const updatedCustomerResponse = await profile.save();

        // generate the signature
        const signature = GenerateSignature({
          _id: updatedCustomerResponse._id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });

        return res.status(201).json({ signature: signature, email: updatedCustomerResponse.email, verified: updatedCustomerResponse.verified });
      }
    }
  }

  return res.status(400).json({ message: "Error while OTP Validation" });
};

export const RequestOTP = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, expiry } = GenerateOTP();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      // await OnRequestOTP(otp, profile.phone);

      return res.status(200).json({ message: "OTP send to your registred phone number!" });
    }
  }
  return res.status(400).json({ message: "Error with OTP Request" });
};

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({ message: "Customer doesnot exist!" });
};

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, { validationError: { target: true } });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, address } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Error while updating Customer profile" });
};
