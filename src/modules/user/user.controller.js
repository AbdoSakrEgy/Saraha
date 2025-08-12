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
import { uploadFile } from "../../utils/multer/multer.js";
const router = Router();

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
router.post(
  "/upload-image",
  auth(),
  uploadFile().single("image"),
  userServices.uploadImage
);

export default router;
