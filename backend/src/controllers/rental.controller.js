import Rental from '../models/rental.model.js';
import CarListing from '../models/carListing.model.js';
import Car from '../models/car.model.js';
import User from '../models/user.model.js';
import { sendEmail } from '../utils/emailService.js';
import { isValidDistrict, isValidSubDistrict } from '../utils/locations.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';

// Helper function to check if a car is available for the requested dates
const isCarAvailableForDates = async (carListingId, startDate, endDate) => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Find the car listing
    const carListing = await CarListing.findById(carListingId);
    
    if (!carListing) {
        return { available: false, message: 'Car listing not found' };
    }
    
    // Check if the car listing is active
    if (!carListing.isActive) {
        return { available: false, message: 'Car listing is not active' };
    }
    
    // Check if the requested dates are within the listing's availability period
    if (startDateObj < carListing.availableFrom || endDateObj > carListing.availableTo) {
        return { 
            available: false, 
            message: 'Requested dates are outside the car availability period' 
        };
    }
    
    // Check if the car is already booked for any part of the requested dates
    const existingRental = await Rental.findOne({
        carListing: carListingId,
        status: { $in: ['pending', 'accepted'] },
        $or: [
            // Existing rental starts during requested period
            { 
                startDate: { $lte: endDateObj },
                endDate: { $gte: startDateObj }
            },
            // Existing rental ends during requested period
            {
                startDate: { $lte: endDateObj },
                endDate: { $gte: startDateObj }
            },
            // Existing rental completely encompasses requested period
            {
                startDate: { $lte: startDateObj },
                endDate: { $gte: endDateObj }
            }
        ]
    });
    
    if (existingRental) {
        return { available: false, message: 'Car is already booked for the requested dates' };
    }
    
    return { available: true };
};

// @desc    Create a new rental
// @route   POST /api/rentals
// @access  Private
export const createRental = async (req, res) => {
    try {
        const { 
            carListingId, 
            startDate, 
            endDate, 
            pickupLocation, 
            returnLocation,
            message 
        } = req.body;
        
        // Validate pickup location data
        if (!pickupLocation || !pickupLocation.district || !pickupLocation.subDistrict || !pickupLocation.address) {
            return res.status(400).json({ message: 'Complete pickup location (district, subDistrict, address) is required' });
        }
        
        // Validate return location data
        if (!returnLocation || !returnLocation.district || !returnLocation.subDistrict || !returnLocation.address) {
            return res.status(400).json({ message: 'Complete return location (district, subDistrict, address) is required' });
        }
        
        // Validate district and sub-district for pickup location
        if (!isValidDistrict(pickupLocation.district)) {
            return res.status(400).json({ message: 'Invalid pickup district' });
        }
        
        if (!isValidSubDistrict(pickupLocation.district, pickupLocation.subDistrict)) {
            return res.status(400).json({ message: 'Invalid pickup sub-district for the selected district' });
        }
        
        // Validate district and sub-district for return location
        if (!isValidDistrict(returnLocation.district)) {
            return res.status(400).json({ message: 'Invalid return district' });
        }
        
        if (!isValidSubDistrict(returnLocation.district, returnLocation.subDistrict)) {
            return res.status(400).json({ message: 'Invalid return sub-district for the selected district' });
        }
        
        // Find the car listing
        const carListing = await CarListing.findById(carListingId)
            .populate('car')
            .populate('owner');
            
        if (!carListing) {
            return res.status(404).json({ message: 'Car listing not found' });
        }
        
        // Check if the car is available for the requested dates
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        if (startDateObj >= endDateObj) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }
        
        const availabilityCheck = await isCarAvailableForDates(carListingId, startDateObj, endDateObj);
        if (!availabilityCheck.available) {
            return res.status(400).json({ message: availabilityCheck.message });
        }
        
        // Calculate total price
        const days = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
        const totalPrice = days * parseInt(carListing.pricePerDay);
        
        // Create the rental
        const rental = new Rental({
            carListing: carListingId,
            car: carListing.car._id,
            renter: req.user._id,
            owner: carListing.owner._id,
            startDate: startDateObj,
            endDate: endDateObj,
            totalPrice,
            pickupLocation: {
                properties: {
                    district: pickupLocation.district,
                    subDistrict: pickupLocation.subDistrict,
                    address: pickupLocation.address
                }
            },
            returnLocation: {
                properties: {
                    district: returnLocation.district,
                    subDistrict: returnLocation.subDistrict,
                    address: returnLocation.address
                }
            }
        });
        
        await rental.save();
        
        // Create or find a chat between the renter and owner
        let chat = await Chat.findOne({
            $or: [
                { participants: [req.user._id, carListing.owner._id] },
                { participants: [carListing.owner._id, req.user._id] }
            ]
        });
        
        if (!chat) {
            chat = new Chat({
                participants: [req.user._id, carListing.owner._id],
                messages: [],
                relatedCar: carListing.car._id
            });
            await chat.save();
        } else if (!chat.relatedCar) {
            chat.relatedCar = carListing.car._id;
            await chat.save();
        }
        
        // Create a rental request message
        const rentalRequestMsg = new Message({
            sender: req.user._id,
            chat: chat._id,
            content: message || `I'd like to rent your ${carListing.car.brand} ${carListing.car.model} from ${startDateObj.toLocaleDateString()} to ${endDateObj.toLocaleDateString()}.`,
            rentalRequest: rental._id
        });
        
        await rentalRequestMsg.save();
        
        // Update chat with new message
        chat.messages.push(rentalRequestMsg._id);
        chat.lastMessage = rentalRequestMsg._id;
        chat.updatedAt = new Date();
        await chat.save();
        
        res.status(201).json({
            rental,
            chat: chat._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check car availability for dates
// @route   POST /api/rentals/check-availability
// @access  Private
export const checkAvailability = async (req, res) => {
    try {
        const { carListingId, startDate, endDate } = req.body;
        
        if (!carListingId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Car listing ID, start date, and end date are required' });
        }
        
        const availability = await isCarAvailableForDates(carListingId, startDate, endDate);
        
        res.json(availability);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all rentals for the current user (as renter or owner)
// @route   GET /api/rentals
// @access  Private
export const getRentals = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find rentals where user is either the renter or owner
        const rentals = await Rental.find({
            $or: [
                { renter: userId },
                { owner: userId }
            ]
        })
            .populate('car')
            .populate('carListing')
            .populate('renter', 'name email')
            .populate('owner', 'name email')
            .sort('-createdAt');
            
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get rental by ID
// @route   GET /api/rentals/:id
// @access  Private
export const getRentalById = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate('car')
            .populate('carListing')
            .populate('renter', 'name email')
            .populate('owner', 'name email');
            
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        
        // Check if user is either the renter or owner
        if (
            rental.renter._id.toString() !== req.user._id.toString() &&
            rental.owner._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized to view this rental' });
        }
        
        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update rental status
// @route   PUT /api/rentals/:id/status
// @access  Private
export const updateRentalStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const rental = await Rental.findById(req.params.id)
            .populate('car')
            .populate('carListing')
            .populate('renter', 'name email')
            .populate('owner', 'name email');
            
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        
        // Check permissions based on the requested status change
        if (status === 'accepted' || status === 'rejected') {
            // Only the owner can accept or reject
            if (rental.owner._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only the owner can accept or reject rentals' });
            }
        } else if (status === 'cancelled') {
            // Only the renter can cancel
            if (rental.renter._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only the renter can cancel rentals' });
            }
            
            // Can only cancel if status is pending or accepted
            if (!['pending', 'accepted'].includes(rental.status)) {
                return res.status(400).json({ message: 'Cannot cancel a rental that is not pending or accepted' });
            }
        } else if (status === 'completed') {
            // Only the owner can mark as completed
            if (rental.owner._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Only the owner can mark rentals as completed' });
            }
            
            // Can only complete if status is accepted
            if (rental.status !== 'accepted') {
                return res.status(400).json({ message: 'Cannot complete a rental that is not accepted' });
            }
        }
        
        // Update the status
        rental.status = status;
        await rental.save();
        
        // Send email notification
        let emailSubject, emailText;
        
        if (status === 'accepted') {
            emailSubject = 'Rental Request Accepted';
            emailText = `Your rental request for ${rental.car.brand} ${rental.car.model} has been accepted.`;
            await sendEmail({
                to: rental.renter.email,
                subject: emailSubject,
                text: emailText
            });
        } else if (status === 'rejected') {
            emailSubject = 'Rental Request Rejected';
            emailText = `Your rental request for ${rental.car.brand} ${rental.car.model} has been rejected.`;
            await sendEmail({
                to: rental.renter.email,
                subject: emailSubject,
                text: emailText
            });
        } else if (status === 'cancelled') {
            emailSubject = 'Rental Cancelled';
            emailText = `The rental for ${rental.car.brand} ${rental.car.model} has been cancelled by the renter.`;
            await sendEmail({
                to: rental.owner.email,
                subject: emailSubject,
                text: emailText
            });
        } else if (status === 'completed') {
            emailSubject = 'Rental Completed';
            emailText = `Your rental of ${rental.car.brand} ${rental.car.model} has been marked as completed.`;
            await sendEmail({
                to: rental.renter.email,
                subject: emailSubject,
                text: emailText
            });
        }
        
        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a review for a rental
// @route   POST /api/rentals/:id/review
// @access  Private
export const submitReview = async (req, res) => {
    try {
        const { text, rating } = req.body;
        
        if (!text || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide text and a rating between 1 and 5' });
        }
        
        const rental = await Rental.findById(req.params.id);
        
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }
        
        // Only the renter can submit a review
        if (rental.renter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the renter can submit a review' });
        }
        
        // Can only review completed rentals
        if (rental.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed rentals' });
        }
        
        // Check if a review already exists
        if (rental.review && rental.review.text) {
            return res.status(400).json({ message: 'Review already submitted' });
        }
        
        // Add the review
        rental.review = {
            text,
            rating,
            createdAt: Date.now()
        };
        
        await rental.save();
        
        // Update the car's rating
        const car = await Car.findById(rental.car);
        
        if (car) {
            // Calculate new average rating
            const totalRating = car.rating * car.totalReviews + rating;
            car.totalReviews += 1;
            car.rating = totalRating / car.totalReviews;
            
            await car.save();
        }
        
        res.json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 