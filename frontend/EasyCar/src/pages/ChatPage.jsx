import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ChatWindow from "../components/ChatWindow";
import axiosInstance from "../utils/axiosInstance";

const ChatPage = () => {
  const [currentUserId, setcurrentUserId] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile data from the backend
      const response = await axiosInstance.get(
        "http://localhost:8000/api/users/profile"
      );

      // Set the user profile data
      setcurrentUserId(response.data._id);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]); // State to store all messages
  const socket = io("http://localhost:8000"); // Connect to the backend server // Replace with the actual logged-in user ID

  // Fetch the selected chat and its messages
  useEffect(() => {
    const fetchChatAndMessages = async () => {
      try {
        // Fetch chat details
        const chatResponse = await axiosInstance.get(
          `http://localhost:8000/api/chats/${chatId}`
        );
        setChat(chatResponse.data);

        // Fetch all messages for the chat
        const messagesResponse = await axiosInstance.get(
          `/api/chats/${chatId}/messages`
        );
        setMessages(messagesResponse.data);
      } catch (error) {
        console.error("Error fetching chat or messages:", error);
      }
    };

    fetchChatAndMessages();
  }, [chatId]);

  // Join the selected chat room
  useEffect(() => {
    if (chat) {
      socket.emit("join_chat", chat._id);
    }
  }, [chat, socket]);

  // Listen for new messages
  useEffect(() => {
    socket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  if (!chat) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Chat Window */}
      <div className="w-full">
        <ChatWindow
          chat={chat}
          messages={messages} // Pass all messages to ChatWindow
          socket={socket}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default ChatPage;
