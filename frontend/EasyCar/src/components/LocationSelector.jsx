import React, { useState, useEffect } from "react";
import { bangladeshData, getAllDistricts, getSubDistricts } from "../data/bangladeshData";

const LocationSelector = ({ 
  selectedDistrict, 
  selectedSubDistrict, 
  onDistrictChange, 
  onSubDistrictChange,
  className = ""
}) => {
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  
  // Initialize districts on component mount
  useEffect(() => {
    setDistricts(getAllDistricts());
  }, []);
  
  // Update subdistricts when district changes
  useEffect(() => {
    if (selectedDistrict) {
      setSubDistricts(getSubDistricts(selectedDistrict));
    } else {
      setSubDistricts([]);
    }
  }, [selectedDistrict]);
  
  // Handle district change
  const handleDistrictChange = (e) => {
    const district = e.target.value;
    onDistrictChange(district);
    onSubDistrictChange(""); // Reset subdistrict when district changes
  };
  
  // Handle subdistrict change
  const handleSubDistrictChange = (e) => {
    onSubDistrictChange(e.target.value);
  };
  
  return (
    <div className={`flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 ${className}`}>
      {/* District Dropdown */}
      <div className="flex-1">
        <label htmlFor="district" className="block text-sm font-medium text-gray-300 mb-1">
          District
        </label>
        <select
          id="district"
          value={selectedDistrict || ""}
          onChange={handleDistrictChange}
          className="w-full p-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select District</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
      
      {/* Sub-District Dropdown */}
      <div className="flex-1">
        <label htmlFor="subDistrict" className="block text-sm font-medium text-gray-300 mb-1">
          Sub-District
        </label>
        <select
          id="subDistrict"
          value={selectedSubDistrict || ""}
          onChange={handleSubDistrictChange}
          disabled={!selectedDistrict}
          className="w-full p-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Sub-District</option>
          {subDistricts.map((subDistrict) => (
            <option key={subDistrict} value={subDistrict}>
              {subDistrict}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector; 