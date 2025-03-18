import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Log all environment variables for debugging
console.log("Environment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "***" : "Not set");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log Cloudinary configuration
console.log("Cloudinary Configuration:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not set");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set");

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      // Determine folder based on route or file field name
      if (file.fieldname === 'nidImage') {
        return 'car-rental-app/verification';
      }
      return 'car-rental-app/cars';
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "fill" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.originalname.split('.')[0];
      return `${filename}-${uniqueSuffix}`;
    }
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    console.log(`Accepting file: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`Rejecting file: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter
});

// Add debug middleware
const debugUpload = {
  single: (fieldName) => {
    return [
      (req, res, next) => {
        console.log(`Starting upload for field: ${fieldName}`);
        next();
      },
      upload.single(fieldName),
      (req, res, next) => {
        console.log('Upload completed:', req.file ? 'Success' : 'Failed');
        if (req.file) {
          console.log('File details:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            path: req.file.path,
            filename: req.file.filename,
            size: req.file.size
          });
        }
        next();
      }
    ];
  },
  array: (fieldName, maxCount) => {
    return [
      (req, res, next) => {
        console.log(`Starting upload for field: ${fieldName}, max count: ${maxCount}`);
        next();
      },
      upload.array(fieldName, maxCount),
      (req, res, next) => {
        console.log('Upload completed:', req.files ? 'Success' : 'Failed');
        if (req.files && req.files.length > 0) {
          console.log(`Uploaded ${req.files.length} files`);
          req.files.forEach((file, index) => {
            console.log(`File ${index + 1} details:`, {
              fieldname: file.fieldname,
              originalname: file.originalname,
              path: file.path,
              filename: file.filename,
              size: file.size
            });
          });
        }
        next();
      }
    ];
  }
};

export { cloudinary, upload, debugUpload };
