import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import OtpInput from "../components/OtpInput";
import OtpTimer from "../components/OtpTimer";

const SignUp = () => {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "", // New state for OTP
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP has been sent
  const [isResending, setIsResending] = useState(false); // Track if OTP is being resent
  const [otpError, setOtpError] = useState(""); // Track OTP validation errors
  const [isOtpExpired, setIsOtpExpired] = useState(false); // Track if OTP has expired

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle OTP change from OtpInput component
  const handleOtpChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      otp: value,
    }));
    
    // Clear error when user types
    if (otpError) setOtpError("");
  };

  // Handle OTP timer completion
  const handleTimerComplete = () => {
    setIsOtpExpired(true);
    setOtpError("OTP has expired. Please request a new one.");
  };

  // Handle form submission 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send signup request to the correct endpoint
      const response = await axiosInstance.post("/api/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("OTP sent to your email!");
      setIsOtpSent(true); // Set OTP sent state
      setIsOtpExpired(false); // Reset expiration state
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.response?.data?.message || "Failed to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!formData.otp || formData.otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    
    // Don't allow submission if OTP is expired
    if (isOtpExpired) {
      setOtpError("OTP has expired. Please request a new one.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Send OTP verification request
      const response = await axiosInstance.post("/api/users/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      toast.success("Account verified successfully!");
      // Store token in localStorage if returned in response
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      navigate("/login"); // Redirect to login after successful verification
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError(error.response?.data?.message || "Failed to verify OTP");
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axiosInstance.post("/api/users/resend-otp", {
        email: formData.email,
      });
      
      toast.info("New OTP sent to your email");
      // Reset OTP field
      setFormData(prev => ({
        ...prev,
        otp: ""
      }));
      setOtpError("");
      setIsOtpExpired(false);
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sign Up</h1>
      <form onSubmit={isOtpSent ? handleOtpSubmit : handleSubmit} className="max-w-md mx-auto space-y-6">
        {!isOtpSent ? (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg"
              required
            />
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                isSubmitting ? "bg-purple-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-300">We've sent an OTP to {formData.email}</p>
              <p className="text-sm text-gray-400 mt-1">Please enter the 6-digit code</p>
            </div>
            
            {!isOtpExpired && (
              <OtpTimer 
                seconds={120} 
                onTimerComplete={handleTimerComplete} 
              />
            )}
            
            <OtpInput 
              length={6} 
              value={formData.otp} 
              onChange={handleOtpChange} 
            />
            
            {otpError && (
              <p className="text-red-400 text-sm text-center">{otpError}</p>
            )}
            
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                isSubmitting || isOtpExpired ? "bg-purple-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
              disabled={isSubmitting || isOtpExpired}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={handleResendOtp}
                className={`text-sm text-purple-400 hover:text-purple-300 ${
                  isResending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isResending}
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtpError("");
                  setIsOtpExpired(false);
                }}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Go back
              </button>
            </div>
          </>
        )}
        
        <div className="text-center mt-4">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;