import Chat from '../models/chat.model.js';

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id
        })
        .populate('participants', 'name email')
        .sort({ lastMessage: -1 });

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
            .populate('participants', 'name email')
            .populate('messages.sender', 'name email');

        if (!chat) { 
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is a participant
        if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
            return res.status(401).json({ message: 'Not authorized' });
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

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: { $all: [req.user._id, participantId] }
        });

        if (existingChat) {
            return res.json(existingChat);
        }

        const chat = await Chat.create({
            participants: [req.user._id, participantId]
        });

        await chat.populate('participants', 'name email');
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
        const { text } = req.body;
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is a participant
        if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        chat.messages.push({
            sender: req.user._id,
            text,
            timestamp: new Date()
        });

        chat.lastMessage = new Date();
        const updatedChat = await chat.save();

        await updatedChat.populate('messages.sender', 'name email');
        res.json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 