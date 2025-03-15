import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120 // OTP expires after 2 minutes (120 seconds)
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userData: {
        name: String,
        email: String,
        password: String
    }
});

export default mongoose.model('OTP', otpSchema); 