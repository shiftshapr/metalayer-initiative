#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up real users for Canopi People Management...\n');

try {
  // Check if Prisma is installed
  console.log('📦 Checking Prisma installation...');
  try {
    execSync('npx prisma --version', { stdio: 'pipe' });
    console.log('✅ Prisma is installed');
  } catch (error) {
    console.log('❌ Prisma not found. Installing...');
    execSync('npm install prisma @prisma/client', { stdio: 'inherit' });
  }

  // Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run database migration
  console.log('\n🗄️  Running database migration...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Setup demo data
  console.log('\n👥 Setting up demo users and relationships...');
  const setupPeopleDb = require('./setup-people-db');
  await setupPeopleDb();

  console.log('\n🎉 Setup complete! Your Canopi extension now has real users!');
  console.log('\n📋 What was set up:');
  console.log('   ✅ Database schema with User, FriendRequest, Friendship, UserBlock models');
  console.log('   ✅ 5 demo users with realistic profiles');
  console.log('   ✅ 2 existing friendships');
  console.log('   ✅ 1 pending friend request');
  console.log('   ✅ Authentication middleware');
  console.log('   ✅ Real API endpoints with database integration');
  
  console.log('\n🔗 API Endpoints available:');
  console.log('   GET    /people/users           - Search and discover users');
  console.log('   GET    /people/friends          - Get current user\'s friends');
  console.log('   GET    /people/friend-requests  - Get friend requests');
  console.log('   POST   /people/friend-request   - Send friend request');
  console.log('   POST   /people/friend-request/accept - Accept friend request');
  console.log('   POST   /people/friend-request/decline - Decline friend request');
  console.log('   DELETE /people/friends/:friendId - Remove friend');
  console.log('   POST   /people/block            - Block user');
  console.log('   DELETE /people/block/:userId    - Unblock user');
  console.log('   GET    /people/blocked          - Get blocked users');
  console.log('   GET    /people/profile/:userId  - Get user profile');
  console.log('   GET    /people/me               - Get current user');
  
  console.log('\n🧪 To test:');
  console.log('   1. Start the server: cd server && npm start');
  console.log('   2. Open the extension and go to People tab');
  console.log('   3. You should see real users with proper relationships!');
  
  console.log('\n💡 Next steps:');
  console.log('   - Integrate with your existing authentication system');
  console.log('   - Add real user registration/login');
  console.log('   - Implement user discovery and search');
  console.log('   - Add real-time status updates');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Make sure you have a DATABASE_URL in your .env file');
  console.log('   2. Ensure your database is running (PostgreSQL)');
  console.log('   3. Check that all dependencies are installed');
  process.exit(1);
}
