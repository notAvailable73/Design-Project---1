const express = require('express');
const router = express.Router();
const {
    updateCarLocation,
    getCarLocationHistory,
    getCurrentCarLocation
} = require('../controllers/location.controller.js');
const { protect, isVerified } = require('../middlewares/auth');

router.post('/:carId', protect, isVerified, updateCarLocation);
router.get('/:carId', protect, isVerified, getCarLocationHistory);
router.get('/:carId/current', protect, isVerified, getCurrentCarLocation);

module.exports = router; 