import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    submitVerification,
    verifyOTP,
    resendOTP
} from '../controllers/user.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';
import { debugUpload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/verify', protect, ...debugUpload.single('nidImage'), submitVerification);

export default router; 