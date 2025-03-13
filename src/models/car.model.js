import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Sedan', 'SUV', 'Sports', 'Luxury', 'Electric']
    },
    transmission: {
        type: String,
        required: true,
        enum: ['Manual', 'Automatic']
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
    },
    seats: {
        type: Number,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    images: [{
        url: String,
        publicId: String
    }],
    features: [{
        type: String
    }],
    description: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            default: [0, 0]
        }
    },
    radius: {
        type: Number,
        required: true,
        default: 50 // Default 50 miles radius
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for geospatial queries
carSchema.index({ location: '2dsphere' });

export default mongoose.model('Car', carSchema); 