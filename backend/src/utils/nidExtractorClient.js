import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Python server URL
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:5001';

/**
 * Extract data from NID image using the Python server
 * @param {string} imagePath - Path to the NID image
 * @param {boolean} saveOutput - Whether to save the output image with bounding boxes
 * @returns {Promise<Object>} - Extracted data from NID
 */
export const extractNidData = async (imagePath, saveOutput = false) => {
  try {
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      console.error(`Image not found at: ${imagePath}`);
      return { error: 'Image not found' };
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
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
    
    // Handle other errors
    return { 
      error: `Failed to extract NID data: ${error.message}`,
      details: error.response?.data || {}
    };
  }
}; 