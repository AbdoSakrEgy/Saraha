import { Router } from "express";
import * as authServices from "./auth.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import {
  confirmEmailShcema,
  loginSchema,
  registerSchema,
} from "./auth.validation.js";
const router = Router();

router.post("/register", validation(registerSchema), authServices.register);
router.post(
  "/confirm-email",
  validation(confirmEmailShcema),
  authServices.confirmEmail
);
router.post("/login", validation(loginSchema), authServices.login);
router.post("/refresh-token", authServices.refreshToken);
router.post("/forget-password", authServices.forgetPassword);
router.post("/change-password", authServices.changePassword);
router.post("/resend-email-otp", authServices.resendOtp);
router.post("/resend-password-otp", authServices.resendOtp);
router.post("/social-login", authServices.socialLogin);

export default router;
