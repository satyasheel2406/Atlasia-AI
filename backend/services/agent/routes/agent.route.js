import express from "express";
import { agent } from "../controllers/agent.controller.js";
const router = express.Router();
import multer from "../config/multer.js"

router.post("/chat", multer.single("file") ,agent)

export default router;
