import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: req.user._id,
    })
      .populate("users", "name email")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("users", "name email")
      .populate("latestMessage");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.users.some((p) => p._id.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
export const createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }
    // Check if chat already exists
    const chatName = participant.name;
    const existingChat = await Chat.findOne({
      users: { $all: [req.user._id, participantId] },
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    const chat = await Chat.create({
      users: [req.user._id, participantId],
      chatName,
    });

    await chat.populate("users", "name email");
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Send message
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    console.log("object");
    console.log(content);
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.users.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      sender: req.user._id,
      content,
      chat: chat._id,
    });
    console.log(message);

    // Update the chat's latest message
    await Chat.findByIdAndUpdate(chat._id, {
      latestMessage: message._id,
    });

    await message.populate("sender", "name email");
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.users.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: "Not authorized" });
    }
    // Fetch all messages for the chat
    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 }); // Sort by creation time (oldest first)

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
