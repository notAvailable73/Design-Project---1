import express from 'express';
import {
    createRental,
    getRentals,
    getRentalById,
    updateRentalStatus,
    submitReview,
    checkAvailability
} from '../controllers/rental.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getRentals);

router.post('/', protect, isVerified, createRental);
router.post('/check-availability', protect, checkAvailability);

router.get('/:id', protect, getRentalById);
router.put('/:id/status', protect, isVerified, updateRentalStatus);
router.post('/:id/review', protect, isVerified, submitReview);

export default router; 