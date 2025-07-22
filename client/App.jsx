import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ChatBox from './components/ChatBox';
import CommunitySelector from './components/CommunitySelector';
import AuthModal from './components/AuthModal';
import CanopiIcon from './components/CanopiIcon';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Check for stored authentication on app load
  useEffect(() => {
    checkStoredAuth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkStoredAuth = () => {
    try {
      const storedUser = localStorage.getItem('metalayer_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id) {
          console.log('Auto-login with stored user data:', userData);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      localStorage.removeItem('metalayer_user');
    }
  };

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    setShowAuthModal(false);
    // Store user data for persistence
    localStorage.setItem('metalayer_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedCommunity(null);
    // Clear stored user data
    localStorage.removeItem('metalayer_user');
  };

  const handleCommunitySelect = (communityId) => {
    setSelectedCommunity(communityId);
  };

  const handleDropdownSelect = (tab) => {
    if (tab === 'auth') {
      if (user) {
        handleLogout();
      } else {
        setShowAuthModal(true);
      }
    } else {
      setActiveTab(tab);
    }
    setShowDropdown(false);
  };

  const getActiveTabLabel = () => {
    switch (activeTab) {
      case 'chat':
        return 'Live Chat';
      case 'communities':
        return 'Community Selector';
      case 'visibility':
        return 'Visibility Layer';
      case 'auth':
        return user ? 'Logout' : 'Auth';
      default:
        return 'Live Chat';
    }
  };

  const getTabIcon = (tabId) => {
    switch (tabId) {
      case 'chat':
        return '💬';
      case 'communities':
        return '👥';
      case 'visibility':
        return '👁️';
      case 'auth':
        return user ? '🚪' : '🔑';
      default:
        return '💬';
    }
  };

  return (
    <div className="sidebar-overlay">
      <div className="sidebar">
        <div className="sidebar-header">
          <CanopiIcon />
          <h1>Metalayer</h1>
          <div className="menu-container" ref={dropdownRef}>
            <button 
              className="menu-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              ⋯
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <div 
                  className={`dropdown-item ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => handleDropdownSelect('chat')}
                >
                  <span className="dropdown-icon">💬</span>
                  Live Chat
                </div>
                <div 
                  className={`dropdown-item ${activeTab === 'communities' ? 'active' : ''}`}
                  onClick={() => handleDropdownSelect('communities')}
                >
                  <span className="dropdown-icon">👥</span>
                  Community Selector
                </div>
                <div 
                  className={`dropdown-item ${activeTab === 'visibility' ? 'active' : ''}`}
                  onClick={() => handleDropdownSelect('visibility')}
                >
                  <span className="dropdown-icon">👁️</span>
                  Visibility Layer
                </div>
                <div 
                  className="dropdown-item auth-item"
                  onClick={() => handleDropdownSelect('auth')}
                >
                  <span className="dropdown-icon">{user ? '🚪' : '🔑'}</span>
                  {user ? 'Logout' : 'Auth'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="current-tab-indicator">
          <span className="tab-icon">{getTabIcon(activeTab)}</span>
          <span className="tab-label">{getActiveTabLabel()}</span>
        </div>

        <div className="sidebar-content">
          {activeTab === 'chat' && (
            <ChatBox 
              user={user} 
              communityId={selectedCommunity}
            />
          )}
          {activeTab === 'communities' && (
            <CommunitySelector 
              user={user}
              onCommunitySelect={handleCommunitySelect}
              selectedCommunity={selectedCommunity}
            />
          )}
          {activeTab === 'visibility' && (
            <div className="visibility-layer">
              <h3>Visibility Layer</h3>
              <p>Control what content is visible to you and others.</p>
              <div className="visibility-controls">
                <label>
                  <input type="checkbox" defaultChecked /> Show verified content only
                </label>
                <label>
                  <input type="checkbox" defaultChecked /> Enable content filtering
                </label>
                <label>
                  <input type="checkbox" /> Anonymize interactions
                </label>
              </div>
              {!user && (
                <div className="login-prompt">
                  Please sign in to manage visibility settings
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          {!user ? (
            <button 
              className="auth-button"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          ) : (
            <div className="user-section">
              <div className="user-info">
                <div className="user-name">{user.name || user.email}</div>
                {selectedCommunity && (
                  <div className="selected-community">
                    Community: {selectedCommunity}
                  </div>
                )}
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onLogin={handleLogin}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
