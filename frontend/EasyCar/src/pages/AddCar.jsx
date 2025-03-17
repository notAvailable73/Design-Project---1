import React, { useState, useEffect } from "react";
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
import { useVerificationCheck } from "../components/VerificationCheck";

export default function AddCar() {
  const navigate = useNavigate();
  const { isVerified, loading: verificationLoading, requireVerification, VerificationModal } = useVerificationCheck();

  // Check verification when component mounts
  useEffect(() => {
    // If verification check is complete and user is not verified, show verification modal
    if (!verificationLoading && !isVerified) {
      requireVerification('add a car');
    }
  }, [isVerified, verificationLoading]);

  // State for form data
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    type: "",
    transmission: "",
    fuelType: "",
    seats: "",
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
  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // First check if user is verified
    if (!requireVerification('add a car')) {
      return;
    }
    
    // Set submitting state to true
    setIsSubmitting(true);

    try {
      // Create a FormData object to send both text data and files
      const formDataToSend = new FormData();
      
      // Add all text fields to FormData
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("model", formData.model);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("transmission", formData.transmission);
      formDataToSend.append("fuelType", formData.fuelType);
      formDataToSend.append("seats", formData.seats);
      formDataToSend.append("description", formData.description);
      
      // Add any location data if present
      if (formData.location && formData.location.coordinates) {
        if (formData.location.coordinates[0] !== 0 || formData.location.coordinates[1] !== 0) {
          formDataToSend.append("location[type]", "Point");
          formDataToSend.append("location[coordinates][0]", formData.location.coordinates[0]);
          formDataToSend.append("location[coordinates][1]", formData.location.coordinates[1]);
        }
      }
      
      formDataToSend.append("radius", formData.radius);
      
      // Add all image files
      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} images`);
        imageFiles.forEach((file, index) => {
          console.log(`Adding image ${index + 1}: ${file.name}`);
          formDataToSend.append("images", file);
        });
      } else {
        console.log("No images to upload");
        toast.warning("Please add at least one image of your car");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Submitting form data to server...");
      
      // Make API request with proper configuration for FormData
      const response = await axiosInstance.post(
        "/api/cars",
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log("Server response:", response.data);
      
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
      navigate("/");
    } catch (err) {
      console.error("Failed to add car:", err);
      
      // More detailed error message
      const errorMessage = err.response?.data?.message || err.message || "Failed to add car. Please try again.";
      console.error("Error details:", errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset submitting state in case of error
      setIsSubmitting(false);
    }
  };

  if (verificationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
          className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
            isSubmitting 
              ? "bg-purple-500 cursor-not-allowed" 
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding your car..." : "Add Car"}
        </button>
      </form>
      
      {/* Verification Modal */}
      <VerificationModal />
    </div>
  );
}
