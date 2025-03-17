// src/pages/ChatListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import axiosInstance from "../utils/axiosInstance";

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  // Fetch chats for the user
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get("/api/chats");
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  // Handle chat selection
  const handleSelectChat = (chat) => {
    navigate(`/chats/${chat._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Chats</h1>
        <ChatList chats={chats} onSelectChat={handleSelectChat} />
      </div>
    </div>
  );
};

export default ChatListPage;
