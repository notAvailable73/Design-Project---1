import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const RentalRequests = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/rentals");
      
      // Filter rentals where the current user is the owner
      const ownerRentals = response.data.filter(rental => 
        rental.owner._id === localStorage.getItem("userId")
      );
      
      setRentals(ownerRentals);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch rental requests");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (rentalId, status) => {
    try {
      setProcessingId(rentalId);
      await axiosInstance.put(`/api/rentals/${rentalId}/status`, { status });
      
      // Update the local state
      setRentals(prevRentals => 
        prevRentals.map(rental => 
          rental._id === rentalId ? { ...rental, status } : rental
        )
      );
      
      toast.success(`Rental request ${status === 'accepted' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} rental request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-2xl mt-10">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Rental Requests
      </h1>

      {rentals.length === 0 ? (
        <div className="text-center text-gray-400 text-xl">
          No rental requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rentals.map((rental) => (
            <div 
              key={rental._id} 
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6"
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-semibold text-white">
                    {rental.car.brand} {rental.car.model} ({rental.car.year})
                  </h2>
                  <p className="text-gray-400">
                    Requested by: {rental.renter.name}
                  </p>
                  <p className="text-gray-400">
                    Dates: {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400">
                    Total Price: ${rental.totalPrice}
                  </p>
                  <p className="text-gray-400">
                    Status: <span className={`font-semibold ${
                      rental.status === 'pending' ? 'text-yellow-500' : 
                      rental.status === 'accepted' ? 'text-green-500' : 
                      rental.status === 'rejected' ? 'text-red-500' : 
                      'text-gray-400'
                    }`}>{rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}</span>
                  </p>
                </div>

                {rental.status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate(rental._id, 'accepted')}
                      disabled={processingId === rental._id}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                    >
                      {processingId === rental._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheck className="mr-2" />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(rental._id, 'rejected')}
                      disabled={processingId === rental._id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                    >
                      {processingId === rental._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimes className="mr-2" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pickup Location</h3>
                  <p className="text-gray-400">District: {rental.pickupLocation.properties.district}</p>
                  <p className="text-gray-400">Sub-District: {rental.pickupLocation.properties.subDistrict}</p>
                  <p className="text-gray-400">Address: {rental.pickupLocation.properties.address}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Return Location</h3>
                  <p className="text-gray-400">District: {rental.returnLocation.properties.district}</p>
                  <p className="text-gray-400">Sub-District: {rental.returnLocation.properties.subDistrict}</p>
                  <p className="text-gray-400">Address: {rental.returnLocation.properties.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalRequests; 