import express from 'express';
import {
    updateLocation,
    getLocation,
    getNearbyCars
} from '../controllers/location.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.put('/:carId', protect, isVerified, updateLocation);
router.get('/:carId', protect, isVerified, getLocation);
router.get('/nearby', getNearbyCars);

export default router;