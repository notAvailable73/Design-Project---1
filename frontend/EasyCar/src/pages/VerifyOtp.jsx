import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { FaKey, FaCheck, FaArrowLeft } from "react-icons/fa"; // Icons for OTP and back button

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Retrieve the email passed from the SignUp page
  const location = useLocation();
  const email = location.state?.email;

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Send POST request to verify OTP
      const response = await axiosInstance.post("/api/users/verify-otp", {
        email, // Use the email retrieved from state
        otp,
      });

      if (response.data) {
        console.log("OTP verification successful:", response.data);
        toast.success("User Created successfully!");
        navigate("/login"); // Redirect to login after successful verification
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      // Send POST request to resend OTP
      const response = await axiosInstance.post("/api/users/resend-otp", {
        email,
      });

      if (response.data) {
        console.log("OTP resent successfully:", response.data);
        toast.success("OTP resent successfully!");
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="text-white hover:text-gray-800 transition-all duration-300"
        >
          <FaArrowLeft className="inline-block mr-2" />
          Back
        </button>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Verify OTP
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Verify OTP
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Link */}
        <div className="mt-4 text-center">
          <button
            onClick={handleResendOtp}
            className="text-purple-600 hover:text-purple-800 hover:underline transition-all duration-300"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
