// Simplified PeopleService using in-memory data
class PeopleService {
  constructor() {
    // In-memory data for demo
    this.users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: '/images/avatar-j.png',
        bio: 'Software developer passionate about AI and web technologies',
        status: 'online',
        lastSeen: new Date(),
        isVerified: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatarUrl: '/images/avatar-k.png',
        bio: 'UX designer creating beautiful user experiences',
        status: 'away',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000),
        isVerified: true
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatarUrl: '/images/avatar-d.png',
        bio: 'Product manager focused on innovation',
        status: 'offline',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isVerified: true
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        avatarUrl: '/images/avatar-bethilhem.png',
        bio: 'Data scientist exploring machine learning',
        status: 'online',
        lastSeen: new Date(),
        isVerified: true
      }
    ];
    
    this.friendships = [
      { userId: '1', friendId: '2' },
      { userId: '2', friendId: '1' },
      { userId: '1', friendId: '4' },
      { userId: '4', friendId: '1' }
    ];
    
    this.friendRequests = [
      { id: '1', fromUserId: '3', toUserId: '1', status: 'pending', createdAt: new Date() }
    ];
    
    this.blocks = [];
  }

  // User Management
  async getUsers(search = '', status = '', limit = 50) {
    let filteredUsers = [...this.users];
    
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    filteredUsers = filteredUsers.slice(0, parseInt(limit));
    
    return { success: true, users: filteredUsers, total: filteredUsers.length };
  }

  async getUserById(userId) {
    return this.users.find(user => user.id === userId);
  }

  async updateUserStatus(userId, status) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date();
    }
  }

  // Friends Management
  async getFriends(userId) {
    const userFriends = this.friendships
      .filter(f => f.userId === userId)
      .map(f => this.users.find(u => u.id === f.friendId))
      .filter(Boolean);

    return { success: true, friends: userFriends };
  }

  async addFriend(userId, friendId) {
    // Create bidirectional friendship
    this.friendships.push({ userId, friendId });
    this.friendships.push({ userId: friendId, friendId: userId });
    return { success: true, message: 'Friend added successfully' };
  }

  async removeFriend(userId, friendId) {
    // Remove bidirectional friendship
    this.friendships = this.friendships.filter(f => 
      !(f.userId === userId && f.friendId === friendId) &&
      !(f.userId === friendId && f.friendId === userId)
    );
    return { success: true, message: 'Friend removed successfully' };
  }

  // Friend Requests Management
  async getFriendRequests(userId, type = 'all') {
    let requests = this.friendRequests.filter(req => {
      if (type === 'sent') return req.fromUserId === userId;
      if (type === 'received') return req.toUserId === userId;
      return req.fromUserId === userId || req.toUserId === userId;
    });

    // Add user details to requests
    const requestsWithDetails = requests.map(req => ({
      ...req,
      fromUser: this.users.find(u => u.id === req.fromUserId),
      toUser: this.users.find(u => u.id === req.toUserId)
    }));

    return { success: true, requests: requestsWithDetails };
  }

  async sendFriendRequest(fromUserId, toUserId) {
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if users exist
    const fromUser = this.users.find(u => u.id === fromUserId);
    const toUser = this.users.find(u => u.id === toUserId);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Check if already friends
    const existingFriendship = this.friendships.find(f => 
      (f.userId === fromUserId && f.friendId === toUserId) || 
      (f.userId === toUserId && f.friendId === fromUserId)
    );

    if (existingFriendship) {
      throw new Error('Already friends');
    }

    // Check if request already exists
    const existingRequest = this.friendRequests.find(req => 
      req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'pending'
    );

    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    // Create friend request
    const request = {
      id: Date.now().toString(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date()
    };

    this.friendRequests.push(request);
    return { success: true, request };
  }

  async acceptFriendRequest(requestId) {
    const request = this.friendRequests.find(req => req.id === requestId && req.status === 'pending');
    if (!request) {
      throw new Error('Friend request not found');
    }

    // Update request status
    request.status = 'accepted';

    // Create friendship
    await this.addFriend(request.fromUserId, request.toUserId);

    return { success: true, message: 'Friend request accepted' };
  }

  async declineFriendRequest(requestId) {
    const request = this.friendRequests.find(req => req.id === requestId && req.status === 'pending');
    if (!request) {
      throw new Error('Friend request not found');
    }

    // Update request status
    request.status = 'declined';

    return { success: true, message: 'Friend request declined' };
  }

  // Blocking Management
  async getBlockedUsers(userId) {
    const blockedUserIds = this.blocks
      .filter(b => b.blockerId === userId)
      .map(b => b.blockedId);

    const blockedUsers = this.users.filter(u => blockedUserIds.includes(u.id));
    return { success: true, blockedUsers };
  }

  async blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Check if already blocked
    const existingBlock = this.blocks.find(b => b.blockerId === blockerId && b.blockedId === blockedId);
    if (existingBlock) {
      throw new Error('User already blocked');
    }

    // Remove friendship if exists
    await this.removeFriend(blockerId, blockedId);

    // Remove any pending friend requests
    this.friendRequests = this.friendRequests.filter(req => 
      !(req.fromUserId === blockerId && req.toUserId === blockedId) &&
      !(req.fromUserId === blockedId && req.toUserId === blockerId)
    );

    // Create block
    const block = {
      id: Date.now().toString(),
      blockerId,
      blockedId,
      createdAt: new Date()
    };

    this.blocks.push(block);
    return { success: true, block };
  }

  async unblockUser(blockerId, blockedId) {
    const blockIndex = this.blocks.findIndex(b => b.blockerId === blockerId && b.blockedId === blockedId);
    if (blockIndex === -1) {
      throw new Error('Block not found');
    }

    this.blocks.splice(blockIndex, 1);
    return { success: true, message: 'User unblocked successfully' };
  }

  // User Profile with Relationship Status
  async getUserProfile(userId, currentUserId = null) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let relationshipStatus = 'none';
    
    if (currentUserId && currentUserId !== userId) {
      // Check if blocked
      const isBlocked = this.blocks.find(b => 
        (b.blockerId === currentUserId && b.blockedId === userId) ||
        (b.blockerId === userId && b.blockedId === currentUserId)
      );

      if (isBlocked) {
        relationshipStatus = 'blocked';
      } else {
        // Check if friends
        const friendship = this.friendships.find(f => 
          (f.userId === currentUserId && f.friendId === userId) ||
          (f.userId === userId && f.friendId === currentUserId)
        );

        if (friendship) {
          relationshipStatus = 'friends';
        } else {
          // Check for friend requests
          const friendRequest = this.friendRequests.find(req => 
            (req.fromUserId === currentUserId && req.toUserId === userId) ||
            (req.fromUserId === userId && req.toUserId === currentUserId)
          );

          if (friendRequest) {
            relationshipStatus = friendRequest.fromUserId === currentUserId ? 'request_sent' : 'request_received';
          }
        }
      }
    }

    return {
      success: true,
      user: {
        ...user,
        relationshipStatus
      }
    };
  }

  // Create or update user profile
  async createOrUpdateUser(userData) {
    const { email, name, avatarUrl, bio } = userData;
    
    let user = this.users.find(u => u.email === email);
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.avatarUrl = avatarUrl || user.avatarUrl;
      user.bio = bio || user.bio;
      user.lastSeen = new Date();
    } else {
      // Create new user
      user = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        avatarUrl,
        bio,
        status: 'offline',
        lastSeen: new Date(),
        isVerified: false
      };
      this.users.push(user);
    }

    return user;
  }

  async close() {
    // No cleanup needed for in-memory data
  }
}

module.exports = PeopleService;