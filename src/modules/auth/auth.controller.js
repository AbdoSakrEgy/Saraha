import { Router } from "express";
import * as authServices from "./auth.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  changePasswordSchema,
  confirmEmailShcema,
  forgetPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  socialLoginSchema,
  updateEmailConfirmationSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "./auth.validation.js";
const router = Router();

router.post("/register", validation(registerSchema), authServices.register);
router.post("/login", validation(loginSchema), authServices.login);
router.post(
  "/social-login",
  validation(socialLoginSchema),
  authServices.socialLogin
);

router.post("/refresh-token", authServices.refreshToken);

router.post(
  "/confirm-email",
  validation(confirmEmailShcema),
  authServices.confirmEmail
);
router.post(
  "/forget-password",
  validation(forgetPasswordSchema),
  authServices.forgetPassword
);
router.patch(
  "/change-password",
  validation(changePasswordSchema),
  authServices.changePassword
);
router.patch(
  "/update-password",
  auth(),
  validation(updatePasswordSchema),
  authServices.updatePassword
);
router.post(
  "/resend-email-otp",
  validation(resendOtpSchema),
  authServices.resendOtp
);
router.post(
  "/resend-password-otp",
  validation(resendOtpSchema),
  authServices.resendOtp
);
router.patch(
  "/update-email",
  auth(),
  validation(updateEmailSchema),
  authServices.updateEmail
);
router.patch(
  "/update-email-confirmation",
  auth(),
  validation(updateEmailConfirmationSchema),
  authServices.updateEmailConfirmation
);

export default router;
