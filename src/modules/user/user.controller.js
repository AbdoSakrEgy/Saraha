import { Router } from "express";
import * as userServices from "./user.service.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowTo } from "../../middlewares/allowTo.middleware.js";
import { Roles } from "../../DB/models/user.model.js";
import { emailConfirmed } from "../../middlewares/emailConfirmed.middleware.js";
const router = Router();

router.get(
  "/userProfile",
  auth(),
  emailConfirmed,
  allowTo(Roles.admin),
  userServices.getUserProfile
);

export default router;
