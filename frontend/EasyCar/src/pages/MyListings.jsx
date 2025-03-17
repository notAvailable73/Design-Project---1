import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaPlus, 
  FaToggleOn, 
  FaToggleOff, 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCar,
  FaTrash
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { format } from "date-fns";

const MyListings = () => {
  const navigate = useNavigate();
  
  // States
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeToggles, setActiveToggles] = useState({});
  const [deleting, setDeleting] = useState(null); // Track which listing is being deleted
  
  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);
  
  // Fetch owner's car listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/car-listings/owner/listings");
      setListings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to fetch your listings");
      setLoading(false);
    }
  };
  
  // Toggle listing active status
  const toggleListingStatus = async (listingId, currentStatus) => {
    try {
      // Set the toggle loading state for this listing
      setActiveToggles(prev => ({
        ...prev,
        [listingId]: true
      }));
      
      await axiosInstance.put(`/api/car-listings/${listingId}`, {
        isActive: !currentStatus
      });
      
      // Update listings state
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === listingId 
            ? { ...listing, isActive: !listing.isActive } 
            : listing
        )
      );
      
      toast.success(`Listing ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Error toggling listing status:", error);
      toast.error("Failed to update listing status");
    } finally {
      // Reset toggle loading state
      setActiveToggles(prev => ({
        ...prev,
        [listingId]: false
      }));
    }
  };

  // Delete a car listing
  const deleteListing = async (listingId) => {
    try {
      setDeleting(listingId);
      await axiosInstance.delete(`/api/car-listings/${listingId}`);
      
      // Remove listing from state
      setListings(prevListings => prevListings.filter(listing => listing._id !== listingId));
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(error.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeleting(null);
    }
  };

  // Confirm deletion
  const confirmDelete = (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      deleteListing(listingId);
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Car Listings</h1>
          <button
            onClick={() => navigate("/list-car")}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus />
            <span>List a Car</span>
          </button>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center my-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* No Listings State */}
            {listings.length === 0 ? (
              <div className="text-center p-12 bg-gray-800 rounded-lg">
                <FaCar className="mx-auto text-5xl text-purple-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-4">You don't have any car listings yet</h2>
                <p className="mb-6">Start earning by listing your car for rent.</p>
                <button
                  onClick={() => navigate("/list-car")}
                  className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  List Your First Car
                </button>
              </div>
            ) : (
              // Listings Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                  <div key={listing._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    {/* Car Image */}
                    {listing.car.images && listing.car.images.length > 0 ? (
                      <div className="relative h-48">
                        <img 
                          src={listing.car.images[0].url} 
                          alt={`${listing.car.brand} ${listing.car.model}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 right-0 m-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${listing.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                            {listing.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700 h-48 flex items-center justify-center">
                        <FaCar className="text-5xl text-gray-500" />
                      </div>
                    )}
                    
                    {/* Car Details */}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{`${listing.car.brand} ${listing.car.model} (${listing.car.year})`}</h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <FaMoneyBillWave className="text-purple-500" />
                          <span>{listing.pricePerDay} BDT/day</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-purple-500" />
                          <span>{listing.radius} km radius</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-purple-500" />
                          <span>From: {formatDate(listing.availableFrom)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-purple-500" />
                          <span>To: {formatDate(listing.availableTo)}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/my-listings/${listing._id}`)}
                          className="flex items-center space-x-1 text-purple-400 hover:text-purple-300"
                        >
                          <FaInfoCircle />
                          <span>Details</span>
                        </button>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleListingStatus(listing._id, listing.isActive)}
                            disabled={activeToggles[listing._id]}
                            className="flex items-center space-x-1 text-gray-400 hover:text-gray-300"
                          >
                            {activeToggles[listing._id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                            ) : listing.isActive ? (
                              <>
                                <FaToggleOff />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <FaToggleOn />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => confirmDelete(listing._id)}
                            disabled={deleting === listing._id}
                            className={`flex items-center space-x-1 ${
                              deleting === listing._id
                                ? "text-gray-500 cursor-not-allowed"
                                : "text-red-400 hover:text-red-300"
                            }`}
                          >
                            {deleting === listing._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                            ) : (
                              <FaTrash />
                            )}
                            <span>{deleting === listing._id ? "Deleting..." : "Delete"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings; 