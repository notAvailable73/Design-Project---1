import express from 'express';
import {
    createCarListing,
    getCarListings,
    getCarListingById,
    updateCarListing,
    deleteCarListing,
    getOwnerCarListings
} from '../controllers/carListing.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getCarListings);
router.get('/:id', getCarListingById);

// Protected routes (verified users only)
router.post('/', protect, isVerified, createCarListing);
router.put('/:id', protect, isVerified, updateCarListing);
router.delete('/:id', protect, isVerified, deleteCarListing);
router.get('/owner/listings', protect, getOwnerCarListings);

export default router; 