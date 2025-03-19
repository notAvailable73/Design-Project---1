import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  FaArrowLeft,
  FaTrash,
  FaUser,
  FaGasPump,
  FaCog,
  FaUserCircle,
  FaCheck,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaComment
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { format } from "date-fns";
import LocationSelector from "../components/LocationSelector";
import DateRangePicker from "../components/DateRangePicker";
import { useVerificationCheck } from "../components/VerificationCheck";

const CarListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get date range from navigation state if available
  const initialStartDate = location.state?.startDate || null;
  const initialEndDate = location.state?.endDate || null;
  
  // State for car listing data
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // State for booking form
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    pickupLocation: {
      district: "",
      subDistrict: "",
      address: ""
    },
    returnLocation: {
      district: "",
      subDistrict: "",
      address: ""
    },
    message: ""
  });
  
  // State for booking submission
  const [submitting, setSubmitting] = useState(false);
  
  // Add verification check
  const { isVerified, loading: verificationLoading, requireVerification, VerificationModal } = useVerificationCheck();
  
  // State for availability check
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState({
    checked: false,
    available: false,
    message: ""
  });
  
  // Fetch car listing details
  useEffect(() => {
    fetchCarListingDetails();
  }, [id]);
  
  const fetchCarListingDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/car-listings/${id}`);
      setListing(response.data);
      
      // If the listing has location, pre-fill the pickup location
      if (response.data.location?.properties) {
        const { district, subDistrict, address } = response.data.location.properties;
        setBookingFormData(prev => ({
          ...prev,
          pickupLocation: {
            district,
            subDistrict,
            address: address || ""
          },
          returnLocation: {
            district,
            subDistrict,
            address: address || ""
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching car listing details:", error);
      toast.error("Failed to fetch car listing details");
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle listing active status
  const toggleListingStatus = async () => {
    if (!listing) return;
    
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
  
  // Delete car listing
  const deleteListing = async () => {
    try {
      if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
        setDeleting(true);
        await axiosInstance.delete(`/api/car-listings/${id}`);
        toast.success("Listing deleted successfully");
        navigate("/my-listings");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(error.response?.data?.message || "Failed to delete listing");
      setDeleting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle booking form changes
  const handleDateChange = (field, value) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset availability check when dates change
    setAvailability({
      checked: false,
      available: false,
      message: ""
    });
  };
  
  // Handle pickup location changes
  const handlePickupLocationChange = (field, value) => {
    setBookingFormData(prev => ({
      ...prev,
      pickupLocation: {
        ...prev.pickupLocation,
        [field]: value
      }
    }));
  };
  
  // Handle return location changes
  const handleReturnLocationChange = (field, value) => {
    setBookingFormData(prev => ({
      ...prev,
      returnLocation: {
        ...prev.returnLocation,
        [field]: value
      }
    }));
  };
  
  // Handle same as pickup checkbox
  const handleSameAsPickup = (e) => {
    if (e.target.checked) {
      setBookingFormData(prev => ({
        ...prev,
        returnLocation: {
          ...prev.pickupLocation
        }
      }));
    }
  };
  
  // Check car availability for the selected dates
  const checkAvailability = async () => {
    // Validate dates
    if (!bookingFormData.startDate || !bookingFormData.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    setChecking(true);
    try {
      const response = await axiosInstance.post("/api/rentals/check-availability", {
        carListingId: id,
        startDate: bookingFormData.startDate,
        endDate: bookingFormData.endDate
      });
      
      setAvailability({
        checked: true,
        available: response.data.available,
        message: response.data.message || ""
      });
      
      if (response.data.available) {
        toast.success("Car is available for the selected dates!");
      } else {
        toast.error(response.data.message || "Car is not available for the selected dates");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Failed to check availability");
      setAvailability({
        checked: true,
        available: false,
        message: "Failed to check availability"
      });
    } finally {
      setChecking(false);
    }
  };
  
  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is verified
    if (!requireVerification('book this car')) {
      return;
    }
    
    // Validate pickup location
    const { district: pickupDistrict, subDistrict: pickupSubDistrict, address: pickupAddress } = bookingFormData.pickupLocation;
    if (!pickupDistrict || !pickupSubDistrict || !pickupAddress) {
      toast.error("Please provide complete pickup location");
      return;
    }
    
    // Validate return location
    const { district: returnDistrict, subDistrict: returnSubDistrict, address: returnAddress } = bookingFormData.returnLocation;
    if (!returnDistrict || !returnSubDistrict || !returnAddress) {
      toast.error("Please provide complete return location");
      return;
    }
    
    setSubmitting(true);
    try {
      // Create rental request
      const response = await axiosInstance.post("/api/rentals", {
        carListingId: id,
        startDate: bookingFormData.startDate,
        endDate: bookingFormData.endDate,
        pickupLocation: bookingFormData.pickupLocation,
        returnLocation: bookingFormData.returnLocation,
        message: bookingFormData.message
      });
      
      toast.success("Booking request sent successfully!");
      
      // Navigate to chat with the owner
      navigate(`/chats/${response.data.chat}`);
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast.error(error.response?.data?.message || "Failed to submit booking request");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    if (!bookingFormData.startDate || !bookingFormData.endDate || !listing) return 0;
    
    const startDate = new Date(bookingFormData.startDate);
    const endDate = new Date(bookingFormData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    return days * listing.pricePerDay;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-4">
        <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Car Listing Not Found</h2>
          <p className="mb-6">The car listing you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/rent-car")}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Car Listings
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/rent-car")}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Car Listings
        </button>
        
        {/* Car Details */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-8">
          {/* Car Images */}
          <div className="h-64 md:h-96 bg-gray-700 relative">
            {listing && listing.car && listing.car.images && listing.car.images.length > 0 ? (
              <img
                src={listing.car.images[0].url}
                alt={`${listing.car.brand} ${listing.car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaCar className="w-16 h-16 text-gray-500" />
              </div>
            )}
          </div>
          
          {/* Car Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {listing && listing.car ? `${listing.car.brand} ${listing.car.model}` : 'Car Details'}
                </h1>
                <p className="text-gray-300 text-lg">{listing && listing.car ? listing.car.year : ''}</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-500">${listing ? listing.pricePerDay : '0'}</span>
                  <span className="text-gray-400 ml-1">/day</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Available: {listing ? formatDate(listing.availableFrom) : 'N/A'} - {listing ? formatDate(listing.availableTo) : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Car Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center">
                <FaUser className="text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Seats</p>
                  <p className="font-semibold">{listing && listing.car ? listing.car.seats : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaGasPump className="text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Fuel Type</p>
                  <p className="font-semibold">{listing && listing.car ? listing.car.fuelType : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCog className="text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Transmission</p>
                  <p className="font-semibold">{listing && listing.car ? listing.car.transmission : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Car Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">About this car</h2>
              <p className="text-gray-300">{listing && listing.car ? listing.car.description : 'No description available'}</p>
            </div>
            
            {/* Location */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-purple-500" />
                Location
              </h2>
              <p className="text-gray-300 mb-2">
                {listing && listing.location && listing.location.properties ? 
                  `${listing.location.properties.district || 'N/A'}, ${listing.location.properties.subDistrict || 'N/A'}` : 
                  'Location not specified'}
              </p>
              <p className="text-sm text-gray-400">
                Exact address will be provided after booking confirmation
              </p>
            </div>
            
            {/* Owner Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Car Owner</h2>
              <div className="flex items-center">
                <FaUserCircle className="text-purple-500 text-4xl mr-4" />
                <div>
                  <p className="font-semibold">{listing && listing.owner ? listing.owner.name : 'Unknown'}</p>
                  {listing && listing.owner && (
                    <button
                      onClick={() => navigate(`/user/${listing.owner._id}`)}
                      className="text-sm text-purple-400 hover:text-purple-300 mt-1"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <button
                onClick={() => {
                  if (!showBookingForm && !requireVerification('request a booking')) {
                    return;
                  }
                  setShowBookingForm(!showBookingForm);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <FaCalendarAlt className="mr-2" />
                {showBookingForm ? "Hide Booking Form" : "Request to Book"}
              </button>
              
              <button
                onClick={() => {
                  if (requireVerification('contact the owner')) {
                    return;
                  }
                  navigate(`/chats`, { 
                    state: { 
                      userId: listing && listing.owner ? listing.owner._id : null, 
                      carId: listing && listing.car ? listing.car._id : null 
                    } 
                  });
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <FaComment className="mr-2" />
                Contact Owner
              </button>
            </div>
          </div>
        </div>
        
        {/* Booking Form */}
        {showBookingForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Request to Book</h2>
            
            <form onSubmit={handleBookingSubmit}>
              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select Dates</h3>
                <DateRangePicker
                  startDate={bookingFormData.startDate}
                  endDate={bookingFormData.endDate}
                  onStartDateChange={(date) => handleDateChange('startDate', date)}
                  onEndDateChange={(date) => handleDateChange('endDate', date)}
                  minDate={listing ? new Date(listing.availableFrom) : new Date()}
                  maxDate={listing ? new Date(listing.availableTo) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                />
                
                {/* Availability Check Button */}
                <button
                  type="button"
                  onClick={checkAvailability}
                  className="mt-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors flex items-center"
                  disabled={checking || !bookingFormData.startDate || !bookingFormData.endDate}
                >
                  {checking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <FaCalendarAlt className="mr-2" />
                      <span>Check Availability</span>
                    </>
                  )}
                </button>
                
                {/* Availability Result */}
                {availability.checked && (
                  <div className={`mt-4 p-3 rounded ${availability.available ? 'bg-green-800' : 'bg-red-800'}`}>
                    <div className="flex items-center">
                      {availability.available ? (
                        <>
                          <FaCheck className="text-green-400 mr-2" />
                          <span>Car is available for the selected dates!</span>
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-red-400 mr-2" />
                          <span>{availability.message}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price Calculation */}
              {bookingFormData.startDate && bookingFormData.endDate && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Price Summary</h3>
                  <div className="flex justify-between mb-2">
                    <span>${listing ? listing.pricePerDay : 0} x {Math.ceil((new Date(bookingFormData.endDate) - new Date(bookingFormData.startDate)) / (1000 * 60 * 60 * 24))} days</span>
                    <span>${calculateTotalPrice()}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotalPrice()}</span>
                  </div>
                </div>
              )}
              
              {/* Location Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Pickup Location</h3>
                <LocationSelector
                  selectedDistrict={bookingFormData.pickupLocation.district || ""}
                  selectedSubDistrict={bookingFormData.pickupLocation.subDistrict || ""}
                  onDistrictChange={(district) => handlePickupLocationChange('district', district)}
                  onSubDistrictChange={(subDistrict) => handlePickupLocationChange('subDistrict', subDistrict)}
                />
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={bookingFormData.pickupLocation.address}
                    onChange={(e) => handlePickupLocationChange('address', e.target.value)}
                    placeholder="Enter address"
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-semibold">Return Location</h3>
                  <label className="flex items-center ml-4 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={handleSameAsPickup}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">Same as pickup</span>
                  </label>
                </div>
                
                <LocationSelector
                  selectedDistrict={bookingFormData.returnLocation.district || ""}
                  selectedSubDistrict={bookingFormData.returnLocation.subDistrict || ""}
                  onDistrictChange={(district) => handleReturnLocationChange('district', district)}
                  onSubDistrictChange={(subDistrict) => handleReturnLocationChange('subDistrict', subDistrict)}
                />
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={bookingFormData.returnLocation.address}
                    onChange={(e) => handleReturnLocationChange('address', e.target.value)}
                    placeholder="Enter address"
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              
              {/* Message to Owner */}
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2">
                  Message to Owner
                </label>
                <textarea
                  value={bookingFormData.message}
                  onChange={(e) => setBookingFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Introduce yourself and tell the owner why you want to rent their car..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500 min-h-[100px]"
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors font-semibold"
                disabled={submitting || !availability.available}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  "Request to Book"
                )}
              </button>
              
              {!availability.available && !checking && (
                <p className="mt-3 text-center text-sm text-red-400">
                  Please check availability before submitting your booking request
                </p>
              )}
            </form>
          </div>
        )}
      </div>
      {/* Verification Modal */}
      <VerificationModal />
    </div>
  );
};

export default CarListingDetails; 