import { decodeToken, tokenTypes } from "../utils/decodeToken.js";

export const auth = () => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodeToken(authorization, tokenTypes.access, next);
    req.user = user;
    return next();
  };
};
