import React, { useState } from "react";
import { FaCar, FaCalendarAlt, FaGasPump, FaCogs, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const CarDetailsModal = ({ car, onClose, isOpen }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState({
    district: "",
    subDistrict: "",
    address: ""
  });
  const [returnLocation, setReturnLocation] = useState({
    district: "",
    subDistrict: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (!pickupLocation.district || !pickupLocation.subDistrict || !pickupLocation.address) {
      toast.error("Please provide complete pickup location details");
      return;
    }

    if (!returnLocation.district || !returnLocation.subDistrict || !returnLocation.address) {
      toast.error("Please provide complete return location details");
      return;
    }

    // Calculate the number of days between start and end date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create a rental request
      const response = await axiosInstance.post("/api/rentals", {
        carListingId: car.listingId,
        startDate,
        endDate,
        pickupLocation,
        returnLocation
      });
      
      toast.success("Rental request sent to the owner!");
      onClose();
    } catch (error) {
      console.error("Error submitting rental request:", error);
      toast.error(error.response?.data?.message || "Failed to submit rental request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to handle location input changes
  const handleLocationChange = (type, field, value) => {
    if (type === 'pickup') {
      setPickupLocation(prev => ({ ...prev, [field]: value }));
    } else {
      setReturnLocation(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Car images carousel */}
        <div className="w-full h-64 overflow-hidden">
          <img
            src={car.images[0]?.url || "https://via.placeholder.com/600x400"}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Car details */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            {car.brand} {car.model} ({car.year})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-300">
              <FaCar className="mr-2" />
              <span>Type: {car.type}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <FaCogs className="mr-2" />
              <span>Transmission: {car.transmission}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <FaGasPump className="mr-2" />
              <span>Fuel: {car.fuelType}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <FaUsers className="mr-2" />
              <span>Seats: {car.seats}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <FaMoneyBillWave className="mr-2" />
              <span>Price: ${car.pricePerDay}/day</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{car.description}</p>
          </div>

          {/* Owner info */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Owner</h3>
            <p className="text-gray-300">{car.owner?.name}</p>
          </div>

          {/* Rental form */}
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-semibold text-white mb-4">
              Rent this car
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700 text-white rounded p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700 text-white rounded p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            {/* Pickup Location */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Pickup Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">District</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2"
                    value={pickupLocation.district}
                    onChange={(e) => handleLocationChange('pickup', 'district', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Sub-District</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2"
                    value={pickupLocation.subDistrict}
                    onChange={(e) => handleLocationChange('pickup', 'subDistrict', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2"
                    value={pickupLocation.address}
                    onChange={(e) => handleLocationChange('pickup', 'address', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Return Location */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-2">Return Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">District</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2"
                    value={returnLocation.district}
                    onChange={(e) => handleLocationChange('return', 'district', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Sub-District</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2"
                    value={returnLocation.subDistrict}
                    onChange={(e) => handleLocationChange('return', 'subDistrict', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2"
                    value={returnLocation.address}
                    onChange={(e) => handleLocationChange('return', 'address', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded transition duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending Request..." : "Send Rental Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal; 