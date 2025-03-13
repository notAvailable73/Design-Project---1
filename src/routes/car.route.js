import express from 'express';
import {
    createCar,
    getCars,
    getCarById,
    updateCar,
    deleteCar,
    getOwnerCars
} from '../controllers/car.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getCars);
router.get('/:id', getCarById);
router.get('/owner/:ownerId', getOwnerCars);

// Protected routes (verified users only)
router.post('/', protect, isVerified, upload.array('images', 5), createCar);
router.put('/:id', protect, isVerified, upload.array('images', 5), updateCar);
router.delete('/:id', protect, isVerified, deleteCar);

export default router;  