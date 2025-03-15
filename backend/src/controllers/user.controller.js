import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { extractNidData } from '../utils/nidExtractorClient.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ 
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isVerified: updatedUser.isVerified,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit NID for verification
// @route   POST /api/users/verify
// @access  Private
export const submitVerification = async (req, res) => {
    try {
        const { nidNumber } = req.body;
        
        // Check if image was uploaded
        if (!req.file) {
            console.log('No image received');
            return res.status(400).json({ message: 'No NID image uploaded' });
        }
        
        console.log('Image received:', req.file.path);
        
        // Extract data from NID image using Python server
        try {
            const nidData = await extractNidData(req.file.path, true);
            console.log('Extracted NID data:', nidData);
            
            if (nidData.error) {
                console.error('Error extracting NID data:', nidData.error);
            }
            
            const user = await User.findById(req.user._id);

            if (user) {
                // Use extracted NID number if available, otherwise use the one from the form
                user.nidNumber = nidData.numberNID || nidNumber;
                user.nidImage = req.file.path;
                
                // Store additional extracted data
                user.extractedNidData = {
                    englishName: nidData.englishName || '',
                    banglaName: nidData.banglaName || '',
                    fatherName: nidData.fatherName || '',
                    motherName: nidData.motherName || '',
                    birthDate: nidData.birthDate || '', 
                };
                
                // For now, we'll set isVerified to true automatically
                // In production, this would be handled by an admin or automated system
                user.isVerified = true;

                const updatedUser = await user.save();

                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isVerified: updatedUser.isVerified,
                    nidImage: updatedUser.nidImage,
                    extractedNidData: updatedUser.extractedNidData,
                    nidNumber: updatedUser.nidNumber
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('NID extraction error:', error);
            
            // Even if extraction fails, still save the NID image and number
            const user = await User.findById(req.user._id);
            
            if (user) {
                user.nidNumber = nidNumber;
                user.nidImage = req.file.path;
                user.isVerified = true;
                
                const updatedUser = await user.save();
                
                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isVerified: updatedUser.isVerified,
                    nidImage: updatedUser.nidImage,
                    error: 'Failed to extract NID data, but verification completed'
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: error.message });
    }
}; 