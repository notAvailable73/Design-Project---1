import React from "react";

export default function ProfilePic({ username, photoUrl, size }) {
  // If no photo is provided, use the first letter of the username
  const firstLetter = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div
      className={`relative inline-flex items-center justify-center  size-10 rounded-full bg-gray-700 text-white overflow-hidden`}
    >
      {photoUrl ? (
        // Display the user's photo if available
        <img src={photoUrl} className="w-full h-full object-cover" />
      ) : (
        // Display the first letter of the username if no photo is available
        <span className="text-xl font-bold">{firstLetter}</span>
      )}
    </div>
  );
}
