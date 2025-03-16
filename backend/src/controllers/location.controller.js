import Location from '../models/location.model.js';
import { getDistricts, getSubDistricts, isValidDistrict, isValidSubDistrict } from '../utils/locations.js';

// @desc    Update car location
// @route   PUT /api/locations/:carId
// @access  Private
export const updateLocation = async (req, res) => {
    try {
        const { district, subDistrict, address } = req.body;
        const carId = req.params.carId;

        // Validate district and sub-district
        if (!district || !subDistrict || !address) {
            return res.status(400).json({ 
                message: 'Complete location (district, subDistrict, address) is required' 
            });
        }

        if (!isValidDistrict(district)) {
            return res.status(400).json({ message: 'Invalid district' });
        }

        if (!isValidSubDistrict(district, subDistrict)) {
            return res.status(400).json({ message: 'Invalid sub-district for the selected district' });
        }

        const location = await Location.findOneAndUpdate(
            { car: carId },
            {
                properties: {
                    district,
                    subDistrict,
                    address
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

// @desc    Get cars by district and sub-district
// @route   GET /api/locations/search
// @access  Public
export const searchCarsByLocation = async (req, res) => {
    try {
        const { district, subDistrict } = req.query;
        
        if (!district) {
            return res.status(400).json({ message: 'District is required' });
        }
        
        // Validate district
        if (!isValidDistrict(district)) {
            return res.status(400).json({ message: 'Invalid district' });
        }
        
        // Build query
        const query = { 'properties.district': district };
        
        // Add sub-district to query if provided
        if (subDistrict) {
            // Validate sub-district
            if (!isValidSubDistrict(district, subDistrict)) {
                return res.status(400).json({ message: 'Invalid sub-district for the selected district' });
            }
            
            query['properties.subDistrict'] = subDistrict;
        }
        
        const locations = await Location.find(query).populate('car', 'brand model year');
        
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all districts
// @route   GET /api/locations/districts
// @access  Public
export const getAllDistricts = async (req, res) => {
    try {
        const districts = getDistricts();
        res.json(districts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sub-districts for a district
// @route   GET /api/locations/districts/:districtName/sub-districts
// @access  Public
export const getDistrictSubDistricts = async (req, res) => {
    try {
        const { districtName } = req.params;
        
        if (!isValidDistrict(districtName)) {
            return res.status(404).json({ message: 'District not found' });
        }
        
        const subDistricts = getSubDistricts(districtName);
        res.json(subDistricts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 