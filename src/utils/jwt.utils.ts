import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, UserDetails } from "./server";

const { PUBLIC_KEY, PRIVATE_KEY } = env;


export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, PRIVATE_KEY, {
    ...(options && options), // make sure options is not undefined before spreading it 
    algorithm: "RS256",
  });
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY) as UserDetails;
    return {
      valid: true,
      expired: false, 
      decoded,
    }
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    }
  }
}