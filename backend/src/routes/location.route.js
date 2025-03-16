import express from 'express';
import {
    updateLocation,
    getLocation,
    searchCarsByLocation,
    getAllDistricts,
    getDistrictSubDistricts
} from '../controllers/location.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/search', searchCarsByLocation);
router.get('/districts', getAllDistricts);
router.get('/districts/:districtName/sub-districts', getDistrictSubDistricts);

// Protected routes
router.get('/:carId', protect, getLocation);
router.put('/:carId', protect, updateLocation);

export default router;