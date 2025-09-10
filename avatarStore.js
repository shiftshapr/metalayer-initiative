// avatarStore.js
const activeAvatars = {
  'user1': { 
    userId: 'user1', 
    communityId: 'comm-001', 
    name: 'Alice Johnson',
    uri: 'https://example.com/user1',
    lastSeen: new Date().toISOString() 
  },
  'user2': { 
    userId: 'user2', 
    communityId: 'comm-001', 
    name: 'Bob Smith',
    uri: 'https://example.com/user2',
    lastSeen: new Date().toISOString() 
  },
  'user3': { 
    userId: 'user3', 
    communityId: 'comm-001', 
    name: 'Carol Davis',
    uri: 'https://example.com/user3',
    lastSeen: new Date().toISOString() 
  },
  'user4': { 
    userId: 'user4', 
    communityId: 'comm-002', 
    name: 'David Wilson',
    uri: 'https://example.com/user4',
    lastSeen: new Date().toISOString() 
  },
  'user5': { 
    userId: 'user5', 
    communityId: 'comm-002', 
    name: 'Eva Brown',
    uri: 'https://example.com/user5',
    lastSeen: new Date().toISOString() 
  }
};

module.exports = {
  setActive: (userId, communityId, uri = null) => {
    activeAvatars[userId] = { 
      userId, 
      communityId, 
      uri: uri || `https://example.com/${userId}`,
      lastSeen: new Date().toISOString() 
    };
  },
  getActiveInCommunity: (communityId) => {
    return Object.values(activeAvatars).filter(a => a.communityId === communityId);
  },
};
