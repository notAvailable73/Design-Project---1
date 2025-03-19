import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ selectedPosition }) => {
  const mapRef = useRef(null); // Ref for the map instance
  const markerRef = useRef(null); // Ref for the marker instance

  useEffect(() => {
    // Initialize the map
    const mapInstance = L.map("map").setView([51.505, -0.09], 13); // Default view
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);
    mapRef.current = mapInstance;

    // Cleanup on unmount
    return () => {
      mapInstance.remove(); // Remove the map
    };
  }, []);

  useEffect(() => {
    if (selectedPosition && mapRef.current) {
      const { lat, lon } = selectedPosition;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      // Remove previous marker if it exists
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add a new marker for the selected location
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);

      // Pan to the new location without changing the zoom level
      mapRef.current.panTo([latitude, longitude], { animate: true });
    }
  }, [selectedPosition]);

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
};

export default MapComponent;
