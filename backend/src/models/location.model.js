import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
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
            required: true
        }
    },
    timestamp: { 
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
locationSchema.index({ location: '2dsphere' });

export default mongoose.model('Location', locationSchema); 