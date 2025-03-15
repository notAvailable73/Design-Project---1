import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";

export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/signup" exact element={<SignUp />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/user-profile" exact element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
          {/* Add this new route */}
        </Routes>
      </Router>
    </div>
  );
}
