import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';

const ChatBox = ({ user, communityId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE = 'http://localhost:3001';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when community changes
  useEffect(() => {
    if (communityId) {
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [communityId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/history?communityId=${communityId}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !communityId) return;

    const messageData = {
      userId: user.id,
      communityId: communityId,
      content: inputText.trim()
    };

    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Add the new message to local state
        setMessages(prev => [...prev, data.msg]);
      } else {
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Live Chat</h3>
        {communityId ? (
          <span className="community-name">Community: {communityId}</span>
        ) : (
          <span className="no-community">Select a community to chat</span>
        )}
      </div>
      
      <div className="messages-container">
        {!user ? (
          <div className="auth-prompt">
            <p>Please sign in to join the conversation</p>
          </div>
        ) : !communityId ? (
          <div className="community-prompt">
            <p>Select a community to start chatting</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.userId === user.id ? 'user-message' : 'other-message'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">{formatTime(message.created_at)}</span>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message other-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            !user ? "Sign in to send messages..." :
            !communityId ? "Select a community to send messages..." :
            "Type your message..."
          }
          className="chat-input"
          rows="1"
          disabled={!user || !communityId || isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputText.trim() || !user || !communityId || isLoading}
          className="send-button"
        >
          {isLoading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
