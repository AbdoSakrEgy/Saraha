import { Router } from "express";
import * as messageService from "./message.service.js";
import { multer_cloudUpload } from "../../utils/multer/multer.cloud.js";
import { fileTypes } from "../../utils/multer/multer.local.js";
import { auth } from "../../middlewares/auth.middleware.js";
const router = Router({ caseSensitive: true, strict: true, mergeParams: true });

router.get("/", messageService.getUserMessages);

router.post(
  "/send-message",
  multer_cloudUpload({ type: fileTypes.image }).array("images", 2),
  messageService.sendMessage
);

export default router;
