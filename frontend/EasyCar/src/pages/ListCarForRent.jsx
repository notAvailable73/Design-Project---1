import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaPlusCircle, FaCarSide } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Bangladesh district data
const districtData = {
  "Dhaka": ["Dhanmondi", "Mirpur", "Gulshan", "Mohammadpur", "Uttara", "Banani"],
  "Chattogram": ["Agrabad", "Nasirabad", "Chawkbazar", "Patenga", "Khulshi"],
  "Khulna": ["Khalishpur", "Sonadanga", "Daulatpur", "Boyra", "Gollamari"],
  "Sylhet": ["Ambarkhana", "Bondor Bazar", "Zindabazar", "Shahjalal Upashahar", "Tilagor"],
  "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Shaheb Bazar", "Upashahar"],
  "Barishal": ["Barishal Sadar", "Gournadi", "Agailjhara", "Babuganj", "Bakerganj"],
  "Rangpur": ["Rangpur Sadar", "Mithapukur", "Badarganj", "Gangachara", "Kaunia"],
  "Mymensingh": ["Mymensingh Sadar", "Trishal", "Bhaluka", "Muktagachha", "Fulbaria"]
};

// Custom styles for DatePicker
const datePickerCustomStyles = `
  .react-datepicker {
    font-family: 'Arial', sans-serif;
    border-radius: 0.5rem;
    background-color: #1f2937;
    border: 1px solid #4b5563;
    color: white;
  }
  .react-datepicker__header {
    background-color: #374151;
    border-bottom: 1px solid #4b5563;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker-time__header {
    color: white;
  }
  .react-datepicker__day {
    color: white;
  }
  .react-datepicker__day:hover {
    background-color: #6366f1;
  }
  .react-datepicker__day--selected {
    background-color: #6366f1;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: #8b5cf6;
  }
  .react-datepicker__navigation-icon::before {
    border-color: white;
  }
  .react-datepicker__day--disabled {
    color: #6b7280;
  }
`;

const ListCarForRent = () => {
  const navigate = useNavigate();
  
  // States
  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCar, setSelectedCar] = useState("");
  const [formData, setFormData] = useState({
    pricePerDay: "",
    radius: "5",
    availableFrom: new Date(),
    availableTo: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default 1 month from now
    district: "",
    subDistrict: "",
    address: ""
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableSubDistricts, setAvailableSubDistricts] = useState([]);

  // Inject custom styles for DatePicker
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = datePickerCustomStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch user's cars on component mount
  useEffect(() => {
    fetchUserCars();
  }, []);

  // Update sub-districts when district changes
  useEffect(() => {
    if (formData.district && districtData[formData.district]) {
      setAvailableSubDistricts(districtData[formData.district]);
      // Reset sub-district when district changes
      setFormData(prev => ({
        ...prev,
        subDistrict: ""
      }));
    } else {
      setAvailableSubDistricts([]);
    }
  }, [formData.district]);

  // Fetch user's cars that are not already listed
  const fetchUserCars = async () => {
    try {
      setLoading(true);
      // Get user cars
      const carsResponse = await axiosInstance.get("/api/cars/user/me");
      
      // Get car listings to filter out already listed cars
      const listingsResponse = await axiosInstance.get("/api/car-listings/owner/listings");
      
      // Extract car IDs that are already listed
      const listedCarIds = listingsResponse.data.map(listing => listing.car._id);
      
      // Filter out cars that are already listed
      const availableCars = carsResponse.data.filter(car => !listedCarIds.includes(car._id));
      
      setUserCars(availableCars);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to fetch your cars");
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Handle car selection
  const handleCarSelect = (carId) => {
    setSelectedCar(carId);
    setShowDropdown(false);
  };

  // Find selected car details
  const selectedCarDetails = userCars.find(car => car._id === selectedCar);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCar) {
      toast.error("Please select a car to list for rent");
      return;
    }
    
    // Validate dates
    if (formData.availableFrom >= formData.availableTo) {
      toast.error("End date must be after start date");
      return;
    }
    
    // Validate location fields
    if (!formData.district || !formData.subDistrict || !formData.address.trim()) {
      toast.error("Please complete all location fields");
      return;
    }
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission with the correct location structure
      const listingData = {
        car: selectedCar,
        pricePerDay: formData.pricePerDay,
        radius: formData.radius,
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        location: {
          district: formData.district,
          subDistrict: formData.subDistrict,
          address: formData.address
        },
        isActive: true
      };
      
      console.log("Submitting listing data:", listingData);
      
      // Submit car listing
      const response = await axiosInstance.post("/api/car-listings", listingData);
      
      toast.success("Your car is now listed for rent!");
      // Navigate to listing details page
      navigate(`/my-listings/${response.data._id}`);
    } catch (error) {
      console.error("Error listing car:", error);
      toast.error(error.response?.data?.message || "Failed to list your car for rent");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">List Your Car for Rent</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {userCars.length === 0 ? (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
              <FaCarSide className="mx-auto text-5xl text-purple-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">You don't have any cars to list</h2>
              <p className="mb-6">Add a car first before you can list it for rent.</p>
              <button 
                onClick={() => navigate("/add-car")}
                className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Add a New Car
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              {/* Car Selection Dropdown */}
              <div className="space-y-2">
                <label className="block font-semibold mb-2">Select Your Car</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full p-3 bg-gray-800 rounded-lg flex justify-between items-center"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {selectedCar ? (
                      <div className="flex items-center space-x-3">
                        {selectedCarDetails?.images?.[0]?.url && (
                          <img 
                            src={selectedCarDetails.images[0].url} 
                            alt={selectedCarDetails.brand} 
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <span>{`${selectedCarDetails.brand} ${selectedCarDetails.model} (${selectedCarDetails.year})`}</span>
                      </div>
                    ) : (
                      "Select a car"
                    )}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-gray-900 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {userCars.map((car) => (
                        <div
                          key={car._id}
                          className="p-3 hover:bg-gray-800 cursor-pointer flex items-center space-x-3"
                          onClick={() => handleCarSelect(car._id)}
                        >
                          {car.images?.[0]?.url && (
                            <img 
                              src={car.images[0].url} 
                              alt={car.brand} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span>{`${car.brand} ${car.model} (${car.year})`}</span>
                        </div>
                      ))}
                      <div 
                        className="p-3 hover:bg-purple-700 cursor-pointer flex items-center space-x-3 bg-purple-800 text-white"
                        onClick={() => navigate("/add-car")}
                      >
                        <FaPlusCircle className="text-white" />
                        <span>Add a New Car</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price Per Day */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <FaMoneyBillWave className="w-5 h-5" />
                  <span>Price Per Day (BDT)</span>
                </label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 rounded-lg"
                  required
                  min="1"
                />
              </div>
              
              {/* Radius */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span>Radius (km)</span>
                </label>
                <input
                  type="number"
                  name="radius"
                  value={formData.radius}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 rounded-lg"
                  required
                  min="1"
                  max="100"
                />
                <p className="text-gray-400 text-sm">This is the maximum distance you are willing to travel to deliver the car.</p>
              </div>
              
              {/* Available Dates */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <FaCalendarAlt className="w-5 h-5" />
                  <span>Availability Period</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">From</label>
                    <DatePicker 
                      selected={formData.availableFrom}
                      onChange={(date) => handleDateChange(date, "availableFrom")}
                      minDate={new Date()}
                      className="w-full p-3 bg-gray-800 rounded-lg text-white"
                      required
                      calendarClassName="bg-gray-800 text-white"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">To</label>
                    <DatePicker 
                      selected={formData.availableTo}
                      onChange={(date) => handleDateChange(date, "availableTo")}
                      minDate={formData.availableFrom}
                      className="w-full p-3 bg-gray-800 rounded-lg text-white"
                      required
                      calendarClassName="bg-gray-800 text-white"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span>Car Location</span>
                </label>
                
                {/* District Dropdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">District</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800 rounded-lg"
                      required
                    >
                      <option value="">Select District</option>
                      {Object.keys(districtData).map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sub-District Dropdown (only enabled if district is selected) */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Sub-District</label>
                    <select
                      name="subDistrict"
                      value={formData.subDistrict}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-lg ${
                        formData.district 
                          ? "bg-gray-800 cursor-pointer" 
                          : "bg-gray-700 cursor-not-allowed"
                      }`}
                      disabled={!formData.district}
                      required
                    >
                      <option value="">Select Sub-District</option>
                      {availableSubDistricts.map(subDistrict => (
                        <option key={subDistrict} value={subDistrict}>{subDistrict}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Address - only enabled if district and sub-district are selected */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Full address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg ${
                      formData.district && formData.subDistrict
                        ? "bg-gray-800 cursor-text" 
                        : "bg-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!formData.district || !formData.subDistrict}
                    required
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                  isSubmitting 
                    ? "bg-purple-500 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Listing your car..." : "List Car for Rent"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default ListCarForRent; 