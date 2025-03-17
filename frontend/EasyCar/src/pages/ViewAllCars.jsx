import React, { useEffect, useState } from "react";
import axios from "axios";
import CardCard from "../components/CarCard";
import axiosInstance from "../utils/axiosInstance";

const ViewAllCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:8000/api/cars"
        );
        setCars(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-white text-2xl mt-10">Loading...</div>
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
    <div className="min-h-screen bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center text-white mb-8">
        Available Cars
      </h1>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cars.map((car) => (
          <CardCard key={car._id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default ViewAllCars;
