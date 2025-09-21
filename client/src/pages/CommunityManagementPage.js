import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import './CommunityManagementPage.css';

const CommunityManagementPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { apiCall } = useApi();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    codeOfConduct: '',
    logo: '',
    daoLink: '',
    onboardingInstructions: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadCommunities();
    }
  }, [isAuthenticated]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/communities/manage/list');
      setCommunities(response.communities || []);
    } catch (err) {
      setError('Failed to load communities');
      console.error('Error loading communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      codeOfConduct: '',
      logo: '',
      daoLink: '',
      onboardingInstructions: ''
    });
    setEditingCommunity(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCommunity) {
        await apiCall(`/communities/${editingCommunity.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiCall('/communities', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      resetForm();
      loadCommunities();
    } catch (err) {
      setError(err.message || 'Failed to save community');
      console.error('Error saving community:', err);
    }
  };

  const handleEdit = (community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name || '',
      description: community.description || '',
      codeOfConduct: community.codeOfConduct || '',
      logo: community.logo || '',
      daoLink: community.daoLink || '',
      onboardingInstructions: community.onboardingInstructions || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (community) => {
    if (!window.confirm(`Are you sure you want to delete "${community.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiCall(`/communities/${community.id}`, {
        method: 'DELETE'
      });
      loadCommunities();
    } catch (err) {
      setError(err.message || 'Failed to delete community');
      console.error('Error deleting community:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="community-management">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to manage communities.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="community-management">
        <div className="loading">Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="community-management">
      <div className="header">
        <h1>Community Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Community
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCommunity ? 'Edit Community' : 'Create New Community'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="community-form">
              <div className="form-group">
                <label htmlFor="name">Community Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter community name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your community"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="codeOfConduct">Code of Conduct</label>
                <textarea
                  id="codeOfConduct"
                  name="codeOfConduct"
                  value={formData.codeOfConduct}
                  onChange={handleInputChange}
                  placeholder="What is not allowed in this community"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="logo">Logo URL</label>
                <input
                  type="url"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label htmlFor="daoLink">DAO/Community Link</label>
                <input
                  type="url"
                  id="daoLink"
                  name="daoLink"
                  value={formData.daoLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com/dao"
                />
              </div>

              <div className="form-group">
                <label htmlFor="onboardingInstructions">Onboarding Instructions</label>
                <textarea
                  id="onboardingInstructions"
                  name="onboardingInstructions"
                  value={formData.onboardingInstructions}
                  onChange={handleInputChange}
                  placeholder="Instructions for new members"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCommunity ? 'Update Community' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="communities-list">
        {communities.length === 0 ? (
          <div className="empty-state">
            <h3>No Communities Found</h3>
            <p>You haven't created any communities yet, or you don't have permission to manage any.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Community
            </button>
          </div>
        ) : (
          <div className="communities-grid">
            {communities.map(community => (
              <div key={community.id} className="community-card">
                <div className="community-header">
                  {community.logo && (
                    <img src={community.logo} alt={`${community.name} logo`} className="community-logo" />
                  )}
                  <div className="community-info">
                    <h3>{community.name}</h3>
                    <p className="community-owner">
                      Owner: {community.owner?.name || community.owner?.email}
                    </p>
                  </div>
                </div>

                {community.description && (
                  <p className="community-description">{community.description}</p>
                )}

                <div className="community-stats">
                  <span>{community._count?.members || 0} members</span>
                  <span>{community._count?.messages || 0} messages</span>
                </div>

                <div className="community-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(community)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(community)}
                    disabled={community._count?.members > 0 || community._count?.messages > 0}
                  >
                    Delete
                  </button>
                </div>

                {(community._count?.members > 0 || community._count?.messages > 0) && (
                  <div className="delete-warning">
                    Cannot delete: has members or messages
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityManagementPage;









