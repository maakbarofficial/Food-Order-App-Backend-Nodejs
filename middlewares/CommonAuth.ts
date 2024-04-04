import { NextFunction, Request, Response } from "express";
import { AuthPayLoad } from "../dto/Auth.dto";
import { ValidateSignature } from "../utility";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayLoad;
    }
  }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const validate = await ValidateSignature(req);

  if (validate) {
    next();
  } else {
    return res.json({ message: "User not Authorized" });
  }
};
