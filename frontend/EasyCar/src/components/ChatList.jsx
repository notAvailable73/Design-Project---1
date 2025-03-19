// src/components/ChatList.jsx
import React from "react";

const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-white text-xl font-bold mb-6">Your Chats</h2>
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition duration-200 ease-in-out transform hover:scale-105"
            onClick={() => onSelectChat(chat)}
          >
            <p className="text-white font-semibold text-lg">
              {`${chat.relatedCar.brand} ${chat.relatedCar.model} ${chat.relatedCar.year}`}
            </p>
            {chat.lastMessage && (
              <p className="text-gray-400 text-sm mt-1 truncate">
                {chat.lastMessage.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
