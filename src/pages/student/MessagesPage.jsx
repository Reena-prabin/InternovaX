import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (activePartner) {
      loadMessagesForUser(activePartner._id);
    }
  }, [activePartner]);

  async function loadConversations() {
    setLoading(true);
    try {
      const res = await api.getConversations();
      const list = res.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activePartner) {
        setActivePartner(list[0].user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessagesForUser(partnerId) {
    try {
      const res = await api.getMessagesWithUser(partnerId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!inputContent.trim() || !activePartner) return;

    setSending(true);
    try {
      const res = await api.sendMessage(activePartner._id, inputContent.trim());
      setMessages(prev => [...prev, res.chatMessage]);
      setInputContent('');
      loadConversations();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="content-area">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Internal Communications</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Coordinate directly with your technical mentor, host company, and administrator.
        </p>
      </div>

      <div className="messages-layout-grid">
        {/* Left conversations list */}
        <div style={{ borderRight: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>
            Contacts & Channels
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map((c) => {
              const isSelected = activePartner && activePartner._id === c.user._id;
              return (
                <div
                  key={c.user._id}
                  onClick={() => setActivePartner(c.user)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(183, 255, 60, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-lime)' : '3px solid transparent',
                    transition: 'background var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: isSelected ? 'var(--accent-lime)' : 'var(--text-primary)', fontSize: 13.5 }}>
                      {c.user.name}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', background: '#222', padding: '2px 6px', borderRadius: 4 }}>
                      {c.user.role}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.lastMessage ? c.lastMessage.content : 'No messages yet'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right chat thread */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activePartner ? (
            <>
              {/* Partner Header */}
              <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-card)', background: '#121212', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="user-avatar-circle" style={{ width: 34, height: 34, fontSize: 12 }}>
                  {activePartner.avatar || activePartner.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{activePartner.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--accent-lime)' }}>{activePartner.role?.toUpperCase()} • {activePartner.company || 'InternovaX'}</div>
                </div>
              </div>

              {/* Message History */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                    No messages in this conversation yet. Send the first greeting!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === user?._id;
                    return (
                      <div
                        key={m._id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>
                          {isMine ? 'You' : m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div
                          style={{
                            background: isMine ? 'var(--accent-lime)' : '#1f1f1f',
                            color: isMine ? 'var(--text-dark)' : 'var(--text-primary)',
                            padding: '10px 14px',
                            borderRadius: 12,
                            fontSize: 13.5,
                            lineHeight: 1.4,
                            fontWeight: isMine ? 500 : 400,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-card)', background: '#121212', display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  placeholder={`Write a message to ${activePartner.name}...`}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn-lime"
                  disabled={sending || !inputContent.trim()}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
