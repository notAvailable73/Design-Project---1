import express from 'express';
import {
    createRental,
    getRentals,
    getRentalById,
    updateRentalStatus,
    submitReview
} from '../controllers/rental.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getRentals);
router.get('/:id', protect, getRentalById);
router.post('/', protect, isVerified, createRental);
router.put('/:id/status', protect, isVerified, updateRentalStatus);
router.post('/:id/review', protect, isVerified, submitReview);

export default router;   