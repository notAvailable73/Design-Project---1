import Location from '../models/Location.model.js';

// @desc    Update car location
// @route   PUT /api/locations/:carId
// @access  Private
export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const carId = req.params.carId;

        const location = await Location.findOneAndUpdate(
            { car: carId },
            {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                timestamp: new Date()
            },
            { new: true, upsert: true }
        );

        res.json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get car location
// @route   GET /api/locations/:carId
// @access  Private
export const getLocation = async (req, res) => {
    try {
        const location = await Location.findOne({ car: req.params.carId });

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get nearby cars
// @route   GET /api/locations/nearby
// @access  Public
export const getNearbyCars = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

        const locations = await Location.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).populate('car', 'brand model year');

        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 