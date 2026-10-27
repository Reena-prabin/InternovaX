import { getDB } from '../config/db.js';

export const getConversations = async (req, res) => {
  try {
    const db = getDB();
    const currentUserId = req.user._id;
    const allUsers = db.getCollection('users').find({}).exec();
    const allMessages = db.getCollection('messages').find({}).exec();

    // Map other users and last message
    const conversations = allUsers
      .filter(u => u._id !== currentUserId)
      .map(u => {
        const msgs = allMessages.filter(m => 
          (m.senderId === currentUserId && m.receiverId === u._id) ||
          (m.senderId === u._id && m.receiverId === currentUserId)
        );
        msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const lastMsg = msgs[msgs.length - 1] || null;
        const unreadCount = msgs.filter(m => m.receiverId === currentUserId && !m.read).length;

        return {
          user: {
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar || u.name[0],
            company: u.company || ''
          },
          lastMessage: lastMsg,
          unreadCount
        };
      });

    return res.json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    const currentUserId = req.user._id;

    const messages = db.getCollection('messages').find({}).exec().filter(m => 
      (m.senderId === currentUserId && m.receiverId === userId) ||
      (m.senderId === userId && m.receiverId === currentUserId)
    );

    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Mark unread messages as read
    messages.forEach(m => {
      if (m.receiverId === currentUserId && !m.read) {
        db.getCollection('messages').findByIdAndUpdate(m._id, { read: true });
      }
    });

    return res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required' });
    }

    const db = getDB();
    const receiver = db.getCollection('users').findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const newMsg = db.getCollection('messages').create({
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent',
      chatMessage: newMsg
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
