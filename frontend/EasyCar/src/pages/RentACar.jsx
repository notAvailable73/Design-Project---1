import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import LocationSelector from "../components/LocationSelector";
import DateRangePicker from "../components/DateRangePicker";
import { FaSearch, FaFilter, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaUser } from "react-icons/fa";

const RentACar = () => {
  const navigate = useNavigate();
  
  // State for filter options
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    district: "",
    subDistrict: "",
    seats: "",
  });
  
  // State for car listings
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch initial car listings (all active listings)
  useEffect(() => {
    fetchCarListings();
  }, []);
  
  // Function to fetch car listings with filters
  const fetchCarListings = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) {
          if (key === 'startDate' || key === 'endDate') {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value);
          }
        }
      });
      
      const response = await axiosInstance.get(`/api/car-listings?${params.toString()}`);
      setCarListings(response.data);
    } catch (error) {
      console.error("Error fetching car listings:", error);
      toast.error("Failed to fetch car listings");
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };
  
  // Handle filter submissions
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFiltering(true);
    fetchCarListings(filters);
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle navigating to car listing details
  const handleViewDetails = (listingId) => {
    navigate(`/car-listings/${listingId}`, { 
      state: { 
        startDate: filters.startDate, 
        endDate: filters.endDate 
      } 
    });
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rent a Car</h1>
          <p className="text-gray-300">Find the perfect car for your next trip</p>
        </div>
        
        {/* Filter Toggle Button (Mobile) */}
        <button
          className="md:hidden w-full mb-4 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>
        
        {/* Filters Section */}
        <div className={`bg-gray-800 rounded-lg p-4 mb-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Picker */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Rental Period
                </h3>
                <DateRangePicker
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onStartDateChange={(date) => handleFilterChange('startDate', date)}
                  onEndDateChange={(date) => handleFilterChange('endDate', date)}
                  minDate={new Date()}
                />
              </div>
              
              {/* Location Selector */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Location
                </h3>
                <LocationSelector
                  selectedDistrict={filters.district || ""}
                  selectedSubDistrict={filters.subDistrict || ""}
                  onDistrictChange={(district) => handleFilterChange('district', district)}
                  onSubDistrictChange={(subDistrict) => handleFilterChange('subDistrict', subDistrict)}
                />
              </div>
              
              {/* Additional Filters */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FaUser className="mr-2" />
                  Passengers
                </h3>
                <div className="mb-4">
                  <label htmlFor="seats" className="block text-sm font-medium text-gray-300 mb-1">
                    Minimum Seats
                  </label>
                  <select
                    id="seats"
                    value={filters.seats}
                    onChange={(e) => handleFilterChange('seats', e.target.value)}
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Any</option>
                    <option value="2">2+ Seats</option>
                    <option value="4">4+ Seats</option>
                    <option value="5">5+ Seats</option>
                    <option value="7">7+ Seats</option>
                  </select>
                </div>
                
                {/* Filter Button */}
                <button
                  type="submit"
                  className="w-full flex justify-center items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors mt-6"
                  disabled={filtering}
                >
                  {filtering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Filtering...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      <span>Search Cars</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Car Listings */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Available Cars</h2>
          
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : carListings.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FaCar className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-2">No cars available</h3>
              <p className="text-gray-400">
                {Object.values(filters).some(val => val) 
                  ? "Try adjusting your filters to see more results" 
                  : "There are no cars available for rent at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carListings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:transform hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleViewDetails(listing._id)}
                >
                  {/* Car Image */}
                  <div className="h-48 overflow-hidden bg-gray-700">
                    {listing.car && listing.car.images && listing.car.images.length > 0 ? (
                      <img
                        src={listing.car.images[0].url}
                        alt={`${listing.car.brand} ${listing.car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <FaCar className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Car Details */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{listing.car?.brand} {listing.car?.model}</h3>
                    
                    <div className="flex justify-between mb-4">
                      <div className="text-sm text-gray-300">{listing.car?.year} • {listing.car?.transmission}</div>
                      <div className="text-sm text-gray-300">{listing.car?.seats} Seats</div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <FaMapMarkerAlt className="text-purple-500 mr-2" />
                      <span className="text-sm text-gray-300">
                        {listing.location?.properties?.district}, {listing.location?.properties?.subDistrict}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <FaCalendarAlt className="text-purple-500 mr-2" />
                      <span className="text-sm text-gray-300">
                        Available: {formatDate(listing.availableFrom)} - {formatDate(listing.availableTo)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-500 mr-2" />
                        <span className="text-xl font-bold">${listing.pricePerDay}</span>
                        <span className="text-gray-400 text-sm ml-1">/ day</span>
                      </div>
                      
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(listing._id);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentACar; 