import React, { useState, useEffect } from 'react';
import './CommunitySelector.css';

const CommunitySelector = ({ userId, onCommunitySelect }) => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/communities`);
      const data = await response.json();
      if (data.communities) {
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCommunity = async (communityId) => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE}/communities/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          communityId,
        }),
      });

      const data = await response.json();
      if (data.message === 'Community selected') {
        setSelectedCommunity(communityId);
        onCommunitySelect(communityId);
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
            </div>
          ))
        )}
      </div>

      {!userId && (
        <div className="login-prompt">
          Please log in to select a community
        </div>
      )}
    </div>
  );
};

export default CommunitySelector; 