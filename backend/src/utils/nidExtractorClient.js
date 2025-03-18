import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Python server URL
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:5001';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extract data from NID image using the Python server
 * @param {string} imagePath - Path or URL to the NID image
 * @param {boolean} saveOutput - Whether to save the output image with bounding boxes
 * @returns {Promise<Object>} - Extracted data from NID
 */
export const extractNidData = async (imagePath, saveOutput = false) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Check if the image path is a URL (Cloudinary) or a local file
    if (imagePath.startsWith('http')) {
      // For Cloudinary URLs, we need to download the image first
      console.log('Downloading image from Cloudinary URL:', imagePath);
      
      try {
        const imageResponse = await axios.get(imagePath, { responseType: 'arraybuffer' });
        const tempImagePath = path.join(__dirname, '../../temp', `temp_${Date.now()}.jpg`);
        
        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Save the image to a temporary file
        fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));
        
        // Use the temporary file
        formData.append('image', fs.createReadStream(tempImagePath));
        
        // Clean up function to remove the temporary file after processing
        const cleanup = () => {
          try {
            fs.unlinkSync(tempImagePath);
            console.log('Temporary file deleted:', tempImagePath);
          } catch (err) {
            console.error('Error deleting temporary file:', err);
          }
        };
        
        // Set timeout to clean up the file after 1 minute
        setTimeout(cleanup, 60000);
      } catch (error) {
        console.error('Error downloading image from Cloudinary:', error);
        return { error: 'Failed to download image from Cloudinary' };
      }
    } else {
      // Check if local image exists
      if (!fs.existsSync(imagePath)) {
        console.error(`Image not found at: ${imagePath}`);
        return { error: 'Image not found' };
      }
      
      // Use the local file
      formData.append('image', fs.createReadStream(imagePath));
    }
    
    formData.append('save_output', saveOutput.toString());

    // Send request to Python server
    const response = await axios.post(`${PYTHON_SERVER_URL}/extract`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    console.error('Error communicating with Python server:', error.message);
    
    // Check if the error is due to the Python server being down
    if (error.code === 'ECONNREFUSED') {
      return { 
        error: 'Python server is not running. Please start the Python server using: python python_server/app.py' 
      };
    }
    
    // Handle timeout
    if (error.code === 'ETIMEDOUT') {
      return { error: 'Request to Python server timed out' };
    }
    
    return { error: error.message };
  }
}; 