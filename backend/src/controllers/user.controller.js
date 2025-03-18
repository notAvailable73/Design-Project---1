import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import { extractNidData } from "../utils/nidExtractorClient.js";
import { cloudinary } from "../config/cloudinary.js";
import { sendOtpEmail } from "../utils/emailService.js";
import bcrypt from "bcryptjs";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Check if there's an existing OTP for this email
    let otpRecord = await OTP.findOne({ email });

    // Generate a new OTP
    const otp = generateOTP();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store user data and OTP
    if (otpRecord) {
      // Update existing OTP record
      otpRecord.otp = otp;
      otpRecord.isVerified = false;
      otpRecord.userData = { 
        name,
        email,
        password: hashedPassword,
      };
      await otpRecord.save();
    } else {
      // Create new OTP record
      otpRecord = await OTP.create({
        email,
        otp,
        userData: {
          name,
          email,
          password: hashedPassword,
        },
      });
    }

    // Send OTP to user's email
    try {
      await sendOtpEmail(email, otp);

      res.status(200).json({
        message:
          "OTP sent to your email. Please verify to complete registration.",
        email,
      });
    } catch (emailError) {
      // If email sending fails, delete the OTP record and return an error
      await OTP.deleteOne({ _id: otpRecord._id });
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and complete registration (Step 2)
// @route   POST /api/users/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Create the user
    const userData = otpRecord.userData;

    const user = await User.create({
      name: userData.name || "User", // Provide a default name if not available
      email: userData.email,
      password: userData.password,
    });

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Return user data with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/users/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "No registration in progress for this email" });
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Update the OTP record
    otpRecord.otp = otp;
    otpRecord.isVerified = false;
    await otpRecord.save();

    // Send OTP to user's email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "New OTP sent to your email",
      email,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
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
        isVerified: user.isVerified,
      });
    } else {
      res.status(404).json({ message: "User not found" });
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
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
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

    // Check if image was uploaded
    if (!req.file) {
      console.log("No image received");
      return res.status(400).json({ message: "No NID image uploaded" });
    }

    console.log("Image received:", req.file.path);

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old NID image from Cloudinary if it exists
    if (user.nidImagePublicId) {
      try {
        console.log("Deleting old NID image:", user.nidImagePublicId);
        await cloudinary.uploader.destroy(user.nidImagePublicId);
        console.log(`Deleted old NID image ${user.nidImagePublicId} from Cloudinary`);
      } catch (error) {
        console.error(`Error deleting old NID image ${user.nidImagePublicId}:`, error);
      }
    }
 
    user.nidImage = req.file.path; // Cloudinary URL
    user.nidImagePublicId = req.file.filename; // Cloudinary public ID
    user.isVerified = true;

    console.log("Saving user with NID image:", { 
      nidImage: user.nidImage,
      nidImagePublicId: user.nidImagePublicId
    });
    // Try to extract data from NID image if possible
    try {
      const nidData = await extractNidData(req.file.path, true);
      console.log("Extracted NID data:", nidData);
      
      if (!nidData.error) {
        user.nidNumber = req.body.nidNumber;
        // Store additional extracted data
        user.extractedNidData = { 
          englishName: nidData.englishName || "",
          banglaName: nidData.banglaName || "",
          fatherName: nidData.fatherName || "",
          motherName: nidData.motherName || "",
          birthDate: nidData.birthDate || "",
        };

        // Use extracted NID number if available
        if (nidData.numberNID) {
          user.nidNumber = nidData.numberNID;
        }
      } else {
        console.error("Error extracting NID data:", nidData.error);
      }
    } catch (error) {
      console.error("NID extraction error:", error.message);
      // Continue with verification even if extraction fails
    }

    // Save user with or without extracted data
    const updatedUser = await user.save();

    // Return response
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
      nidImage: updatedUser.nidImage,
      nidNumber: updatedUser.nidNumber,
      extractedNidData: updatedUser.extractedNidData || {
        note: "NID data extraction not available. Please install required Python packages.",
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: error.message });
  }
};
