import Joi from "joi";
import { isValidObjectId } from "mongoose";
import { Gender } from "../../DB/models/user.model.js";

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
  }),
};
