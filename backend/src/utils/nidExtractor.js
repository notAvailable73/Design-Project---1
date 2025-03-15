import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Python script
const pythonScriptPath = path.join(__dirname, '../python/nid_extractor/scripts/read_fields.py');

/**
 * Extract data from NID image
 * @param {string} imagePath - Path to the NID image
 * @param {boolean} saveOutputImage - Whether to save the output image with bounding boxes
 * @returns {Promise<Object>} - Extracted data from NID
 */
export const extractNidData = (imagePath, saveOutputImage = false) => {
  return new Promise((resolve, reject) => {
    // Check if Python script exists
    if (!fs.existsSync(pythonScriptPath)) {
      console.error(`Python script not found at: ${pythonScriptPath}`);
      return resolve({ error: 'Python script not found' });
    }

    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      console.error(`Image not found at: ${imagePath}`);
      return resolve({ error: 'Image not found' });
    }

    // Spawn a Python process
    const pythonProcess = spawn('python', [
      pythonScriptPath,
      imagePath,
      saveOutputImage.toString()
    ]);

    let dataString = '';
    let errorString = '';

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      pythonProcess.kill();
      console.error('Python process timed out');
      resolve({ error: 'Python process timed out' });
    }, 30000); // 30 seconds timeout

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    // Collect error messages
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error(`Python stderr: ${data.toString()}`);
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        
        // Check for common errors
        if (errorString.includes('No module named')) {
          console.error('Missing Python module. Please install required packages.');
          return resolve({ 
            error: 'Missing Python dependencies. Please install required packages using: pip install -r src/python/nid_extractor/requirements.txt' 
          });
        }
        
        return resolve({ error: errorString || 'Unknown Python error' });
      }

      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', error);
        console.error('Python output:', dataString);
        resolve({ error: 'Failed to parse Python output', rawOutput: dataString });
      }
    });
  });
}; 