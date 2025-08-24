import Joi from "joi";
import { isValidObjectId } from "mongoose";
import { Gender } from "../../DB/models/user.model.js";
import { fileTypes } from "../../utils/multer/multer.local.js";

export const userProfileSchema = {
  params: Joi.object({
    id: Joi.string()
      .custom((value, helpers) => {
        if (!isValidObjectId(value)) {
          return helpers.message("ID is not correct");
        }
      })
      .required(),
  }).required(),
};

export const updateUserSchema = {
  body: Joi.object({
    name: Joi.string().min(4).max(50).required(),
    age: Joi.number().min(18),
    gender: Joi.string().valid(Gender.male, Gender.female),
    phone: Joi.custom((value, helpers) => {
      const prefixPhone = value[0] + value[1] + value[2];
      if (prefixPhone != "010" && prefixPhone != "011")
        return helpers.message("Enter correct phone");
    }),
  }).required(),
};

export const softDeleteSchema = {
  params: Joi.object({
    id: Joi.custom((value, helpers) => {
      if (isValidObjectId(value)) {
        return value;
      }
    }),
  }).required(),
};

export const uploadImageSchema = {
  file: Joi.object({
    fieldname: Joi.string().valid("image").required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid(...fileTypes.image, ...fileTypes.video)
      .required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().max(1024 * 1024 * 1024),
  }).required(),
};

export const uploadImagesSchema = {
  files: Joi.object({
    fieldname: Joi.string().valid("images").required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid(...fileTypes.image, ...fileTypes.video)
      .required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().max(1024 * 1024 * 1024 * 3),
  }).required(),
};
