import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, X } from 'lucide-react';

const MessagePanel = ({ onClose, className='' }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message-panel ${className}`}>
      <div className="message-header">
        <h3>Team Chat</h3>
        <button onClick={onClose} className="panel-close mobile-only">
          <X size={20} />
        </button>
      </div>
      <div className="message-content">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-item ${msg.userId === user.id ? 'outgoing' : 'incoming'}`}
          >
            <div className="message-bubble">
              {msg.userId !== user.id && (
                <div className="message-username">{msg.username}</div>
              )}
              <div className="message-content-text">{msg.content}</div>
              <div className="message-time">{formatTime(msg.createdAt)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          autoComplete="off"
        />
        <button type="submit">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessagePanel;