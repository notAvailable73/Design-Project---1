import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaCamera,
  FaUpload,
} from "react-icons/fa";

export default function UserProfile() {
  // State for user information
  const [userData, setUserData] = useState({
    name: "Upload you NID to Complete User Name",
    email: "",
    address: "Upload you NID to Complete User Address",
    phone: "",
    profilePic: null,
    nid: "Upload you NID to add Nid", // NID fetched from backend
    nidPhoto: null, // NID photo file
  });

  // Fetch NID from backend (example)
  useEffect(() => {
    // Simulate fetching NID from backend
    setTimeout(() => {
      setUserData((prev) => ({ ...prev, nid: "" }));
    }, 1000);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle profile picture upload
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle NID photo upload
  const handleNidPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({ ...prev, nidPhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated User Data:", userData);
    // Add your logic to update user information (e.g., API call)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            {userData.profilePic ? (
              <img
                src={userData.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <label htmlFor="profilePic" className="cursor-pointer">
                <FaCamera className="w-16 h-16 text-gray-400" />
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicUpload}
                />
              </label>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-300">
            {userData.profilePic ? "Change Photo" : "Upload Photo"}
          </p>
        </div>

        {/* User Information Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={userData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none text-gray-500 cursor-not-allowed"
              required
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={userData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Phone Field */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={userData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* NID Field (Fetched from backend) */}
          <div className="relative">
            <input
              type="text"
              name="nid"
              placeholder="NID"
              value={userData.nid}
              readOnly
              className="w-full pl-4 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* NID Photo Upload */}
          <div className="relative">
            <label
              htmlFor="nidPhoto"
              className="cursor-pointer flex items-center justify-center w-full bg-gray-700 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <FaUpload className="mr-2" />
              {userData.nidPhoto ? "Change NID Photo" : "Upload NID Photo"}
            </label>
            <input
              type="file"
              id="nidPhoto"
              accept="image/*"
              className="hidden"
              onChange={handleNidPhotoUpload}
            />
          </div>

          {/* Update Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
          >
            Update Information
          </button>
        </form>
      </div>
    </div>
  );
}
