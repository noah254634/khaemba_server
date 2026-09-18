import Message from '../models/Message.js';

/** GET /api/messages — list all messages, newest first (JWT required) */
export const index = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/** DELETE /api/messages/:id — delete one message (JWT required) */
export const destroy = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message)
      return res.status(404).json({ success: false, error: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
