import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, "../../.env") });

console.log("Testing Cloudinary Configuration");
console.log("===============================");

// Log environment variables
console.log("Environment Variables:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "***" : "Not set");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary Connection Test:", result.status === "ok" ? "SUCCESS" : "FAILED");
    console.log("Response:", result);
  } catch (error) {
    console.error("Cloudinary Connection Error:", error.message);
    console.error("Error Details:", error);
  }
}

testCloudinaryConnection(); 