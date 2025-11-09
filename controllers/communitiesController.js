// controllers/communitiesController.js

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Get communities that the current user is a member of
exports.getCommunities = async (req, res) => {
  try {
    // Get user ID from query parameter or headers
    const userId = req.query.userId || req.headers['x-user-id'] || req.headers['x-user-email'];
    
    console.log('🔍 COMMUNITIES DEBUG: Received request');
    console.log('🔍 COMMUNITIES DEBUG: Query params:', req.query);
    console.log('🔍 COMMUNITIES DEBUG: Headers:', req.headers);
    console.log('🔍 COMMUNITIES DEBUG: Extracted userId:', userId);
    
    // SD1 CRITICAL DEBUG: Log what user is requesting communities
    console.log('🔍 SD1 BACKEND DEBUG: === COMMUNITIES REQUEST DEBUG ===');
    console.log('🔍 SD1 BACKEND DEBUG: Requesting user:', userId);
    console.log('🔍 SD1 BACKEND DEBUG: Request headers:', req.headers);
    console.log('🔍 SD1 BACKEND DEBUG: Request query:', req.query);

    // Find user by email or ID
    let user = null;
    if (userId) {
      if (userId.includes('@')) {
        user = await prisma.appUser.findUnique({
          where: { email: userId }
        });
      } else {
        user = await prisma.appUser.findUnique({
          where: { id: userId }
        }) || await prisma.appUser.findUnique({
          where: { handle: userId }
        });
      }
    }

    // Get user's community memberships
    let memberships = [];
    if (user) {
      // Get active memberships (isActive = true or isPrimary = true for default tab)
      memberships = await prisma.metaCommunityMembership.findMany({
        where: {
          userId: user.id,
          tabId: null // Default tab
        },
        include: {
          MetaCommunity: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { isActive: 'desc' },
          { joinedAt: 'asc' }
        ]
      });
    }

    // If no memberships found, auto-register to Public Square
    if (user && memberships.length === 0) {
      // Find Public Square by legacyId
      const publicSquare = await prisma.metaCommunity.findUnique({
        where: { legacyId: 'comm-001' }
      });

      if (publicSquare) {
        // Create membership
        await prisma.metaCommunityMembership.create({
          data: {
            userId: user.id,
            metaCommunityId: publicSquare.id,
            isPrimary: true,
            isActive: true,
            tabId: null
          }
        });

        // Reload memberships
        memberships = await prisma.metaCommunityMembership.findMany({
          where: {
            userId: user.id,
            tabId: null
          },
          include: {
            MetaCommunity: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { isActive: 'desc' },
            { joinedAt: 'asc' }
          ]
        });

        console.log(`🆕 NEW USER: Auto-registered ${user.handle || user.email || user.id} to Public Square`);
      }
    }

    // Convert to frontend format with membership status
    const communities = memberships
      .filter(m => m.MetaCommunity && m.MetaCommunity.status === 'active')
      .map(membership => {
        const community = membership.MetaCommunity;
        return {
          id: community.legacyId || community.id, // Use legacyId for backward compatibility
          name: community.name,
          description: community.description || '',
          codeOfConduct: community.codeOfConduct || '',
          logo: community.logoUrl || '',
          daoLink: community.communityLink || '',
          onboardingInstructions: community.onboardingInstructions || '',
          isPublic: community.isPublic,
          isOpen: community.isOpen,
          profileLink: community.profileLink || '',
          // Membership status from database
          isActive: membership.isActive,
          isPrimary: membership.isPrimary,
          membershipId: membership.id,
          // SD1 FIX: Removed owner and admins fields - not needed by frontend
          members: 0, // TODO: Calculate actual member count
          messages: 0, // TODO: Calculate actual message count
          ruleset: { 
            allowAnonymous: community.isPublic, 
            moderation: community.codeOfConduct ? 'strict' : 'light' 
          } // Keep for backward compatibility
        };
      });

    // Fallback: If no user or no memberships, return Public Square
    if (communities.length === 0) {
      const publicSquare = await prisma.metaCommunity.findUnique({
        where: { legacyId: 'comm-001' }
      });

      if (publicSquare && publicSquare.status === 'active') {
        communities.push({
          id: publicSquare.legacyId || publicSquare.id,
          name: publicSquare.name,
          description: publicSquare.description || '',
          codeOfConduct: publicSquare.codeOfConduct || '',
          logo: publicSquare.logoUrl || '',
          daoLink: publicSquare.communityLink || '',
          onboardingInstructions: publicSquare.onboardingInstructions || '',
          isPublic: publicSquare.isPublic,
          isOpen: publicSquare.isOpen,
          profileLink: publicSquare.profileLink || '',
          members: 0,
          messages: 0,
          ruleset: { 
            allowAnonymous: publicSquare.isPublic, 
            moderation: publicSquare.codeOfConduct ? 'strict' : 'light' 
          }
        });
      }
    }

    // SD1 CRITICAL DEBUG: Log what's being returned
    console.log('🔍 SD1 BACKEND DEBUG: === RETURNING COMMUNITIES ===');
    console.log('🔍 SD1 BACKEND DEBUG: User requesting:', userId);
    console.log('🔍 SD1 BACKEND DEBUG: Communities being returned:', JSON.stringify(communities, null, 2));
    console.log('🔍 SD1 BACKEND DEBUG: === END RETURNING COMMUNITIES ===');
    
    res.json({ communities });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch communities',
      communities: [] // Return empty array on error
    });
  }
};

exports.selectCommunity = async (req, res) => {
  try {
    const { userId, communityId, tabId } = req.body;
    if (!userId || !communityId) {
      return res.status(400).json({ error: 'userId and communityId required' });
    }

    // Find user
    let user = null;
    if (userId.includes('@')) {
      user = await prisma.appUser.findUnique({
        where: { email: userId }
      });
    } else {
      user = await prisma.appUser.findUnique({
        where: { id: userId }
      }) || await prisma.appUser.findUnique({
        where: { handle: userId }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find community by legacyId or ID
    const community = await prisma.metaCommunity.findUnique({
      where: { legacyId: communityId }
    }) || await prisma.metaCommunity.findUnique({
      where: { id: communityId }
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Convert tabId to integer if provided (might come as string from JSON)
    const tabIdInt = tabId !== undefined && tabId !== null ? parseInt(tabId, 10) : null;
    
    // Validate tabId is a valid integer if provided
    if (tabIdInt !== null && isNaN(tabIdInt)) {
      return res.status(400).json({ error: 'tabId must be a valid integer' });
    }

    // Update membership to set as active and primary
    // First, unset other primary communities for this tab (or default tab if tabId is null)
    await prisma.metaCommunityMembership.updateMany({
      where: {
        userId: user.id,
        tabId: tabIdInt,
        isPrimary: true
      },
      data: {
        isPrimary: false,
        isActive: false
      }
    });

    // Find or create membership
    const membership = await prisma.metaCommunityMembership.upsert({
      where: {
        userId_metaCommunityId_tabId: {
          userId: user.id,
          metaCommunityId: community.id,
          tabId: tabIdInt
        }
      },
      update: {
        isPrimary: true,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        metaCommunityId: community.id,
        isPrimary: true,
        isActive: true,
        tabId: tabIdInt
      }
    });

    res.json({ 
      message: 'Community selected', 
      userId, 
      communityId,
      tabId: tabIdInt,
      membershipId: membership.id
    });
  } catch (error) {
    console.error('Error selecting community:', error);
    res.status(500).json({ error: 'Failed to select community' });
  }
};

exports.getSelectedCommunity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    let user = null;
    if (userId.includes('@')) {
      user = await prisma.appUser.findUnique({
        where: { email: userId }
      });
    } else {
      user = await prisma.appUser.findUnique({
        where: { id: userId }
      }) || await prisma.appUser.findUnique({
        where: { handle: userId }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find primary community
    const membership = await prisma.metaCommunityMembership.findFirst({
      where: {
        userId: user.id,
        tabId: null,
        isPrimary: true
      },
      include: {
        MetaCommunity: true
      }
    });

    if (!membership) {
      return res.status(404).json({ error: 'No community selected for this user' });
    }

    res.json({ 
      userId, 
      communityId: membership.MetaCommunity.legacyId || membership.MetaCommunity.id 
    });
  } catch (error) {
    console.error('Error getting selected community:', error);
    res.status(500).json({ error: 'Failed to get selected community' });
  }
};

// Get communities that user can manage (own or super admin)
exports.getManageableCommunities = async (req, res) => {
  try {
    // For now, return all active communities (in real app, filter by user permissions)
    const communities = await prisma.metaCommunity.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedCommunities = communities.map(community => ({
      id: community.legacyId || community.id,
      name: community.name,
      description: community.description || '',
      codeOfConduct: community.codeOfConduct || '',
      logo: community.logoUrl || '',
      daoLink: community.communityLink || '',
      onboardingInstructions: community.onboardingInstructions || '',
      isPublic: community.isPublic,
      isOpen: community.isOpen,
      profileLink: community.profileLink || '',
      members: 0, // TODO: Calculate actual member count
      messages: 0 // TODO: Calculate actual message count
    }));

    res.json({ communities: formattedCommunities });
  } catch (error) {
    console.error('Error fetching manageable communities:', error);
    res.status(500).json({ error: 'Failed to fetch manageable communities', communities: [] });
  }
};

// Create new community
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, codeOfConduct, logo, daoLink, onboardingInstructions, isPublic, isOpen, profileLink } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    const newCommunity = await prisma.metaCommunity.create({
      data: {
        name,
        description: description || '',
        codeOfConduct: codeOfConduct || '',
        logoUrl: logo || null,
        communityLink: daoLink || null,
        onboardingInstructions: onboardingInstructions || '',
        isPublic: isPublic !== false,
        isOpen: isOpen !== false,
        profileLink: profileLink || name.toLowerCase().replace(/\s+/g, '-'),
        status: 'active'
      }
    });

    const formattedCommunity = {
      id: newCommunity.legacyId || newCommunity.id,
      name: newCommunity.name,
      description: newCommunity.description || '',
      codeOfConduct: newCommunity.codeOfConduct || '',
      logo: newCommunity.logoUrl || '',
      daoLink: newCommunity.communityLink || '',
      onboardingInstructions: newCommunity.onboardingInstructions || '',
      isPublic: newCommunity.isPublic,
      isOpen: newCommunity.isOpen,
      profileLink: newCommunity.profileLink || '',
      members: 0,
      messages: 0,
      createdAt: newCommunity.createdAt.toISOString()
    };

    res.status(201).json({ community: formattedCommunity });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
};

// Update community
exports.updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, codeOfConduct, logo, daoLink, onboardingInstructions, isPublic, isOpen, profileLink } = req.body;
    
    // Find community by legacyId or ID
    const existing = await prisma.metaCommunity.findUnique({
      where: { legacyId: id }
    }) || await prisma.metaCommunity.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const updatedCommunity = await prisma.metaCommunity.update({
      where: { id: existing.id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        codeOfConduct: codeOfConduct !== undefined ? codeOfConduct : existing.codeOfConduct,
        logoUrl: logo !== undefined ? logo : existing.logoUrl,
        communityLink: daoLink !== undefined ? daoLink : existing.communityLink,
        onboardingInstructions: onboardingInstructions !== undefined ? onboardingInstructions : existing.onboardingInstructions,
        isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
        isOpen: isOpen !== undefined ? isOpen : existing.isOpen,
        profileLink: profileLink !== undefined ? profileLink : existing.profileLink,
        updatedAt: new Date()
      }
    });

    const formattedCommunity = {
      id: updatedCommunity.legacyId || updatedCommunity.id,
      name: updatedCommunity.name,
      description: updatedCommunity.description || '',
      codeOfConduct: updatedCommunity.codeOfConduct || '',
      logo: updatedCommunity.logoUrl || '',
      daoLink: updatedCommunity.communityLink || '',
      onboardingInstructions: updatedCommunity.onboardingInstructions || '',
      isPublic: updatedCommunity.isPublic,
      isOpen: updatedCommunity.isOpen,
      profileLink: updatedCommunity.profileLink || '',
      members: 0,
      messages: 0,
      updatedAt: updatedCommunity.updatedAt.toISOString()
    };

    res.json({ community: formattedCommunity });
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ error: 'Failed to update community' });
  }
};

// Delete community
exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find community by legacyId or ID
    const existing = await prisma.metaCommunity.findUnique({
      where: { legacyId: id }
    }) || await prisma.metaCommunity.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Soft delete by setting status to archived
    await prisma.metaCommunity.update({
      where: { id: existing.id },
      data: {
        status: 'archived',
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ error: 'Failed to delete community' });
  }
};
