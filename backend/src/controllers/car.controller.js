import Car from "../models/Car.model.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Create a new car listing
// @route   POST /api/cars
// @access  Private (Owner only)
export const createCar = async (req, res) => {
  try {
    console.log(req.user._id);
    const carData = {
      ...req.body,
      owner: req.user._id,
    };

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    const car = await Car.create(carData);
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true })
      .populate("owner", "name email")
      .sort("-createdAt");
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
    const car = await Car.findById(req.params.id).populate(
      "owner",
      "name email"
    );

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
// @access  Private (Owner only)
export const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
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
          await cloudinary.uploader.destroy(image.publicId);
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
// @access  Private (Owner only)
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this car" });
    }

    // Delete images from Cloudinary
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await car.remove();
    res.json({ message: "Car removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get owner's cars
// @route   GET /api/cars/owner/:ownerId
// @access  Public
export const getOwnerCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.params.ownerId });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export { getCars, getCarById, createCar, updateCar, deleteCar, getOwnerCars };
