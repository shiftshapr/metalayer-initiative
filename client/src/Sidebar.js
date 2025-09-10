import React, { useState, useEffect, useRef } from 'react';
import ChatBox from './components/ChatBox';
import CommunitySelector from './components/CommunitySelector';
import VisibilityLayer from './components/VisibilityLayer';
import AuthModal from './components/AuthModal';
import './Sidebar.css';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    // Check if user is already logged in
    checkSession();
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

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedCommunity(null);
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

  const navItems = [
    { id: 'chat', label: 'Live Chat', icon: '💬' },
    { id: 'communities', label: 'Community Selector', icon: '👥' },
    { id: 'visibility', label: 'Visibility Layer', icon: '👁️' },
    { id: 'auth', label: user ? 'Logout' : 'Auth', icon: user ? '🚪' : '🔑' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatBox communityId={selectedCommunity} userId={user?.id} />;
      case 'communities':
        return <CommunitySelector userId={user?.id} onCommunitySelect={handleCommunitySelect} />;
      case 'visibility':
        return <VisibilityLayer userId={user?.id} />;
      case 'auth':
        if (user) {
          return (
            <div className="auth-content">
              <div className="user-info">
                <h3>Logged in as</h3>
                <p>{user.email}</p>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          );
        } else {
          setShowAuthModal(true);
          return <div className="auth-content">Please log in to continue</div>;
        }
      default:
        return <ChatBox communityId={selectedCommunity} userId={user?.id} />;
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span role="img" aria-label="logo">🛡️</span>
          <span className="sidebar-title">Metalayer</span>
          <div className="menu-container" ref={dropdownRef}>
            <button 
              className="menu-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              ⋯
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                {navItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`dropdown-item ${activeTab === item.id ? 'active' : ''} ${item.id === 'auth' ? 'auth-item' : ''}`}
                    onClick={() => handleDropdownSelect(item.id)}
                  >
                    <span className="dropdown-icon">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="current-tab-indicator">
          <span className="tab-icon">{getTabIcon(activeTab)}</span>
          <span className="tab-label">{getActiveTabLabel()}</span>
        </div>

        <div className="sidebar-content">
          {renderContent()}
        </div>

        {!user && (
          <div className="sidebar-auth-stubs">
            <button 
              className="sidebar-auth-btn" 
              onClick={() => setShowAuthModal(true)}
            >
              Sign in to continue
            </button>
          </div>
        )}
      </aside>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={handleLogin}
      />
    </>
  );
};

export default Sidebar; 