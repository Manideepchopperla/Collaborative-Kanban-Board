import Message from '../models/Message.js';

export const getRecentMessages = async (req, res) => {
  try {
    const { boardId } = req.params;
    const messages = await Message.find({ boardId })
      .sort({ createdAt: 1 }) // Sort oldest to newest
      .limit(50)
      .lean();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};