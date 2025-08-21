import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";
import { findOne } from "../DB/DBservices.js";
import revokeTokenModel from "../DB/models/revokeToken.model.js";

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};
Object.freeze(tokenTypes);

export const decodeToken = async (
  authorization,
  tokenType = tokenTypes.access,
  next
) => {
  if (authorization.startsWith(process.env.bearer_key)) {
    let [bearer, token] = authorization.split(" ");
    let segnature = "";
    if (tokenType == tokenTypes.access) {
      segnature = process.env.ACCESS_SEGNATURE;
    } else if (tokenType == tokenTypes.refresh) {
      segnature = process.env.REFRESH_SEGNATURE;
    }
    let payload = jwt.verify(token, segnature); // result || error
    const user = await findOne(userModel, { _id: payload.id });
    const isTokenRevoked = await findOne(revokeTokenModel, {
      jti: payload.jti,
    });
    // ! Is this case true
    if (
      !isTokenRevoked ||
      (isTokenRevoked && user._id != isTokenRevoked.userId)
    ) {
      if (user) {
        if (user.credentialsChangedAt) {
          if (user.credentialsChangedAt.getTime() <= payload.iat * 1000) {
            return { user, payload };
          } else {
            return next(new Error("You have to login again"));
          }
        } else {
          return { user, payload };
        }
      } else {
        return next(new Error("User not found"));
      }
    } else {
      return next(new Error("Token is revoked"));
    }
  } else {
    return next(new Error("Invalid bearer key"));
  }
};
