import express from 'express';
import {
    createCar,
    getCars,
    getCarById,
    updateCar,
    deleteCar,
    getUserCars,
    getUserCarsByUserId
} from '../controllers/car.controller.js';
import { protect, isVerified } from '../middlewares/auth.middleware.js';
import { debugUpload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getCars);

// User car routes
router.get('/user/me', protect, getUserCars);
router.get('/user/:userId', getUserCarsByUserId);

// Car CRUD routes
router.get('/:id', getCarById);
router.post('/', protect, isVerified, ...debugUpload.array('images', 5), createCar);
router.put('/:id', protect, isVerified, ...debugUpload.array('images', 5), updateCar);
router.delete('/:id', protect, isVerified, deleteCar);

export default router;  