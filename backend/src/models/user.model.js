import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }, 
    isVerified: {
        type: Boolean,
        default: false
    },
    nidNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    nidImage: {
        type: String
    },
    nidImagePublicId: {
        type: String
    },
    extractedNidData: {
        englishName: String,
        banglaName: String,
        fatherName: String,
        motherName: String,
        birthDate: String
    },
    cars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
 

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);