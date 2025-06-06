import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoChatboxEllipses } from "react-icons/io5";
import {
  FaCar,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaCarSide,
  FaMoneyBillWave,
  FaList,
} from "react-icons/fa";
import { MdCarRental } from "react-icons/md"; // Import icons
import axiosInstance from "../utils/axiosInstance";
import { useVerificationCheck } from "../components/VerificationCheck";

export default function Sidebar() {
  const [userProfile, setUserProfile] = useState(null); // User profile data
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();
  const { redirectToProfile } = useVerificationCheck();

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile data from the backend
      const response = await axiosInstance.get(
        "http://localhost:8000/api/users/profile"
      );
      setUserProfile(response.data.name);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUserProfile(null);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      // Only fetch if user is logged in
      if (localStorage.getItem("token")) {
        const response = await axiosInstance.get("/api/rentals");
        
        // Filter rentals where the current user is the owner and status is pending
        const ownerPendingRentals = response.data.filter(rental => 
          rental.owner._id === localStorage.getItem("userId") && 
          rental.status === 'pending'
        );
        
        setPendingRequests(ownerPendingRentals.length);
      }
    } catch (err) {
      console.error("Failed to fetch pending rental requests:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPendingRequests();
    
    // Set up interval to check for new requests every minute
    const intervalId = setInterval(fetchPendingRequests, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage items including token and userId
    setUserProfile(null);
    navigate("/login"); // Redirect to the login page
  };

  // Handle navigation to protected routes
  const handleVerifiedNavigation = (route, action) => (e) => {
    e.preventDefault(); // Prevent default Link behavior
    if (redirectToProfile(action)) {
      navigate(route);
    }
  };

  return (
    userProfile && (
      <div className="w-64 bg-gray-800 text-white shadow-lg min-h-min">
        <div className="flex flex-col p-4 space-y-4">
          {/* Rent a Car */}
          <Link
            to="/rent-car"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <MdCarRental className="w-6 h-6" />
            <span>Rent a Car</span>
          </Link>
          
          {/* My Cars Section */}
          <div className="pt-2 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2 pl-2">My Cars</h3>
            
            <a
              href="/add-car"
              onClick={handleVerifiedNavigation('/add-car', 'add a car')}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaCar className="w-6 h-6" />
              <span>Add Car</span>
            </a>
            
            <Link
              to="/my-cars"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaCarSide className="w-6 h-6" />
              <span>My Cars</span>
            </Link>
          </div>
          
          {/* Car Listings Section */}
          <div className="pt-2 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2 pl-2">Car Listings</h3>
            
            <a
              href="/list-car"
              onClick={handleVerifiedNavigation('/list-car', 'list a car for rent')}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaMoneyBillWave className="w-6 h-6" />
              <span>List Car for Rent</span>
            </a>
            
            <Link
              to="/my-listings"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaList className="w-6 h-6" />
              <span>My Listings</span>
            </Link>
          </div>
          
          {/* Rentals Section */}
          <div className="pt-2 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2 pl-2">Rentals</h3>
            
            <Link
              to="/my-rentings"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaHistory className="w-6 h-6" />
              <span>My Rentals</span>
            </Link>
            
            <Link
              to="/rental-requests"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <MdCarRental className="w-6 h-6" />
              <span className="flex items-center">
                Rental Requests
                {userProfile && pendingRequests > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {pendingRequests}
                  </span>
                )}
              </span>
            </Link>
          </div>
          
          {/* Communication */}
          <div className="pt-2 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2 pl-2">Communication</h3>
            
            <Link
              to="/chats"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <IoChatboxEllipses className="w-6 h-6" />
              <span>My Chats</span>
            </Link>
          </div>
          
          {/* Account Section */}
          <div className="pt-2 border-t border-gray-700">
            <h3 className="text-sm uppercase text-gray-400 mb-2 pl-2">Account</h3>
            
            <Link
              to="/user-profile"
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <FaUser className="w-6 h-6" />
              <span>My Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-300 w-full text-left"
            >
              <FaSignOutAlt className="w-6 h-6" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    )
  );
}
