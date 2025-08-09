import { Router } from "express";
import * as authServices from "./auth.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import {
  changePasswordSchema,
  confirmEmailShcema,
  forgetPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendOtpSchema,
  socialLoginSchema,
} from "./auth.validation.js";
const router = Router();

router.post("/register", validation(registerSchema), authServices.register);
router.post("/login", validation(loginSchema), authServices.login);
router.post(
  "/social-login",
  validation(socialLoginSchema),
  authServices.socialLogin
);

router.post(
  "/refresh-token",
  validation(refreshTokenSchema),
  authServices.refreshToken
);

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
router.post(
  "/change-password",
  validation(changePasswordSchema),
  authServices.changePassword
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

export default router;
