import { decodeToken, tokenTypes } from "../utils/decodeToken.js";

export const auth = () => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const { user, payload } = await decodeToken(
      authorization,
      tokenTypes.access,
      next
    );
    req.user = user;
    req.payload = payload;
    return next();
  };
};
