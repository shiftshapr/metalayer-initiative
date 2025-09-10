import React, { useState, useEffect } from 'react';
import './ChatBox.css';

const ChatBox = ({ communityId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    if (communityId) {
      fetchChatHistory();
    }
  }, [communityId]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/chat/history?communityId=${communityId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !communityId) return;

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          communityId,
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (data.msg) {
        setMessages(prev => [...prev, data.msg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Live Chat</h3>
        {communityId && <span className="community-name">Community: {communityId}</span>}
      </div>
      
      <div className="chat-messages">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.userId === userId ? 'own' : 'other'}`}>
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={!userId || !communityId}
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim() || !userId || !communityId}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 