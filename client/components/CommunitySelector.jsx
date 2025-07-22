import React, { useState, useEffect } from 'react';
import './CommunitySelector.css';

const CommunitySelector = ({ user, onCommunitySelect, selectedCommunity }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/communities`);
      const data = await response.json();
      if (response.ok) {
        setCommunities(data.communities || []);
      }
    } catch (error) {
      console.error('Failed to load communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCommunity = async (communityId) => {
    if (!user) {
      alert('Please sign in to select a community');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/communities/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          communityId: communityId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onCommunitySelect(communityId);
      } else {
        console.error('Failed to select community:', data.error);
      }
    } catch (error) {
      console.error('Error selecting community:', error);
    }
  };

  return (
    <div className="community-selector">
      <div className="community-header">
        <h3>Community Selector</h3>
        {selectedCommunity && (
          <span className="selected-community">Selected: {selectedCommunity}</span>
        )}
      </div>

      {!user ? (
        <div className="auth-prompt">
          <p>Please sign in to join communities</p>
        </div>
      ) : (
        <div className="communities-list">
          {loading ? (
            <div className="loading">Loading communities...</div>
          ) : communities.length === 0 ? (
            <div className="no-communities">No communities available</div>
          ) : (
            communities.map((community) => (
              <div
                key={community.id}
                className={`community-item ${selectedCommunity === community.id ? 'selected' : ''}`}
                onClick={() => selectCommunity(community.id)}
              >
                <div className="community-name">{community.name}</div>
                <div className="community-rules">
                  {community.ruleset?.allowAnonymous ? 'Anonymous allowed' : 'Verified only'} • 
                  {community.ruleset?.moderation === 'strict' ? ' Strict moderation' : ' Light moderation'}
                </div>
                {selectedCommunity === community.id && (
                  <div className="selected-indicator">✓ Selected</div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className="community-info">
        <h4>About Communities</h4>
        <p>Communities are spaces where users can chat and interact based on specific rules and moderation policies.</p>
        {user && (
          <div className="user-communities">
            <strong>Signed in as:</strong> {user.name || user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySelector;
