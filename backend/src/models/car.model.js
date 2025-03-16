import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({ 
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
    images: [{
        url: String,
        publicId: String
    }], 
    description: {
        type: String,
        required: true
    },    
}, {
    timestamps: true
});

export default mongoose.model('Car', carSchema);  