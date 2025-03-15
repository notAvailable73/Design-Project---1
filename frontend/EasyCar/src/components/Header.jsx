import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
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

        {/* Navigation Links (Login and Signup) */}
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
      </div>
    </header>
  );
}
