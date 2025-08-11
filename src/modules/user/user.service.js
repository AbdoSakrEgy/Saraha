import {
  findOne,
  findOneAndDelete,
  findOneAndUpdate,
} from "../../DB/DBservices.js";
import userModel, { Roles } from "../../DB/models/user.model.js";
import { successHandler } from "../../utils/success.handler.js";

// userProfile
export const userProfile = async (req, res, next) => {
  const { id } = req.params;
  const user = await findOne(userModel, { _id: id });
  if (user) {
    successHandler({ res, status: 200, data: user });
  } else {
    successHandler({ res, status: 404, message: "User not found" });
  }
};

// shareProfile
export const shareProfile = async (req, res, next) => {
  const user = req.user;
  const profileLink = `${req.protocol}://${req.host}/user/user-profile/${user._id}`;
  successHandler({ res, data: profileLink });
};

// updateUser
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

// softDelete
export const softDelete = async (req, res, next) => {
  const loggedInUser = req.user;
  const { id } = req.params;
  const targetUser = await findOne(userModel, { _id: id });
  if (targetUser) {
    if (targetUser.isActive) {
      if (loggedInUser._id == id || loggedInUser.role == Roles.admin) {
        const targetUser = await findOneAndUpdate(
          userModel,
          { _id: id },
          {
            isActive: false,
            deletedBy: loggedInUser._id,
          }
        );
        successHandler({ res, message: "User soft deleted successfully" });
      } else {
        successHandler({
          res,
          status: 400,
          message: "You are not authorized to delete this user",
        });
      }
    } else {
      successHandler({
        res,
        status: 400,
        message: "This account is already soft deleted",
      });
    }
  } else {
    return successHandler({
      res,
      status: 404,
      message: "User not found to delete",
    });
  }
};

// hardDelete
export const hardDelete = async (req, res, next) => {
  const { id } = req.params;
  const loggedInUser = req.user;
  const targetUser = await findOne(userModel, { _id: id });
  if (targetUser) {
    if (loggedInUser._id == id || loggedInUser.role == Roles.admin) {
      await findOneAndDelete(userModel, { _id: id });
      successHandler({ res, message: "User deleted successfully" });
    } else {
      successHandler({
        res,
        status: 401,
        message: "You are not authorized to delete this account",
      });
    }
  } else {
    successHandler({ res, status: 404, message: "User not found" });
  }
};

// restoreAccount
export const restoreAccount = async (req, res, next) => {
  const { id } = req.params;
  const loggedInUser = req.user;
  let deletedUser = await findOne(userModel, { _id: id });
  if (deletedUser) {
    if (!deletedUser.isActive) {
      if (
        loggedInUser._id == deletedUser._id ||
        loggedInUser.role == Roles.admin
      ) {
        deletedUser = await findOneAndUpdate(
          userModel,
          { _id: id },
          { isActive: true }
        );
        successHandler({
          res,
          message: "The account has been restored successfully",
        });
      } else {
        successHandler({
          res,
          status: 404,
          message: "You are not authorized to restore this account",
        });
      }
    } else {
      successHandler({
        res,
        status: 400,
        message: "This account is not deleted",
      });
    }
  } else {
    successHandler({ res, status: 404, message: "User not found" });
  }
};
