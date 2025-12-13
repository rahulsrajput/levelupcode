import React from "react";
import { Link } from "react-router-dom";
import { Code } from "lucide-react";

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 font-sans text-gray-800">
      <div className="w-full max-w-md flex flex-col gap-6 text-center">

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
          <Code className="h-6 w-6 text-gray-500 animate-pulse" />
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm">
          Welcome to LevelUpCode! The page you are looking for does not exist.
        </p>
        <p className="text-gray-600 text-sm">
          Please check the URL or return to the homepage.
        </p>

        {/* Go Home Button */}
        <Link
          to="/"
          className="w-full py-2 text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 rounded transition"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
