import express from "express";
import {
  getChats,
  getChatById,
  createChat,
  sendMessage,
  getChatMessages,
} from "../controllers/chat.controller.js";
import { protect, isVerified } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getChats);
router.get("/:id", protect, getChatById);
router.post("/", protect, isVerified, createChat);
router.get("/:id/messages", protect, getChatMessages);
router.post("/:id/messages", protect, isVerified, sendMessage);

export default router;
