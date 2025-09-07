import React, { useState } from 'react';
import './VisibilityLayer.css';

const VisibilityLayer = ({ userId }) => {
  const [visibilitySettings, setVisibilitySettings] = useState({
    showOnline: true,
    showTyping: true,
    showLocation: false,
    allowMessages: true,
  });

  const handleSettingChange = (setting, value) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="visibility-layer">
      <div className="visibility-header">
        <h3>Visibility Layer</h3>
        <span className="status-indicator">Online</span>
      </div>

      <div className="visibility-settings">
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Show Online Status</span>
            <span className="setting-description">Let others see when you're online</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={visibilitySettings.showOnline}
              onChange={(e) => handleSettingChange('showOnline', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Show Typing Indicator</span>
            <span className="setting-description">Show when you're typing a message</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={visibilitySettings.showTyping}
              onChange={(e) => handleSettingChange('showTyping', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Show Location</span>
            <span className="setting-description">Share your current website location</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={visibilitySettings.showLocation}
              onChange={(e) => handleSettingChange('showLocation', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Allow Messages</span>
            <span className="setting-description">Let others send you messages</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={visibilitySettings.allowMessages}
              onChange={(e) => handleSettingChange('allowMessages', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {!userId && (
        <div className="login-prompt">
          Please log in to manage visibility settings
        </div>
      )}
    </div>
  );
};

export default VisibilityLayer; 