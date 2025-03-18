// src/pages/ChatListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatList from "../components/ChatList";
import axiosInstance from "../utils/axiosInstance";
import { useVerificationCheck } from "../components/VerificationCheck";
import { toast } from "react-toastify";

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Add verification check
  const {
    isVerified,
    loading: verificationLoading,
    requireVerification,
    VerificationModal,
  } = useVerificationCheck();

  // Fetch chats for the user
  useEffect(() => {
    fetchChats();
  }, []);

  // Handle chat creation from navigation state
  useEffect(() => {
    // Check if we have user and car ID from navigation state (from car listing details page)
    if (location.state?.userId && location.state?.carId) {
      handleCreateChat(location.state.userId, location.state.carId);
    }
  }, [location.state, isVerified]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/chats");
      console.log(response.data);
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
    }
  };

  // Create a new chat or navigate to existing one
  const handleCreateChat = async (userId, carId) => {
    // Check if user is verified
    if (!requireVerification("message a car owner")) {
      return;
    }

    try {
      // Create or get existing chat
      const response = await axiosInstance.post("/api/chats", {
        participantId: userId,
        carId: carId,
      });

      // Navigate to the chat
      navigate(`/chats/${response.data._id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat. Please try again.");
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    navigate(`/chats/${chat._id}`);
  };

  if (loading || verificationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Chats</h1>
        {chats.length > 0 ? (
          <ChatList chats={chats} onSelectChat={handleSelectChat} />
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-xl mb-4">You don't have any chats yet</p>
            <p className="text-gray-400">
              Start a conversation with a car owner by viewing their car listing
              and clicking on "Message Owner"
            </p>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <VerificationModal />
    </div>
  );
};

export default ChatListPage;
