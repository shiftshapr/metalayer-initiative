// Simplified AuthService using in-memory data
class AuthService {
  constructor() {
    // In-memory users for demo
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
      }
    ];
  }

  // Get current user from session/token
  async getCurrentUser(req) {
    // This would typically extract user from JWT token or session
    // For now, we'll use a simple header or query parameter
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = this.users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Create user from OAuth profile (Google, etc.)
  async createUserFromOAuth(profile) {
    const { email, name, picture } = profile;
    
    let user = this.users.find(u => u.email === email);
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.avatarUrl = picture || user.avatarUrl;
      user.lastSeen = new Date();
    } else {
      // Create new user
      user = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
        avatarUrl: picture,
        status: 'offline',
        lastSeen: new Date(),
        isVerified: false
      };
      this.users.push(user);
    }

    return user;
  }

  // Update user status
  async updateUserStatus(userId, status) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date();
    }
  }

  async close() {
    // No cleanup needed for in-memory data
  }
}

module.exports = AuthService;