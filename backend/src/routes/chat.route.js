import express from 'express';
import {
    getChats,
    getChatById,
    createChat,
    sendMessage
} from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getChats);
router.get('/:id', protect, getChatById);
router.post('/', protect, createChat);
router.post('/:id/messages', protect, sendMessage);

export default router;  