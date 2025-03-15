# Car Rental Backend

This is the backend for a car rental application with NID verification.

## Prerequisites

- Node.js 14 or higher
- MongoDB
- Python 3.8 or higher (for NID data extraction)

## Installation

1. Install Node.js dependencies:

```bash
npm install
```

2. Install Python dependencies:

```bash
cd python_server
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/car-rental
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Python Server Configuration
PYTHON_SERVER_URL=http://localhost:5001

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Application

1. Start the Python server:

```bash
npm run start-python
```

2. In a separate terminal, start the Node.js server:

```bash
npm run dev
```

The Node.js server will run on port 5000, and the Python server will run on port 5001.

## API Endpoints

### User Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/verify` - Submit NID for verification

### Car Endpoints

- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get a car by ID
- `GET /api/cars/owner/:ownerId` - Get cars by owner
- `POST /api/cars` - Create a new car
- `PUT /api/cars/:id` - Update a car
- `DELETE /api/cars/:id` - Delete a car

### Rental Endpoints

- `GET /api/rentals` - Get all rentals
- `GET /api/rentals/:id` - Get a rental by ID
- `POST /api/rentals` - Create a new rental
- `PUT /api/rentals/:id` - Update a rental
- `DELETE /api/rentals/:id` - Delete a rental

## NID Verification

The application uses a separate Python server for NID data extraction. When a user submits their NID for verification, the Node.js server sends the image to the Python server, which extracts the data and returns it to the Node.js server.

## Testing with Postman

### Verify NID

1. Register a user:
   - Method: POST
   - URL: `http://localhost:5000/api/users/register`
   - Body (JSON):
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Save the token from the response

2. Submit NID for verification:
   - Method: POST
   - URL: `http://localhost:5000/api/users/verify`
   - Headers:
     - Authorization: `Bearer YOUR_TOKEN_HERE`
   - Body (form-data):
     - Key: `nidNumber`, Value: `123456789` (Text)
     - Key: `nidImage`, Value: [Select an NID image file] (File)
   - Make sure to select "form-data" for the body type 