import { getDB } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const db = getDB();
    const notifications = db.getCollection('notifications')
      .find({ userId: req.user._id })
      .sort({ timestamp: -1 });

    const unreadCount = notifications.filter(n => !n.read).length;

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    if (id === 'all') {
      const allUserNotifs = db.getCollection('notifications').find({ userId: req.user._id }).exec();
      allUserNotifs.forEach(n => {
        db.getCollection('notifications').findByIdAndUpdate(n._id, { read: true });
      });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const notif = db.getCollection('notifications').findByIdAndUpdate(id, { read: true });
    return res.json({ success: true, notification: notif });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
