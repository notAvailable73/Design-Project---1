import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";

const LocationTracker = () => {
  const mapRef = useRef(null); // Ref for the map instance
  const markerRef = useRef(null); // Ref for the marker instance
  const circleRef = useRef(null); // Ref for the circle instance

  useEffect(() => {
    // Initialize the map
    const mapInstance = L.map("map").setView([51.505, -0.09], 13); // Default view with zoom level 13
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);
    mapRef.current = mapInstance;

    // Connect to Socket.IO server
    const socket = io("http://localhost:8000"); // Ensure this matches your backend URL

    // Listen for location updates
    socket.on("newLocation", (location) => {
      const { latitude, longitude } = location;
      console.log("Received location:", latitude, longitude);

      // If marker doesn't exist, create it
      if (!markerRef.current) {
        markerRef.current = L.marker([latitude, longitude]).addTo(mapInstance);
      } else {
        // Update the marker's position
        markerRef.current.setLatLng([latitude, longitude]);
      }

      // If circle doesn't exist, create it
      if (!circleRef.current) {
        circleRef.current = L.circle([latitude, longitude], {
          color: "blue", // Adjust the radius as needed
        }).addTo(mapInstance);
      } else {
        // Update the circle's position
        circleRef.current.setLatLng([latitude, longitude]);
        circleRef.current.setRadius(2); // Reset the radius if needed
      }

      // Pan to the new location without changing the zoom level
      mapInstance.panTo([latitude, longitude], { animate: false });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect(); // Disconnect Socket.IO
      mapInstance.remove(); // Remove the map
    };
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
};

export default LocationTracker;
