import { Router } from "express";
import * as userServices from "./user.service.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowTo } from "../../middlewares/allowTo.middleware.js";
import { Roles } from "../../DB/models/user.model.js";
import { emailConfirmed } from "../../middlewares/emailConfirmed.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import {
  softDeleteSchema,
  updateUserSchema,
  userProfileSchema,
} from "./user.validation.js";
const router = Router();

// ! How can auth() middleware not be used for user-profile API
router.get(
  "/user-profile/:id",
  // auth(),
  validation(userProfileSchema),
  // emailConfirmed,
  // allowTo(Roles.admin),
  userServices.userProfile
);
router.get("/share-profile", auth(), userServices.shareProfile);
router.patch(
  "/update-user",
  auth(),
  validation(updateUserSchema),
  userServices.updateUser
);
router.patch(
  "/soft-delete/:id",
  auth(),
  validation(softDeleteSchema),
  userServices.softDelete
);
router.delete(
  "/hard-delete/:id",
  auth(),
  validation(softDeleteSchema),
  userServices.hardDelete
);
router.get(
  "/restore-account/:id",
  auth(),
  validation(softDeleteSchema),
  userServices.restoreAccount
);

export default router;
