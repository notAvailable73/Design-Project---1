import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    submitVerification
} from '../controllers/user.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/verify', protect, upload.single('nidImage'), submitVerification);

export default router; 