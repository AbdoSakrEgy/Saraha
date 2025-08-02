import Joi from "joi";

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string(),
    age: Joi.number(),
    role: Joi.string(),
    gender: Joi.string(),
    phone: Joi.string(),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(50).required(),
  }),
};

export const confirmEmailShcema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
  }),
};
