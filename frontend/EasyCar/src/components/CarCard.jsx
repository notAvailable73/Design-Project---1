import React from "react";
import { FaCar, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

const CarCard = ({ car }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 cursor-pointer">
      {/* Car Image */}
      <div className="w-full h-48 overflow-hidden">
        <img
          src={car.images[0]?.url || "https://via.placeholder.com/300"}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Car Details */}
      <div className="p-4">
        {/* Brand and Model */}
        <h3 className="text-xl font-semibold flex items-center mb-2">
          <FaCar className="mr-2" /> {car.brand} {car.model}
        </h3>

        {/* Year */}
        <p className="text-gray-400 flex items-center mb-1">
          <FaCalendarAlt className="mr-2" /> {car.year}
        </p>

        {/* Price Per Day */}
        <p className="text-gray-400 flex items-center">
          <FaMoneyBillWave className="mr-2" /> ${car.pricePerDay} / day
        </p>
      </div>
    </div>
  );
};

export default CarCard;
