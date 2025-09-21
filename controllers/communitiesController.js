// controllers/communitiesController.js

// Temporary in-memory store
let selectedByUser = {}; // e.g. { "user-abc123": "comm-002" }

// Get communities that the current user is a member of
exports.getCommunities = (req, res) => {
  // Get user ID from query parameter or headers
  const userId = req.query.userId || req.headers['x-user-id'];
  
  // Mock user memberships - in real app, this would come from database
  const userMemberships = {
    'themetalayer@gmail.com': ['comm-001', 'comm-002'],
    'user-123': ['comm-001'],
    'user-456': ['comm-002']
  };
  
  const userCommunities = userMemberships[userId] || ['comm-001']; // Default to Public Square
  
  const allCommunities = [
    { 
      id: 'comm-001', 
      name: 'Public Square', 
      description: 'A general discussion space for all topics',
      codeOfConduct: 'Be respectful and constructive. No spam or harassment.',
      logo: 'https://via.placeholder.com/100x100/4ECDC4/white?text=PS',
      daoLink: 'https://example.com/public-square-dao',
      onboardingInstructions: 'Welcome to Public Square! This is a space for open discussion.',
      isPublic: true,
      isOpen: true,
      profileLink: 'public-square',
      owner: 'themetalayer@gmail.com',
      admins: ['themetalayer@gmail.com'],
      members: 3,
      messages: 5,
      ruleset: { allowAnonymous: true, moderation: 'light' } // Keep for backward compatibility
    },
    { 
      id: 'comm-002', 
      name: 'Governance Circle', 
      description: 'Discussion and decision-making for community governance',
      codeOfConduct: 'Focus on governance topics. Provide evidence for claims.',
      logo: 'https://via.placeholder.com/100x100/45B7D1/white?text=GC',
      daoLink: 'https://example.com/governance-dao',
      onboardingInstructions: 'Join governance discussions and help shape our community.',
      isPublic: true,
      isOpen: false,
      profileLink: 'governance-circle',
      owner: 'themetalayer@gmail.com',
      admins: ['themetalayer@gmail.com'],
      members: 2,
      messages: 3,
      ruleset: { allowAnonymous: false, moderation: 'strict' } // Keep for backward compatibility
    }
  ];
  
  // Filter to only communities the user is a member of
  const communities = allCommunities.filter(community => 
    userCommunities.includes(community.id)
  );
  
  res.json({ communities });
};

exports.selectCommunity = (req, res) => {
  const { userId, communityId } = req.body;
  if (!userId || !communityId) {
    return res.status(400).json({ error: 'userId and communityId required' });
  }
  selectedByUser[userId] = communityId;
  res.json({ message: 'Community selected', userId, communityId });
};

exports.getSelectedCommunity = (req, res) => {
  const { userId } = req.params;
  const communityId = selectedByUser[userId];
  if (!communityId) {
    return res.status(404).json({ error: 'No community selected for this user' });
  }
  res.json({ userId, communityId });
};

// Get communities that user can manage (own or super admin)
exports.getManageableCommunities = (req, res) => {
  // For now, return all communities (in real app, filter by user permissions)
  const communities = [
    { 
      id: 'comm-001', 
      name: 'Public Square', 
      description: 'A general discussion space for all topics',
      codeOfConduct: 'Be respectful and constructive. No spam or harassment.',
      logo: 'https://via.placeholder.com/100x100/4ECDC4/white?text=PS',
      daoLink: 'https://example.com/public-square-dao',
      onboardingInstructions: 'Welcome to Public Square! This is a space for open discussion.',
      isPublic: true,
      isOpen: true,
      profileLink: 'public-square',
      owner: 'themetalayer@gmail.com',
      admins: ['themetalayer@gmail.com'],
      members: 3,
      messages: 5
    },
    { 
      id: 'comm-002', 
      name: 'Governance Circle', 
      description: 'Discussion and decision-making for community governance',
      codeOfConduct: 'Focus on governance topics. Provide evidence for claims.',
      logo: 'https://via.placeholder.com/100x100/45B7D1/white?text=GC',
      daoLink: 'https://example.com/governance-dao',
      onboardingInstructions: 'Join governance discussions and help shape our community.',
      isPublic: true,
      isOpen: false,
      profileLink: 'governance-circle',
      owner: 'themetalayer@gmail.com',
      admins: ['themetalayer@gmail.com'],
      members: 2,
      messages: 3
    }
  ];
  res.json({ communities });
};

// Create new community
exports.createCommunity = (req, res) => {
  const { name, description, codeOfConduct, logo, daoLink, onboardingInstructions, isPublic, isOpen, profileLink } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Community name is required' });
  }

  const newCommunity = {
    id: `comm-${Date.now()}`,
    name,
    description: description || '',
    codeOfConduct: codeOfConduct || '',
    logo: logo || '',
    daoLink: daoLink || '',
    onboardingInstructions: onboardingInstructions || '',
    isPublic: isPublic !== false, // Default to public
    isOpen: isOpen !== false, // Default to open
    profileLink: profileLink || name.toLowerCase().replace(/\s+/g, '-'),
    owner: 'themetalayer@gmail.com', // Mock owner
    admins: ['themetalayer@gmail.com'],
    members: 1,
    messages: 0,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ community: newCommunity });
};

// Update community
exports.updateCommunity = (req, res) => {
  const { id } = req.params;
  const { name, description, codeOfConduct, logo, daoLink, onboardingInstructions, isPublic, isOpen, profileLink } = req.body;
  
  // Mock update - in real app, update database
  const updatedCommunity = {
    id,
    name: name || 'Updated Community',
    description: description || '',
    codeOfConduct: codeOfConduct || '',
    logo: logo || '',
    daoLink: daoLink || '',
    onboardingInstructions: onboardingInstructions || '',
    isPublic: isPublic !== false,
    isOpen: isOpen !== false,
    profileLink: profileLink || 'updated-community',
    owner: 'themetalayer@gmail.com',
    admins: ['themetalayer@gmail.com'],
    members: 1,
    messages: 0,
    updatedAt: new Date().toISOString()
  };

  res.json({ community: updatedCommunity });
};

// Delete community
exports.deleteCommunity = (req, res) => {
  const { id } = req.params;
  
  // Mock deletion - in real app, delete from database
  res.json({ message: 'Community deleted successfully' });
};