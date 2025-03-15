import React, { use, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import ProfilePic from "./ProfilePic";
import { toast } from "react-toastify";

export default function Header() {
  const [userProfile, setUserProfile] = useState(null); // User profile data
  const size = "12";
  const navigate = useNavigate();
  const handlelogout = () => {
    localStorage.clear();
    setUserProfile(null);
    navigate("/login");
  };
  const fetchUserProfile = async () => {
    try {
      // Fetch user profile data from the backend
      const response = await axiosInstance.get(
        "http://localhost:8000/api/users/profile"
      );

      // Set the user profile data
      setUserProfile(response.data.name);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);

      // Handle errors

      // Redirect to login if there's an error
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);
  return (
    <header className=" bg-gradient-to-br from-black to-indigo-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        {/* Company Name (EasyCar) */}
        <Link
          to="/"
          className="text-2xl font-bold hover:text-purple-500 transition-colors duration-300"
        >
          EasyCar
        </Link>
        {userProfile ? (
          <>
            <div className="">
              <ProfilePic username={userProfile} size={size} />
              <br />
              <button className="underline mt-2" onClick={handlelogout}>
                Logout
              </button>
            </div>
          </>
        ) : (
          /* Navigation Links (Login and Signup) */
          <nav className="flex space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-3xl hover:bg-gray-900 transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-3xl hover:bg-gray-900 transition-colors duration-300"
            >
              Signup
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
