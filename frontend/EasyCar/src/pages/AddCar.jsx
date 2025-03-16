import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaCar,
  FaImage,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCogs,
  FaGasPump,
  FaChair,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

export default function AddCar() {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    type: "",
    transmission: "",
    fuelType: "",
    seats: "",
    pricePerDay: "",
    description: "",
    location: {
      type: "Point",
      coordinates: [0, 0], // Default coordinates
    },
    radius: 50, // Default radius
    images: [], // Array of image URLs
  });

  // State for image upload
  const [imageFiles, setImageFiles] = useState([]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Convert files to URLs for preview
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: imageUrls,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //   Upload images to a cloud service (e.g., Cloudinary) and get URLs
      const uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "EasyCar"); // Replace with your Cloudinary upload preset

          const response = await axiosInstance.post(
            "https://api.cloudinary.com/v1_1/ddl67pps0/image/upload", // Replace with your Cloudinary cloud name
            formData
          );
          return {
            url: response.data.secure_url,
            publicId: response.data.public_id,
          };
        })
      );
      // Add the car to the database
      const response = await axiosInstance.post(
        "http://localhost:8000/api/cars",
        {
          ...formData,
          images: uploadedImages,
        }
      );
      console.log(response);
      // Show success toast
      toast.success("Car added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to the dashboard or home page
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to add car:", err);
      toast.error("Failed to add car. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Add a New Car</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Car Images */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaImage className="w-6 h-6" />
            <span>Car Images</span>
          </label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          />
          <div className="flex space-x-4 overflow-x-auto">
            {formData.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Car ${index + 1}`}
                className="w-32 h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaCar className="w-6 h-6" />
            <span>Brand</span>
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          />
        </div>

        {/* Model */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaCar className="w-6 h-6" />
            <span>Model</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaCalendarAlt className="w-6 h-6" />
            <span>Year</span>
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaCar className="w-6 h-6" />
            <span>Type</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          >
            <option value="">Select Type</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Sports">Sports</option>
            <option value="Luxury">Luxury</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaCogs className="w-6 h-6" />
            <span>Transmission</span>
          </label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          >
            <option value="">Select Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaGasPump className="w-6 h-6" />
            <span>Fuel Type</span>
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Seats */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaChair className="w-6 h-6" />
            <span>Seats</span>
          </label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          />
        </div>

        {/* Price Per Day */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaMoneyBillWave className="w-6 h-6" />
            <span>Price Per Day</span>
          </label>
          <input
            type="number"
            name="pricePerDay"
            value={formData.pricePerDay}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <FaInfoCircle className="w-6 h-6" />
            <span>Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-lg"
            rows="4"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300"
        >
          Add Car
        </button>
      </form>
    </div>
  );
}
