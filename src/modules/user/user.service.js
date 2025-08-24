import {
  findOne,
  findOneAndDelete,
  findOneAndUpdate,
} from "../../DB/DBservices.js";
import userModel, { Roles } from "../../DB/models/user.model.js";
import { cloudConfig } from "../../utils/multer/cloudinary.js";
import { successHandler } from "../../utils/success.handler.js";
import {
  deleteByPrefix,
  deleteFolder,
  destroyManyFiles,
  destroySingleFile,
  uploadSingleFile,
} from "../../utils/multer/cloudinary.services.js";

// userProfile
export const userProfile = async (req, res, next) => {
  const { id } = req.params;
  const user = await findOne(userModel, { _id: id });
  if (user) {
    successHandler({
      res,
      status: 200,
      data: {
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        profileImage: user.profileImage.secure_url,
        coverImages: user.coverImages,
      },
    });
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
      try {
        // delete user files in cloudinary
        await deleteByPrefix({
          storagePathOnCloudinary: `users/${id}/cover`,
        });
        // delete user folders in cloudinary, if folder has files the code will return error
        await deleteFolder({
          storagePathOnCloudinary: `users/${id}`,
        });
      } catch (err) {
        successHandler({
          res,
          message: "Error from cloudinary deleting",
          data: err,
        });
      }
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

// localUpload
export const localUpload = async (req, res, next) => {
  const user = req.user;
  const file = req.file;

  const updatedUser = await findOneAndUpdate(
    userModel,
    { _id: user._id },
    {
      profileImage: file.path,
    }
  );
  successHandler({
    res,
    message: "Image uploaded successfully",
    data: { profileImage },
  });
};

// cloudUpload
export const cloudUpload = async (req, res, next) => {
  const user = req.user;
  const file = req.file;
  // delete old profileImage
  if (user.profileImage?.public_id) {
    await destroySingleFile({ public_id: user.profileImage.public_id });
  }
  const { public_id, secure_url } = await uploadSingleFile({
    fileLocation: file.path,
    storagePathOnCloudinary: `${process.env.APP_NAME}/users/${user._id}/profile`,
  });

  await findOneAndUpdate(
    userModel,
    { _id: user._id },
    {
      profileImage: {
        public_id,
        secure_url,
      },
    }
  );

  successHandler({ res, data: user });
};

// cloudUpload_many
export const cloudUpload_many = async (req, res, next) => {
  const user = req.user;
  const files = req.files;
  const coverImages = [];
  for (const file of files) {
    const { public_id, secure_url } = await uploadSingleFile({
      fileLocation: file.path,
      storagePathOnCloudinary: `users/${user._id}/cover`,
    });
    coverImages.push({ public_id, secure_url });
  }
  const updatedUser = await findOneAndUpdate(
    userModel,
    { _id: user._id },
    {
      coverImages,
    }
  );

  return successHandler({
    res,
    message: "Cover images uploaded successfully",
    data: coverImages,
  });
};

// cloudRemove_many
export const cloudRemove_many = async (req, res, next) => {
  const user = req.user;
  const public_ids = [];
  for (const item of user.coverImages) {
    public_ids.push(item.public_id);
  }
  const results = await destroyManyFiles({ public_ids });

  successHandler({ res, message: "Files removed successfully", data: results });
};
