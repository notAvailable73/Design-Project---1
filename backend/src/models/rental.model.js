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

// No indexes defined here - we'll create them manually in the script

// Export the model
const Rental = mongoose.model('Rental', rentalSchema);
export default Rental; 