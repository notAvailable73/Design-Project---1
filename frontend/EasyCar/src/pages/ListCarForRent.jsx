import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlusCircle,
  FaCarSide,
  FaExclamationCircle,
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSelector from "../components/LocationSelector";
import { useVerificationCheck } from "../components/VerificationCheck";

// Bangladesh district data
const districtData = {
  Dhaka: ["Dhanmondi", "Mirpur", "Gulshan", "Mohammadpur", "Uttara", "Banani"],
  Chattogram: ["Agrabad", "Nasirabad", "Chawkbazar", "Patenga", "Khulshi"],
  Khulna: ["Khalishpur", "Sonadanga", "Daulatpur", "Boyra", "Gollamari"],
  Sylhet: [
    "Ambarkhana",
    "Bondor Bazar",
    "Zindabazar",
    "Shahjalal Upashahar",
    "Tilagor",
  ],
  Rajshahi: ["Boalia", "Motihar", "Rajpara", "Shaheb Bazar", "Upashahar"],
  Barishal: [
    "Barishal Sadar",
    "Gournadi",
    "Agailjhara",
    "Babuganj",
    "Bakerganj",
  ],
  Rangpur: ["Rangpur Sadar", "Mithapukur", "Badarganj", "Gangachara", "Kaunia"],
  Mymensingh: [
    "Mymensingh Sadar",
    "Trishal",
    "Bhaluka",
    "Muktagachha",
    "Fulbaria",
  ],
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
  const location = useLocation();

  // Keep verification hook for API calls but remove verification modal
  const {
    isVerified,
    loading: verificationLoading,
    requireVerification,
  } = useVerificationCheck();

  // States
  const [userCars, setUserCars] = useState([]);
  const [allUserCars, setAllUserCars] = useState([]); // To store all cars, including listed ones
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCar, setSelectedCar] = useState("");
  const [listedCarIds, setListedCarIds] = useState([]); // Track which cars are already listed
  const [formData, setFormData] = useState({
    pricePerDay: "",
    radius: "5",
    availableFrom: new Date(),
    availableTo: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default 1 month from now
    district: "",
    subDistrict: "",
    address: "",
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // Use the initialCarId from navigation if available
  useEffect(() => {
    if (location.state?.carId) {
      setSelectedCar(location.state.carId);
    }
  }, [location.state]);

  // Fetch cars on component mount
  useEffect(() => {
    fetchUserCars();
  }, []);

  // Add styles to document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = datePickerCustomStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch user's cars including those already listed
  const fetchUserCars = async () => {
    try {
      setLoading(true);
      // Get all user cars
      const carsResponse = await axiosInstance.get("/api/cars/user/me");
      setAllUserCars(carsResponse.data);

      // Get car listings to identify which cars are already listed
      const listingsResponse = await axiosInstance.get(
        "/api/car-listings/owner/listings"
      );

      // Extract car IDs that are already listed
      const listedIds = listingsResponse.data.map((listing) => listing.car._id);
      setListedCarIds(listedIds);

      // Filter out cars that are already listed for the available selection
      const availableCars = carsResponse.data.filter(
        (car) => !listedIds.includes(car._id)
      );
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  // Handle car selection
  const handleCarSelect = (carId) => {
    // Only allow selecting cars that aren't already listed
    if (!listedCarIds.includes(carId)) {
      setSelectedCar(carId);
      setShowDropdown(false);
    }
  };

  // Handle district change
  const handleDistrictChange = (district) => {
    setFormData((prev) => ({
      ...prev,
      district,
      subDistrict: "",
      address: "",
    }));
  };

  // Handle sub-district change
  const handleSubDistrictChange = (subDistrict) => {
    setFormData((prev) => ({
      ...prev,
      subDistrict,
      address: "",
    }));
  };

  // Find selected car details from all cars
  const selectedCarDetails = allUserCars.find((car) => car._id === selectedCar);

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
    if (
      !formData.district ||
      !formData.subDistrict ||
      !formData.address.trim()
    ) {
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
          address: formData.address,
        },
        isActive: true,
      };

      console.log("Submitting listing data:", listingData);

      // Submit car listing
      const response = await axiosInstance.post(
        "/api/car-listings",
        listingData
      );

      toast.success("Your car is now listed for rent!");
      // Navigate to listing details page
      navigate(`/my-listings/${response.data._id}`);
    } catch (error) {
      console.error("Error listing car:", error);
      toast.error(
        error.response?.data?.message || "Failed to list your car for rent"
      );
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">List Your Car for Rent</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : userCars.length === 0 && allUserCars.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FaExclamationCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Cars Available</h2>
            <p className="text-gray-400 mb-6">
              You need to add a car before you can list it for rent.
            </p>
            <button
              onClick={() => navigate("/add-car")}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition-all flex items-center mx-auto"
            >
              <FaPlusCircle className="mr-2" />
              Add a Car
            </button>
          </div>
        ) : userCars.length === 0 && allUserCars.length > 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FaExclamationCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              All Cars Already Listed
            </h2>
            <p className="text-gray-400 mb-6">
              All your cars are already listed for rent.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate("/my-listings")}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                <FaCarSide className="mr-2" />
                View My Listings
              </button>
              <button
                onClick={() => navigate("/add-car")}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                <FaPlusCircle className="mr-2" />
                Add Another Car
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 rounded-lg p-6 space-y-6"
          >
            {/* Car Selection */}
            <div className="space-y-2 relative">
              <label className="flex items-center space-x-2">
                <FaCarSide className="w-5 h-5" />
                <span>Select Car to List</span>
              </label>
              <div
                className="p-3 bg-gray-900 rounded-lg flex justify-between items-center cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {selectedCarDetails ? (
                  <div className="flex items-center space-x-3">
                    {selectedCarDetails.images?.[0]?.url && (
                      <img
                        src={selectedCarDetails.images[0].url}
                        alt={selectedCarDetails.brand}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span>{`${selectedCarDetails.brand} ${selectedCarDetails.model} (${selectedCarDetails.year})`}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Select a car</span>
                )}
                <span className="text-gray-400">▼</span>
              </div>

              {/* Dropdown list */}
              {showDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-gray-900 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Available cars (not listed) */}
                  <div className="p-2 text-xs text-gray-400 uppercase font-semibold">
                    Available Cars
                  </div>
                  {userCars.length > 0 ? (
                    userCars.map((car) => (
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
                    ))
                  ) : (
                    <div className="p-3 text-gray-400 italic">
                      No available cars
                    </div>
                  )}

                  {/* Already listed cars (disabled) */}
                  {listedCarIds.length > 0 && (
                    <>
                      <div className="p-2 text-xs text-gray-400 uppercase font-semibold mt-2 border-t border-gray-700">
                        Already Listed
                      </div>
                      {allUserCars
                        .filter((car) => listedCarIds.includes(car._id))
                        .map((car) => (
                          <div
                            key={car._id}
                            className="p-3 bg-gray-800 opacity-60 flex items-center space-x-3"
                          >
                            {car.images?.[0]?.url && (
                              <img
                                src={car.images[0].url}
                                alt={car.brand}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <span className="line-through">{`${car.brand} ${car.model} (${car.year})`}</span>
                              <span className="text-xs text-red-400 ml-2">
                                Already Listed
                              </span>
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              )}
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
                placeholder="e.g. 5000"
                className="w-full p-3 bg-gray-900 rounded-lg"
                required
              />
            </div>

            {/* Service Radius */}
            <div className="space-y-2">
              <label className="block">Service Radius (km)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  name="radius"
                  value={formData.radius}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none"
                />
                <span className="text-lg font-semibold w-12 text-center">
                  {formData.radius}
                </span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <FaCalendarAlt className="w-5 h-5" />
                <span>Availability Period</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    From
                  </label>
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

              <LocationSelector
                selectedDistrict={formData.district || ""}
                selectedSubDistrict={formData.subDistrict || ""}
                onDistrictChange={handleDistrictChange}
                onSubDistrictChange={handleSubDistrictChange}
              />

              {/* Address (only enabled if district and sub-district are selected) */}
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter specific address"
                  className="w-full p-3 bg-gray-900 rounded-lg"
                  disabled={!formData.district || !formData.subDistrict}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedCar}
              className={`w-full py-3 px-6 rounded-lg ${
                isSubmitting || !selectedCar
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } transition-colors flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaCarSide className="mr-2" />
                  <span>List Car for Rent</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ListCarForRent;
