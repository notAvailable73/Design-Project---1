import CarListing from '../models/carListing.model.js';
import Car from '../models/car.model.js';
import User from '../models/user.model.js';
import { isValidDistrict, isValidSubDistrict } from '../utils/locations.js';
import Location from '../models/location.model.js';
import mongoose from 'mongoose';

// @desc    Create a new car listing
// @route   POST /api/car-listings
// @access  Private (Owner only)
export const createCarListing = async (req, res) => {
  try {
    // Check if the car exists and belongs to the user
    const car = await Car.findById(req.body.car);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if the user owns this car
    const user = await User.findById(req.user._id);
    if (!user.cars.includes(car._id)) {
      return res.status(403).json({ message: 'You do not own this car' });
    }
    
    // Validate location data
    const { district, subDistrict, address } = req.body.location || {};
    
    if (!district || !subDistrict || !address) {
      return res.status(400).json({ 
        message: 'Complete location (district, subDistrict, address) is required' 
      });
    }
    
    // Validate district and sub-district
    if (!isValidDistrict(district)) {
      return res.status(400).json({ message: 'Invalid district' });
    }
    
    if (!isValidSubDistrict(district, subDistrict)) {
      return res.status(400).json({ message: 'Invalid sub-district for the selected district' });
    }
    
    // Validate price
    if (!req.body.pricePerDay) {
      return res.status(400).json({ message: 'Price is required' });
    }
    
    // Create a location document first
    const location = new Location({
      car: req.body.car,
      properties: {
        district,
        subDistrict,
        address
      },
      timestamp: new Date()
    });
    
    await location.save();
    
    // Create the car listing with the location reference
    const carListingData = {
      car: req.body.car,
      owner: req.user._id,
      pricePerDay: req.body.pricePerDay,
      availability: req.body.availability,
      location: location._id // Set the location reference
    };
    
    const carListing = await CarListing.create(carListingData);
    
    res.status(201).json(carListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active car listings
// @route   GET /api/car-listings
// @access  Public
export const getCarListings = async (req, res) => {
  try {
    const { district, subDistrict, startDate, endDate } = req.query;
    
    // Base query for active listings
    let query = { isActive: true };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.$and = [
        { availableFrom: { $lte: new Date(endDate) } },
        { availableTo: { $gte: new Date(startDate) } }
      ];
    }
    
    // Add location filter if district is provided
    if (district) {
      // Validate district
      if (!isValidDistrict(district)) {
        return res.status(400).json({ message: 'Invalid district' });
      }
      
      // Join with Location model to filter by district
      query.location = { $in: await Location.find({ 'properties.district': district }).distinct('_id') };
      
      // Add sub-district filter if provided
      if (subDistrict) {
        // Validate sub-district
        if (!isValidSubDistrict(district, subDistrict)) {
          return res.status(400).json({ message: 'Invalid sub-district for the selected district' });
        }
        
        // Update the location query to include subDistrict
        query.location = { 
          $in: await Location.find({ 
            'properties.district': district,
            'properties.subDistrict': subDistrict 
          }).distinct('_id') 
        };
      }
    }
    
    const carListings = await CarListing.find(query)
      .populate('car')
      .populate('owner', 'name email')
      .populate({
        path: 'location',
        model: 'Location'
      })
      .sort('-createdAt');
      
    res.json(carListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get car listing by ID
// @route   GET /api/car-listings/:id
// @access  Public
export const getCarListingById = async (req, res) => {
  try {
    const carListing = await CarListing.findById(req.params.id)
      .populate('car')
      .populate('owner', 'name email')
      .populate({
        path: 'location',
        model: 'Location'
      });
      
    if (!carListing) {
      return res.status(404).json({ message: 'Car listing not found' });
    }
    
    res.json(carListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update car listing
// @route   PUT /api/car-listings/:id
// @access  Private (Owner only)
export const updateCarListing = async (req, res) => {
  try {
    const carListing = await CarListing.findById(req.params.id);
    
    if (!carListing) {
      return res.status(404).json({ message: 'Car listing not found' });
    }
    
    // Check if user is the owner
    if (carListing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }
    
    // If car ID is being changed, verify ownership
    if (req.body.car && req.body.car !== carListing.car.toString()) {
      const user = await User.findById(req.user._id);
      if (!user.cars.includes(req.body.car)) {
        return res.status(403).json({ message: 'You do not own this car' });
      }
    }
    
    // Handle location update if provided
    if (req.body.location && typeof req.body.location === 'object' && !(req.body.location instanceof mongoose.Types.ObjectId)) {
      const { district, subDistrict, address } = req.body.location;
      
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
      
      // Update or create location
      let location;
      if (carListing.location) {
        // Update existing location
        location = await Location.findOneAndUpdate(
          { _id: carListing.location },
          { 
            properties: { district, subDistrict, address },
            timestamp: new Date()
          },
          { new: true }
        );
      } else {
        // Create new location
        location = new Location({
          car: carListing.car,
          properties: { district, subDistrict, address },
          timestamp: new Date()
        });
        await location.save();
      }
      
      // Set the location ID in the update data
      req.body.location = location._id;
    }
    
    // Update the listing
    const updatedListing = await CarListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete car listing
// @route   DELETE /api/car-listings/:id
// @access  Private (Owner only)
export const deleteCarListing = async (req, res) => {
  try {
    const carListing = await CarListing.findById(req.params.id);
    
    if (!carListing) {
      return res.status(404).json({ message: 'Car listing not found' });
    }
    
    // Check if user is the owner
    if (carListing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    
    await carListing.deleteOne();
    
    res.json({ message: 'Car listing removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get owner's car listings
// @route   GET /api/car-listings/owner
// @access  Private
export const getOwnerCarListings = async (req, res) => {
  try {
    const carListings = await CarListing.find({ owner: req.user._id })
      .populate('car')
      .populate({
        path: 'location',
        model: 'Location'
      })
      .sort('-createdAt');
      
    res.json(carListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 