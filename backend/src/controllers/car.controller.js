import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private
export const createCar = async (req, res) => {
  console.log("Car creation started");
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    const carData = { ...req.body };

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} uploaded images`);
      carData.images = req.files.map((file) => {
        console.log("Processing file:", file.originalname);
        return {
          url: file.path,
          publicId: file.filename,
        };
      });
      console.log("Processed images:", carData.images);
    } else {
      console.log("No images uploaded");
    }

    // Create the car
    console.log("Creating car with data:", carData);
    const car = await Car.create(carData);
    console.log("Car created:", car._id);
    
    // Add the car to the user's cars array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { cars: car._id } },
      { new: true }
    );
    console.log("Car added to user's cars array");
    
    res.status(201).json(car);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ message: error.message });
  }
}; 

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort("-createdAt");
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get car by ID
// @route   GET /api/cars/:id
// @access  Public
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private
export const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Check if the user owns this car
    const user = await User.findById(req.user._id);
    if (!user.cars.includes(car._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this car" });
    }

    const updateData = { ...req.body };

    // Handle new image uploads if present
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (car.images && car.images.length > 0) {
        for (const image of car.images) {
          if (image.publicId) {
            try {
              await cloudinary.uploader.destroy(image.publicId);
              console.log(`Deleted image ${image.publicId} from Cloudinary`);
            } catch (error) {
              console.error(`Error deleting image ${image.publicId}:`, error);
            }
          }
        }
      }

      // Add new images
      updateData.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Check if the user owns this car
    const user = await User.findById(req.user._id);
    if (!user.cars.includes(car._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this car" });
    }

    // Delete images from Cloudinary
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
            console.log(`Deleted image ${image.publicId} from Cloudinary`);
          } catch (error) {
            console.error(`Error deleting image ${image.publicId}:`, error);
          }
        }
      }
    }

    // Remove the car from the user's cars array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { cars: car._id } },
      { new: true }
    );

    await car.deleteOne();
    res.json({ message: "Car removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's cars
// @route   GET /api/cars/user
// @access  Private
export const getUserCars = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cars');
    res.json(user.cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cars by user ID
// @route   GET /api/cars/user/:userId
// @access  Public
export const getUserCarsByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cars');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export { getCars, getCarById, createCar, updateCar, deleteCar, getUserCars, getUserCarsByUserId };
