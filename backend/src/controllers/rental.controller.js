import Rental from '../models/Rental.model.js';
import Car from '../models/Car.model.js';

// @desc    Create new rental request
// @route   POST /api/rentals
// @access  Private
export const createRental = async (req, res) => {
    try {
        const { carId, startDate, endDate, proposedPrice } = req.body;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Check if car is available for the requested dates
        const existingRental = await Rental.findOne({
            car: carId,
            status: { $in: ['pending', 'accepted'] },
            $or: [
                { 
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                }
            ]
        });

        if (existingRental) {
            return res.status(400).json({ message: 'Car is not available for these dates' });
        }

        const rental = await Rental.create({
            car: carId,
            renter: req.user._id,
            owner: car.owner,
            startDate,
            endDate,
            proposedPrice
        });

        res.status(201).json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's rentals
// @route   GET /api/rentals
// @access  Private
export const getRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({
            $or: [{ renter: req.user._id }, { owner: req.user._id }]
        })
        .populate('car', 'brand model year')
        .populate('renter', 'name email')
        .populate('owner', 'name email');

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
            .populate('car', 'brand model year')
            .populate('renter', 'name email')
            .populate('owner', 'name email');

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Check if user is involved in the rental
        if (rental.renter.toString() !== req.user._id.toString() && 
            rental.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
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
        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Check if user is the owner
        if (rental.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        rental.status = status;
        const updatedRental = await rental.save();

        res.json(updatedRental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit rental review
// @route   POST /api/rentals/:id/review
// @access  Private
export const submitReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Check if user is the renter
        if (rental.renter.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        rental.review = {
            rating,
            comment
        };

        const updatedRental = await rental.save();
        res.json(updatedRental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 