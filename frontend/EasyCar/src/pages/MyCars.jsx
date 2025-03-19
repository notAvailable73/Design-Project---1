import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaCar, FaEdit, FaTrash, FaTag } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { useVerificationCheck } from "../components/VerificationCheck";

const MyCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track which car is being deleted
  const [listedCarIds, setListedCarIds] = useState([]); // Track which cars are listed for rent
  const { redirectToProfile } = useVerificationCheck();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      // Get user's cars
      const carsResponse = await axiosInstance.get("/api/cars/user/me");
      const userCarsData = carsResponse.data || [];

      // Show message if no cars available
      if (userCarsData.length === 0) {
        toast.info("You don't have any cars yet. Add a car to get started.");
      }

      // Get car listings to identify which cars are already listed
      const listingsResponse = await axiosInstance.get(
        "/api/car-listings/owner/listings"
      );

      // Extract car IDs that are already listed
      const listedIds = (listingsResponse.data || [])
        .filter(listing => listing && listing.car)
        .map((listing) => listing.car._id);
      console.log(listedIds);
      setListedCarIds(listedIds);
      console.log(userCarsData);
      setCars(userCarsData.filter(car => car !== null));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to fetch your cars");
      setLoading(false);
    }
  };

  const deleteCar = async (carId) => {
    if (!carId) {
      toast.error("Invalid car ID");
      return;
    }
    
    try {
      setDeleting(carId);
      await axiosInstance.delete(`/api/cars/${carId}`);

      // Remove car from state
      setCars((prevCars) => prevCars.filter((car) => car && car._id !== carId));
      
      toast.success("Car deleted successfully");
      setDeleting(null);
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete car"
      );
      setDeleting(null);
    }
  };

  const confirmDelete = (carId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this car? This action cannot be undone."
      )
    ) {
      deleteCar(carId);
    }
  };

  // Handle navigation to Add Car page with verification check
  const navigateToAddCar = () => {
    if (redirectToProfile('add a car')) {
      navigate("/add-car");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-indigo-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Cars</h1>
          <button
            onClick={navigateToAddCar}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus />
            <span>Add a Car</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center my-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* No Cars State */}
            {cars.length === 0 ? (
              <div className="text-center p-12 bg-gray-800 rounded-lg">
                <FaCar className="mx-auto text-5xl text-purple-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-4">
                  You don't have any cars yet
                </h2>
                <p className="mb-6">Add your first car to get started.</p>
                <button
                  onClick={navigateToAddCar}
                  className="px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Add Your First Car
                </button>
              </div>
            ) : (
              // Cars Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div
                    key={car._id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative"
                  >
                    {/* Car Image */}
                    {car.images && car.images.length > 0 ? (
                      <div className="h-48">
                        <img
                          src={car.images[0].url}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-700 h-48 flex items-center justify-center">
                        <FaCar className="text-5xl text-gray-500" />
                      </div>
                    )}

                    {/* Listed Badge */}
                    {listedCarIds.includes(car._id) && (
                      <div className="absolute top-0 right-0 m-2 px-3 py-1 bg-green-500 rounded-full text-sm font-semibold flex items-center">
                        <FaTag className="mr-1" />
                        Listed for Rent
                      </div>
                    )}

                    {/* Car Details */}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{`${car.brand} ${car.model} (${car.year})`}</h3>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Type:</span>
                          <span>{car.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Transmission:</span>
                          <span>{car.transmission}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Fuel:</span>
                          <span>{car.fuelType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Seats:</span>
                          <span>{car.seats}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {car.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex justify-between">
                        <button
                          onClick={() => navigate(`/edit-car/${car._id}`)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>

                        {!listedCarIds.includes(car._id) ? (
                          <button
                            onClick={() =>
                              navigate("/list-car", {
                                state: { selectedCar: car._id },
                              })
                            }
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                          >
                            <FaTag />
                            <span>List for Rent</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/my-listings")}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-700 transition-colors"
                          >
                            <FaTag />
                            <span>View Listing</span>
                          </button>
                        )}

                        <button
                          onClick={() => confirmDelete(car._id)}
                          disabled={
                            deleting === car._id ||
                            listedCarIds.includes(car._id)
                          }
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            deleting === car._id
                              ? "bg-gray-600 cursor-not-allowed"
                              : listedCarIds.includes(car._id)
                              ? "bg-gray-700 cursor-not-allowed text-gray-400"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {deleting === car._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <FaTrash />
                          )}
                          <span>
                            {deleting === car._id ? "Deleting..." : "Delete"}
                          </span>
                        </button>
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

export default MyCars;
