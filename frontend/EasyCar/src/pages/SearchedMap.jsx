import React, { useState } from "react";
import SearchBox from "../components/SearchBox"; // Import SearchBox from its file
import MapComponent from "../components/MapComponent"; // Import MapComponent from its file

const SearchedMap = () => {
  const [selectedPosition, setSelectedPosition] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "30%", padding: "20px", overflowY: "auto" }}>
        <SearchBox
          selectPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
        />
      </div>
      <div style={{ width: "70%" }}>
        <MapComponent selectedPosition={selectedPosition} />
      </div>
    </div>
  );
};

export default SearchedMap;
