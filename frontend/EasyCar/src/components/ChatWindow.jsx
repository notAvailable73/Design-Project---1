import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import axiosInstance from "../utils/axiosInstance";

const ChatWindow = ({ chat, socket, currentUserId }) => {
  const [messages, setMessages] = useState([]); // Define messages state locally
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch messages when the chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/chats/${chat._id}/messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chat]);

  // Scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send a new message
  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        // Send the message to the backend
        const response = await axiosInstance.post(
          `/api/chats/${chat._id}/messages`,
          { content: newMessage }
        );

        // Add the new message to the local state
        setMessages((prevMessages) => [...prevMessages, response.data]);

        // Emit the new message to all participants in the chat
        socket.emit("new_message", {
          chatId: chat._id,
          message: response.data,
        });

        // Clear the input field
        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            isSender={message.sender._id === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-800">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded"
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
