import { findOne, findOneAndUpdate } from "../../DB/DBservices.js";
import userModel from "../../DB/models/user.model.js";
import { successHandler } from "../../utils/success.handler.js";

export const userProfile = async (req, res, next) => {
  const { id } = req.params;
  const user = await findOne(userModel, { _id: id });
  if (user) {
    successHandler({ res, status: 200, data: user });
  } else {
    successHandler({ res, status: 404, message: "User not found" });
  }
};

export const shareProfile = async (req, res, next) => {
  const user = req.user;
  const profileLink = `${req.protocol}://${req.host}/user/user-profile/${user._id}`;
  successHandler({ res, data: profileLink });
};

export const updateUser = async (req, res, next) => {
  const user = req.user;
  const { name, age, gender, phone } = req.body;
  const updatedUser = await findOneAndUpdate(
    userModel,
    { email: user.email },
    { name, age, gender, phone }
  );
  successHandler({ res, data: updatedUser });
};
