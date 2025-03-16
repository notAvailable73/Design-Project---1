import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    carListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarListing',
        required: true
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    pickupLocation: {
        properties: {
            district: {
                type: String,
                required: true
            },
            subDistrict: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            }
        }
    },
    returnLocation: {
        properties: {
            district: {
                type: String,
                required: true
            },
            subDistrict: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            }
        }
    },
    review: {
        text: String,
        rating: Number,
        createdAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create index for location search
rentalSchema.index({ 'pickupLocation.properties.district': 1, 'pickupLocation.properties.subDistrict': 1 });
rentalSchema.index({ 'returnLocation.properties.district': 1, 'returnLocation.properties.subDistrict': 1 });

export default mongoose.model('Rental', rentalSchema); 