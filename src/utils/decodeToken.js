import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";
import { findOne } from "../DB/DBservices.js";

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
  // check parameters
  if (authorization && next) {
    // check bearer
    if (authorization.startsWith(process.env.bearer_key)) {
      let [bearer, token] = authorization.split(" ");
      let segnature = "";
      if (tokenType == tokenTypes.access) {
        segnature = process.env.ACCESS_SEGNATURE;
      } else if (tokenType == tokenTypes.refresh) {
        segnature = process.env.REFRESH_SEGNATURE;
      }
      let payload = jwt.verify(token, segnature);
      const user = await findOne(userModel, { _id: payload.id });
      // check user
      if (user) {
        // check credentials changing
        if (user.credentialsChangedAt) {
          if (user.credentialsChangedAt.getTime() <= payload.iat * 1000) {
            return user;
          } else {
            return next(new Error("You have to login again"));
          }
        } else {
          return user;
        }
      } else {
        return next(new Error("User not found"));
      }
    } else {
      return next(new Error("Invalid bearer key"));
    }
  } else {
    return next(new Error("Please send token, tokenType and next"));
  }
};
