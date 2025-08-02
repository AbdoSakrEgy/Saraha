import { successHandler } from "../../utils/success.handler.js";

export const getUserProfile = async (req, res, next) => {
  const user = req.user;
  successHandler({ res, status: 200, data: user });
};
