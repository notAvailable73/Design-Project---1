import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
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
    },
    timestamp: { 
        type: Date,
        default: Date.now
    }
});

// Index for location search
locationSchema.index({ 'properties.district': 1, 'properties.subDistrict': 1 });

export default mongoose.model('Location', locationSchema); 