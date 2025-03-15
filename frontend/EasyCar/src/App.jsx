import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications

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

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}
