import { Router } from "express";
import { allMessages } from "./message.service.js";
const router = Router();

router.get("/", allMessages);

export default router;
