# 🚀 Real Users Setup Guide

This guide will help you set up real users for your Canopi People Management system, replacing the demo data with a proper database-backed solution.

## 📋 What You'll Get

- **Real Database**: PostgreSQL with Prisma ORM
- **User Authentication**: Proper user management with sessions
- **People Management**: Friends, friend requests, blocking
- **User Discovery**: Search and find other users
- **Real-time Status**: Online/away/offline status tracking
- **Profile Management**: User profiles with avatars and bios

## 🛠️ Setup Steps

### 1. Database Setup

First, make sure you have PostgreSQL running and a DATABASE_URL in your `.env` file:

```bash
# Add to your .env file
DATABASE_URL="postgresql://username:password@localhost:5432/metalayer_db"
```

### 2. Run the Setup Script

```bash
# Run the automated setup
node scripts/setup-real-users.js
```

This will:
- Install Prisma dependencies
- Generate the Prisma client
- Run database migrations
- Create demo users and relationships
- Set up the authentication system

### 3. Start the Server

```bash
cd server && npm start
```

### 4. Test the Extension

1. Open your browser extension
2. Go to the "People" tab
3. You should see real users with proper relationships!

## 🗄️ Database Schema

The system uses these main models:

### User Model
```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?
  avatarUrl   String?
  bio         String?
  status      String   @default("offline")
  lastSeen    DateTime @default(now())
  isVerified  Boolean  @default(false)
  // ... relationships
}
```

### FriendRequest Model
```prisma
model FriendRequest {
  id        String   @id @default(uuid())
  fromUserId String
  toUserId   String
  status     String   @default("pending")
  // ... relationships
}
```

### Friendship Model
```prisma
model Friendship {
  id        String   @id @default(uuid())
  userId    String
  friendId  String
  // ... relationships
}
```

### UserBlock Model
```prisma
model UserBlock {
  id           String   @id @default(uuid())
  blockerId    String
  blockedId    String
  // ... relationships
}
```

## 🔌 API Endpoints

### Authentication Required
All endpoints require authentication via `x-user-id` header.

### User Management
- `GET /people/users` - Search and discover users
- `GET /people/me` - Get current user info
- `POST /people/profile` - Update user profile
- `PATCH /people/status` - Update user status

### Friends Management
- `GET /people/friends` - Get current user's friends
- `DELETE /people/friends/:friendId` - Remove friend

### Friend Requests
- `GET /people/friend-requests` - Get friend requests
- `POST /people/friend-request` - Send friend request
- `POST /people/friend-request/accept` - Accept friend request
- `POST /people/friend-request/decline` - Decline friend request

### Blocking
- `GET /people/blocked` - Get blocked users
- `POST /people/block` - Block user
- `DELETE /people/block/:userId` - Unblock user

## 🔐 Authentication Integration

### Current Setup (Demo)
The system currently uses a simple header-based authentication for demo purposes:

```javascript
// In sidepanel.js
headers: {
  'x-user-id': '1' // Demo user ID
}
```

### Production Integration
To integrate with your existing authentication:

1. **Update AuthService** (`services/authService.js`):
```javascript
async getCurrentUser(req) {
  // Extract from JWT token
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return await this.prisma.user.findUnique({
    where: { id: decoded.userId }
  });
}
```

2. **Update Frontend** (`presence/sidepanel.js`):
```javascript
// Get token from your auth system
const token = await getAuthToken();
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 👥 Demo Data

The setup script creates:

- **5 Users**: John, Jane, Mike, Sarah, Alex
- **2 Friendships**: John ↔ Jane, John ↔ Sarah  
- **1 Friend Request**: Mike → John
- **Realistic Profiles**: Names, emails, avatars, bios, status

## 🔄 User Status Management

Users can have three statuses:
- `online` - Currently active
- `away` - Away but available
- `offline` - Not available

Status is automatically updated when users interact with the system.

## 🔍 User Discovery

Users can be discovered through:
- **Search**: By name or email
- **Status Filter**: Online, away, offline
- **Pagination**: Limit results for performance

## 🚀 Next Steps

### 1. Real Authentication
- Integrate with your existing auth system
- Add JWT token validation
- Implement proper session management

### 2. User Registration
- Add user signup flow
- Email verification
- Profile completion

### 3. Real-time Features
- WebSocket for live status updates
- Real-time friend request notifications
- Online presence indicators

### 4. Advanced Features
- User groups/communities
- Privacy settings
- User activity feeds
- Advanced search filters

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Prisma Issues
```bash
# Reset database
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

### API Issues
- Check server logs for errors
- Verify authentication headers
- Test endpoints with curl

## 📞 Support

If you encounter issues:
1. Check the server logs
2. Verify database connection
3. Test API endpoints individually
4. Check browser console for frontend errors

The system is now ready for real users! 🎉
