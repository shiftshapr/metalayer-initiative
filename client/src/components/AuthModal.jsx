import React, { useState, useEffect } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onLogin, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for messages from popup window
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('Received auth success message:', event.data.user);
        setIsLoading(false);
        onLogin(event.data.user);
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onLogin, onClose]);

  // Check for stored authentication on component mount
  useEffect(() => {
    if (isOpen) {
      checkStoredAuth();
    }
  }, [isOpen]);

  const checkStoredAuth = () => {
    try {
      const storedUser = localStorage.getItem('metalayer_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id) {
          console.log('Found stored user data:', userData);
          onLogin(userData);
          onClose();
          return;
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    }
  };

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Clear any existing stored user data
      localStorage.removeItem('metalayer_user');

      // First try Chrome Identity API if available
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          { action: 'googleSignIn' },
          (response) => {
            if (response && response.success) {
              console.log('Chrome Identity Auth successful:', response.user);
              setIsLoading(false);
              onLogin(response.user);
              onClose();
            } else {
              console.log('Chrome Identity failed, trying popup method...');
              // Fall back to popup method
              tryPopupMethod();
            }
          }
        );
      } else {
        // Use popup method directly if not in extension context
        tryPopupMethod();
      }
    } catch (error) {
      setIsLoading(false);
      setError('Authentication failed: ' + error.message);
    }
  };

  const tryPopupMethod = () => {
    // Use popup method directly (most reliable for extensions)
    const popup = window.open(
      'http://localhost:3001/auth/google',
      'googleAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setIsLoading(false);
      setError('Popup was blocked. Please allow popups for this site.');
      return;
    }

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        
        // Wait a bit for the popup to finish processing
        setTimeout(() => {
          // Check localStorage for user data
          const storedUser = localStorage.getItem('metalayer_user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              console.log('Popup Auth successful:', userData);
              setIsLoading(false);
              onLogin(userData);
              onClose();
            } catch (error) {
              console.error('Error parsing stored user data:', error);
              setIsLoading(false);
              setError('Authentication data is invalid');
            }
          } else {
            // Fallback: Check with backend
            checkAuthWithBackend();
          }
        }, 500);
      }
    }, 1000);
  };

  const checkAuthWithBackend = () => {
    fetch('http://localhost:3001/auth/me', { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.user) {
          console.log('Backend Auth check successful:', data.user);
          onLogin(data.user);
          onClose();
        } else {
          setError('Authentication was cancelled or failed');
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Auth check failed:', error);
        setError('Authentication was cancelled or failed');
      });
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h3>Sign In</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="auth-form">
          {error && <div className="error-message">{error}</div>}
          <button
            className="google-auth-button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span className="google-icon">G</span>
                Continue with Google
              </>
            )}
          </button>
        </div>
        <div className="auth-footer">
          <p>Sign in with your Google account to continue</p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 