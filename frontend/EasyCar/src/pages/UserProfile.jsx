import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaCamera,
  FaUpload,
  FaIdCard,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";

export default function UserProfile() {
  // State for user information
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    isVerified: false, 
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nidImage, setNidImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/profile");
      
      setUserData({
        name: response.data.name,
        email: response.data.email,
        isVerified: response.data.isVerified, 
      });
      
      if (response.data.nidImage) {
        setPreviewImage(response.data.nidImage);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile information");
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle NID photo upload
  const handleNidPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNidImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission for NID verification
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (!nidImage) {
      toast.error("Please upload your NID image");
      return;
    } 
    
    setSubmitting(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData(); 
      formData.append("nidImage", nidImage);
      
      // Submit NID for verification
      const response = await axiosInstance.post(
        "/api/users/verify",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        isVerified: response.data.isVerified
      }));
      
      toast.success("NID verification successful!");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error(error.response?.data?.message || "Failed to verify NID. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-4">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* User Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3" />
                    <span className="text-lg">{userData.name}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <span className="text-lg">{userData.email}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <FaIdCard className="text-gray-400 mr-3" />
                    <span className="text-lg">Verification Status:</span>
                    {userData.isVerified ? (
                      <span className="ml-2 flex items-center text-green-500">
                        <FaCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="ml-2 flex items-center text-yellow-500">
                        <FaExclamationCircle className="mr-1" /> Not Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* NID Verification Section */}
            {!userData.isVerified ? (
              <div className="bg-gray-700 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4">NID Verification</h2>
                <p className="text-gray-300 mb-6">
                  NID verification is required to add cars, list cars for rent, or request car rentals. 
                  Upload your NID to verify your account.
                </p>
                
                <form onSubmit={handleVerificationSubmit} className="space-y-6">
                   
                  
                  {/* NID Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      NID Image
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      {previewImage ? (
                        <div>
                          <img 
                            src={previewImage} 
                            alt="NID Preview" 
                            className="max-h-48 mx-auto mb-4 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNidImage(null);
                              setPreviewImage(null);
                            }}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <FaUpload className="text-gray-400 text-3xl mb-2" />
                          <span className="text-gray-400 mb-2">Click to upload NID image</span>
                          <span className="text-xs text-gray-500">(JPEG, PNG format only)</span>
                          <input
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleNidPhotoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !nidImage}
                    className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
                      submitting || !nidImage
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaIdCard className="mr-2" />
                        <span>Verify My NID</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-green-800 bg-opacity-30 p-6 rounded-lg mb-8">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 text-3xl mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold mb-1">NID Verified</h2>
                    <p className="text-gray-300">
                      Your account has been successfully verified. You can now access all features of the platform.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
