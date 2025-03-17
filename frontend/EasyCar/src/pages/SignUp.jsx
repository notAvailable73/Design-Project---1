import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaLock,
  FaCheck,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // For navigation after successful registration
import axiosInstance from "../utils/axiosInstance";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(""); // For displaying error messages
  const [loading, setLoading] = useState(false); // For loading state
  const navigate = useNavigate(); // For navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true); // Start loading
      setError(""); // Clear any previous errors

      // Send POST request to the backend
      const response = await axiosInstance.post("/api/users/register", {
        email: formData.email,
        password: formData.password,
      });

      // Store the email in localStorage or state management
      localStorage.setItem("email", formData.email); // Save email for OTP verification
      toast.success("OTP sent successfully!");
      // Navigate to the Verify OTP page
      navigate("/verify-otp", { state: { email: formData.email } }); // Pass email as state
    } catch (err) {
      // Handle errors
      if (err.response && err.response.data.message) {
        setError(err.response.data.message); // Display backend error message
      } else {
        setError("An error occurred. Please try again."); // Generic error message
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-indigo-950 text-white overflow-hidden">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

        {/* Display error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-500 text-white text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-500 hover:underline">
                Login
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Sign Up
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
