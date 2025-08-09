import Joi from "joi";
import { Gender, Roles } from "../../DB/models/user.model.js";

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(4).max(50).required(),
    email: Joi.string().min(4).max(50).email().required(),
    password: Joi.string().min(3).max(50),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    age: Joi.number().min(18),
    role: Joi.string().valid(Roles.user, Roles.admin),
    gender: Joi.string().valid(Gender.male, Gender.female),
    phone: Joi.custom((value, helpers) => {
      const prefixPhone = value[0] + value[1] + value[2];
      if (prefixPhone != "010" && prefixPhone != "011")
        return helpers.message("Enter correct phone");
    }),
  }).required(),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(50).required(),
  }).required(),
};

export const socialLoginSchema = {
  body: Joi.object({
    idToken: Joi.string().required(),
  }).required(),
};

export const refreshTokenSchema = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).required(),
};

export const confirmEmailShcema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
  }).required(),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }).required(),
};

export const changePasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
    newPassword: Joi.string().required(),
  }).required(),
};

export const resendOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }).required(),
};
