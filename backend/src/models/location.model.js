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

// No indexes defined here - we'll create them manually in the script

// Export the model
const Location = mongoose.model('Location', locationSchema);
export default Location; 