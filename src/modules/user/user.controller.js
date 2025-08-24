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
  uploadImageSchema,
  uploadImagesSchema,
  userProfileSchema,
} from "./user.validation.js";
import {
  fileTypes,
  multer_localUpload,
} from "../../utils/multer/multer.local.js";
import { multer_cloudUpload } from "../../utils/multer/multer.cloud.js";
import messageRouter from "../../modules/message/message.controller.js";
const router = Router();

router.use("/user-profile/:id/messages", messageRouter);
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
router.patch(
  "/local-upload",
  auth(),
  multer_localUpload({ type: fileTypes.image }).single("image"),
  validation(uploadImageSchema), //! Useless validation, Because if user add valid or invalid img, however it will not added to DB it will added to server
  userServices.localUpload
);
router.patch(
  "/cloud-upload",
  auth(),
  multer_cloudUpload({ type: fileTypes.image }).single("image"),
  validation(uploadImageSchema),
  userServices.cloudUpload
);
router.patch(
  "/cloud-upload-many",
  auth(),
  multer_cloudUpload({ type: fileTypes.image }).array("images", 3),
  validation(uploadImagesSchema),
  userServices.cloudUpload_many
);
router.patch(
  "/cloud-remove-many",
  auth(),
  multer_cloudUpload({}).array("images", 3),
  userServices.cloudRemove_many
);
export default router;
