import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaToggleOn,
  FaToggleOff,
  FaClock,
  FaCar,
  FaEdit,
  FaArrowLeft
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { format } from "date-fns";

const CarListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  
  // Fetch listing details on component mount
  useEffect(() => {
    fetchListingDetails();
  }, [id]);
  
  // Fetch listing details
  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/car-listings/${id}`);
      setListing(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listing details:", error);
      toast.error("Failed to fetch listing details");
      setLoading(false);
    }
  };
  
  // Toggle listing active status
  const toggleListingStatus = async () => {
    try {
      setToggling(true);
      await axiosInstance.put(`/api/car-listings/${id}`, {
        isActive: !listing.isActive
      });
      
      // Update local state
      setListing(prev => ({
        ...prev,
        isActive: !prev.isActive
      }));
      
      toast.success(`Listing ${listing.isActive ? 'deactivated' : 'activated'} successfully`);
      setToggling(false);
    } catch (error) {
      console.error("Error toggling listing status:", error);
      toast.error("Failed to update listing status");
      setToggling(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Listing Not Found</h2>
          <button
            onClick={() => navigate("/my-listings")}
            className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate("/my-listings")}
          className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-6"
        >
          <FaArrowLeft />
          <span>Back to My Listings</span>
        </button>
        
        {/* Status Indicator and Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Listing Details</h1>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm ${listing.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
              {listing.isActive ? 'Active' : 'Inactive'}
            </span>
            <button 
              onClick={toggleListingStatus}
              disabled={toggling}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {toggling ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
              ) : listing.isActive ? (
                <>
                  <FaToggleOff className="text-xl" />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <FaToggleOn className="text-xl" />
                  <span>Activate</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Car Details */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <FaCar className="text-2xl text-purple-500" />
              <h2 className="text-2xl font-semibold">{`${listing.car.brand} ${listing.car.model} (${listing.car.year})`}</h2>
            </div>
            
            {/* Car Images */}
            {listing.car.images && listing.car.images.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto py-4">
                {listing.car.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.url} 
                    alt={`${listing.car.brand} ${listing.car.model}`} 
                    className="w-64 h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            
            {/* Car Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Type:</span>
                <span>{listing.car.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Transmission:</span>
                <span>{listing.car.transmission}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Fuel Type:</span>
                <span>{listing.car.fuelType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Seats:</span>
                <span>{listing.car.seats}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Listing Details */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Listing Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="flex items-start space-x-3">
                <FaMoneyBillWave className="w-5 h-5 mt-1 text-purple-500" />
                <div>
                  <h4 className="font-medium">Price per Day</h4>
                  <p className="text-2xl font-semibold">{listing.pricePerDay} BDT</p>
                </div>
              </div>
              
              {/* Radius */}
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 mt-1 text-purple-500" />
                <div>
                  <h4 className="font-medium">Service Radius</h4>
                  <p>{listing.radius} km</p>
                </div>
              </div>
              
              {/* Availability */}
              <div className="flex items-start space-x-3">
                <FaCalendarAlt className="w-5 h-5 mt-1 text-purple-500" />
                <div>
                  <h4 className="font-medium">Availability Period</h4>
                  <p>{formatDate(listing.availableFrom)} - {formatDate(listing.availableTo)}</p>
                </div>
              </div>
              
              {/* Created At */}
              <div className="flex items-start space-x-3">
                <FaClock className="w-5 h-5 mt-1 text-purple-500" />
                <div>
                  <h4 className="font-medium">Listed On</h4>
                  <p>{formatDate(listing.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FaMapMarkerAlt className="w-5 h-5 text-purple-500" />
              <h3 className="text-xl font-semibold">Location</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-400">District</h4>
                <p>{listing.location.properties.district}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-400">Sub-District</h4>
                <p>{listing.location.properties.subDistrict}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-400">Address</h4>
              <p>{listing.location.properties.address}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate(`/edit-listing/${id}`)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            <FaEdit />
            <span>Edit Listing</span>
          </button>
          <button
            onClick={toggleListingStatus}
            disabled={toggling}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              listing.isActive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {toggling ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : listing.isActive ? (
              <>
                <FaToggleOff />
                <span>Deactivate Listing</span>
              </>
            ) : (
              <>
                <FaToggleOn />
                <span>Activate Listing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarListingDetails; 