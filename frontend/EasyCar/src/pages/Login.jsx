import React, { useState } from "react";
import axios from "axios"; // Import Axios
import { FaEnvelope, FaLock, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // For navigation
import { toast } from "react-toastify"; // For toast notifications
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true); // Start loading
      setError(""); // Clear any previous errors

      // Send POST request to the backend
      const response = await axios.post(
        "http://localhost:8000/api/users/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Handle successful login
      if (response.data) {
        console.log("Login successful:", response.data);

        // Store the token in localStorage (or cookies)
        localStorage.setItem("token", response.data.token);

        // Show success toast
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000, // Close the toast after 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Redirect to the dashboard or home page
        navigate("/");
      }
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
    <div className="min-h-screen flex items-center justify-center  text-white">
      <div className=" p-8 rounded-lg  w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {/* Display error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-500 text-white text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            {/* Forgot Password Link */}
            <a
              href="/forgot-password"
              className="text-sm text-purple-500 hover:underline"
            >
              Forgot Password?
            </a>
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
                Login
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-300">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
