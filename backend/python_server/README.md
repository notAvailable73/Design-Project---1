# NID Extraction Server

This is a Flask server that extracts data from Bangladeshi National ID cards using computer vision and OCR.

## Prerequisites

- Python 3.8 or higher
- Required Python packages (see requirements.txt)

## Installation

1. Create a virtual environment:

```bash
# Create a virtual environment
python -m venv venv
```
Activate the virtual environment
```bash
# On Windows
venv\Scripts\activate
```
```bash
# On macOS/Linux
source venv/bin/activate
```

2. Install setuptools (required for package installation):

```bash
pip install setuptools
```

3. Install the required Python packages:

```bash
pip install ultralytics
pip install opencv-python
pip install pandas
pip install numpy
pip install easyocr
pip install Pillow 
pip install flask
```
 

## Running the Server

Start the server by running:

```bash
python app.py
```

The server will start on port 5001 by default. You can change the port by setting the `PORT` environment variable.

## API Endpoints
 
Returns the status of the server.

### Extract NID Data

```
POST /extract
```

Parameters:
- `image`: The NID image file (multipart/form-data)
- `save_output`: Whether to save the output image with bounding boxes (optional, default: false)

Returns:
- JSON object containing the extracted data from the NID
 