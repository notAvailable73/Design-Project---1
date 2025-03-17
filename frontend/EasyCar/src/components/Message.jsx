import React from "react";

const Message = ({ message, isSender }) => {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isSender
            ? "bg-blue-600 text-white" // Sender's message (blue)
            : "bg-green-600 text-white" // Receiver's message (green)
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-gray-300 mt-1">
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Message;
