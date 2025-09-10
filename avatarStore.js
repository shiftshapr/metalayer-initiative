// avatarStore.js
const activeAvatars = {
  'user1': { 
    userId: 'user1', 
    communityId: 'comm-001', 
    name: 'Alice Johnson',
    lastSeen: new Date().toISOString() 
  },
  'user2': { 
    userId: 'user2', 
    communityId: 'comm-001', 
    name: 'Bob Smith',
    lastSeen: new Date().toISOString() 
  },
  'user3': { 
    userId: 'user3', 
    communityId: 'comm-001', 
    name: 'Carol Davis',
    lastSeen: new Date().toISOString() 
  },
  'user4': { 
    userId: 'user4', 
    communityId: 'comm-002', 
    name: 'David Wilson',
    lastSeen: new Date().toISOString() 
  },
  'user5': { 
    userId: 'user5', 
    communityId: 'comm-002', 
    name: 'Eva Brown',
    lastSeen: new Date().toISOString() 
  }
};

module.exports = {
  setActive: (userId, communityId) => {
    activeAvatars[userId] = { userId, communityId, lastSeen: new Date().toISOString() };
  },
  getActiveInCommunity: (communityId) => {
    return Object.values(activeAvatars).filter(a => a.communityId === communityId);
  },
};
