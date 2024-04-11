import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { CartItem, CreateCustomerInputs, EditCustomerProfileInputs, OrderInputs, UserLoginInputs } from "../dto/Customer.dto";
import { validate } from "class-validator";
import { GenerateOTP, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utility";
import { Customer, DeliveryUser, Food, Offer, Order, Transection, Vendor } from "../models";

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
    orders: [],
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

export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    let cartItems = Array();

    const { _id, unit } = <CartItem>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile != null) {
        cartItems = profile.cart;

        // console.log(cartItems);

        if (cartItems.length > 0) {
          // check and update
          let existFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);
          if (existFoodItems.length > 0) {
            const index = cartItems.indexOf(existFoodItems[0]);

            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          // add new Item
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartResult.cart);
        }
      }
    }
  }

  return res.status(404).json({ msg: "Unable to add to cart!" });
};

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }

  return res.status(400).json({ msg: "cart is empty!" });
};

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();

      return res.status(200).json(cartResult);
    }
  }

  return res.status(400).json({ msg: "cart is already empty!" });
};

export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  const { amount, paymentMode, offerId } = req.body;

  let payableAmount = Number(amount);

  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.isActive) {
        payableAmount = payableAmount - appliedOffer.offerAmount;
      }
    }
  }

  // Calling Payment Gatway API Example below

  /*

  import { Stripe } from 'stripe'
  import {v4 as uuidv4} from 'uuid'

  const stripe = new Stripe('sk_test_key',  {
    apiVersion: '2020-08-27',
  })


    const { email, product, authToken } = req.body;
    const { token } = authToken;
    const { card } = token;

    console.log(card);

    console.log("============================================== payment initiate =======================");

    const userProduct = product as Product;

    // unique ID generated by client
    const idempotencyKey = uuidv4();

    try {
      const customer = await stripe.customers.create({
        email: email,
        source: token.id,
      });

      console.log("Customer Created.....");
      console.log(customer);

      const response = await stripe.charges.create(
        {
          amount: userProduct.amount * 100,
          currency: "INR",
          customer: customer.id,
          receipt_email: email,
          description: userProduct.description,
          shipping: {
            name: card.name,
            address: {
              line1: "Mumbai",
              country: card.address_country,
            },
          },
        },
        { idempotencyKey: idempotencyKey }
      );

      console.log("charge response");
      console.log(response);

      res.json(response);
    } catch (err) {
      console.log("=========================================== error ==========================");
      console.log(err);
      res.json(err);
    }

  */

  // Creating Transection
  const transection = await Transection.create({
    customer: customer._id,
    vendorId: "",
    orderId: "",
    orderValue: payableAmount,
    offerUsed: offerId || "NA",
    status: "OPEN", // Failed, Success
    paymentMode: paymentMode,
    paymentResponse: "Payment is Cash on Delivery",
  });

  return res.status(200).json(transection);

  // return res.status(400).json({ message: "Offer is not valid" });
};

const validateTransection = async (trxId: string) => {
  const currentTransection = await Transection.findById(trxId);

  if (currentTransection) {
    if (currentTransection.status.toLowerCase() !== "failed") {
      return { status: true, currentTransection };
    }
  }
  return { status: false, currentTransection };
};

const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
  // find the vendor
  const vendor = await Vendor.findById(vendorId);

  if (vendor) {
    const areaCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;

    // find the availbility delivery person
    const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true });

    if (deliveryPerson) {
      console.log("🚀 ~ assignOrderForDelivery ~ deliveryPerson:", deliveryPerson);

      // check the nearist delivery person and assign the order
      // Google Map API

      const currentOrder = await Order.findById(orderId);

      if (currentOrder) {
        // update deliveryId
        // currentOrder.deliveryId =
        currentOrder.deliveryId = deliveryPerson[0]._id;
        const response = await currentOrder.save();

        console.log("🚀 ~ assignOrderForDelivery ~ response:", response);

        // Notification to Customer
      }
    }
  }
};

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
  // grab current login customer
  const customer = req.user;

  const { trxId, amount, items } = <OrderInputs>req.body;

  if (customer) {
    // validate Transection
    const { status, currentTransection } = await validateTransection(trxId);

    if (!status) {
      return res.status(400).json({ message: "Error with create Order!" });
    }

    // create an order ID
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    let cartItems = Array();

    let netAmount = 0.0;

    let vendorId;

    // calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();

    foods.map((food) => {
      items.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        } else {
          console.log(`${food._id}/${_id}`);
        }
      });
    });

    // create order with item description
    if (cartItems) {
      const currentOrder = await Order.create({
        orderId: orderId,
        vendorId: vendorId,
        items: cartItems,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: "waiting",
        remarks: "",
        deliveryId: "",
        readyTime: 45,
      });

      profile.cart = [] as any;
      profile.orders.push(currentOrder);

      currentTransection.vendorId = vendorId;
      currentTransection.orderId = orderId;
      currentTransection.status = "CONFIRMED";

      await currentTransection.save();

      assignOrderForDelivery(currentOrder._id, vendorId);

      const profileResponse = await profile.save();

      return res.status(200).json(currentOrder);
    } else {
      // finally update orders to user account
      return res.status(400).json({ message: "Error with Create Order!" });
    }
  }
};

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");

    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }

  return res.status(400).json({ message: "Orders data not available" });
};

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    return res.status(200).json(order);
  }

  return res.status(400).json({ message: "Order data not available" });
};

export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {
  const offerId = req.params.id;
  const customer = req.user;

  if (customer) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.promoType === "USER") {
        // only can apply once per user
      } else {
        if (appliedOffer.isActive) {
          return res.status(200).json({ message: "Offer is valid", offer: appliedOffer });
        }
      }
    }
  }

  return res.status(400).json({ message: "Offer is not valid" });
};
