import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifs();
  }, []);

  async function loadNotifs() {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAll() {
    try {
      await api.markNotificationRead('all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleItemClick(notif) {
    try {
      if (!notif.read) {
        await api.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="notifications-popup">
      <div className="notif-header">
        <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
        <button
          type="button"
          onClick={handleMarkAll}
          style={{ fontSize: 11, color: 'var(--accent-lime)', fontWeight: 600 }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${!n.read ? 'unread' : ''}`}
              onClick={() => handleItemClick(n)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 12.5, color: !n.read ? 'var(--accent-lime)' : 'var(--text-primary)' }}>
                  {n.title}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {n.message}
              </p>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '10px 18px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', background: '#121212' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ fontSize: 11, color: 'var(--text-muted)' }}
        >
          Close panel
        </button>
      </div>
    </div>
  );
}
