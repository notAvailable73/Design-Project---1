import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './DatePickerStyles.css'; // Import custom styles

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  minDate = new Date(),
  className = "" 
}) => {
  // Filter dates to ensure endDate cannot be before startDate
  const filterEndDate = (date) => {
    return startDate ? date >= startDate : true;
  };
  
  // Filter dates to ensure startDate cannot be after endDate
  const filterStartDate = (date) => {
    return endDate ? date <= endDate : true;
  };
  
  return (
    <div className={`flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 ${className}`}>
      {/* Start Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Start Date
        </label>
        <DatePicker
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          minDate={minDate}
          filterDate={filterStartDate}
          placeholderText="Select start date"
          className="w-full p-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500"
          dateFormat="dd/MM/yyyy"
        />
      </div>
      
      {/* End Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          End Date
        </label>
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || minDate}
          filterDate={filterEndDate}
          placeholderText="Select end date"
          className="w-full p-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-purple-500 focus:border-purple-500"
          dateFormat="dd/MM/yyyy"
          disabled={!startDate}
        />
      </div>
    </div>
  );
};

export default DateRangePicker; 