import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import ProtectedRoute from "./components/ProtectedRoute";
import VerifiedRoute from "./components/VerifiedRoute";
import Sidebar from "./components/SideBar";
import AddCar from "./pages/AddCar";
import ViewAllCars from "./pages/ViewAllCars";
import ChatListPage from "./pages/ChatListPage";
import ChatPage from "./pages/ChatPage";
import VerifyOTP from "./pages/VerifyOtp";
import ListCarForRent from "./pages/ListCarForRent";
import MyListings from "./pages/MyListings";
import CarListingDetails from "./pages/CarListingDetails";
import MyCars from "./pages/MyCars";
import RentACar from "./pages/RentACar";
import LocationTracker from "./pages/LocationTracker";
import MyRentals from "./pages/MyRentals";
import RentalRequests from "./pages/RentalRequests";

export default function App() {
  return (
    <div className="bg-gradient-to-br from-black to-indigo-950 min-h-screen">
      <Router>
        {/* Toast Container */}
        <ToastContainer
          position="top-right" // Position of the toast
          autoClose={3000} // Auto-close after 3 seconds
          hideProgressBar={false} // Show progress bar
          newestOnTop={false} // New toasts appear below older ones
          closeOnClick // Close toast on click
          rtl={false} // Left-to-right layout
          pauseOnFocusLoss // Pause toast when window loses focus
          draggable // Allow dragging to dismiss
          pauseOnHover // Pause toast on hover
        />

        {/* Header */}
        <Header />
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />
          <div className="flex-1 p-4">
            {/* Routes */}
            <Routes>
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/location" element={<LocationTracker />} />
              <Route element={<ProtectedRoute />}>
                {" "}
                {/* Protected Route */}
                <Route path="/" element={<Home />} />
                <Route path="/all-cars" element={<ViewAllCars />} />
                <Route path="/rent-car" element={<RentACar />} />
                <Route
                  path="/car-listings/:id"
                  element={<CarListingDetails />}
                />
                {/* Routes requiring verification */}
                <Route
                  path="/add-car"
                  element={
                    <VerifiedRoute element={<AddCar />} action="add a car" />
                  }
                />
                <Route path="/my-cars" element={<MyCars />} />
                <Route
                  path="/list-car"
                  element={
                    <VerifiedRoute
                      element={<ListCarForRent />}
                      action="list a car for rent"
                    />
                  }
                />
                <Route path="/my-listings" element={<MyListings />} />
                <Route
                  path="/my-listings/:id"
                  element={<CarListingDetails />}
                />
                <Route path="/chats" element={<ChatListPage />} />
                <Route path="/chats/:chatId" element={<ChatPage />} />
                <Route path="/my-rentings" element={<MyRentals />} />
                <Route path="/rental-requests" element={<RentalRequests />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}
