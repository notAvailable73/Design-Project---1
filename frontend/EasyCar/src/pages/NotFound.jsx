import { Link } from "react-router-dom";
import { FaHome, FaSadTear } from "react-icons/fa"; // Import icons from react-icons

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-indigo-900 text-white">
      <div className="text-center">
        {/* Icon */}
        <FaSadTear className="w-20 h-20 mx-auto mb-6 animate-bounce" />

        {/* Title */}
        <h1 className="text-6xl font-bold mb-4">404</h1>

        {/* Subtitle */}
        <h2 className="text-2xl font-semibold mb-6">Oops! Page Not Found</h2>

        {/* Message */}
        <p className="text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300"
        >
          <FaHome className="mr-2" />
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
