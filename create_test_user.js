/**
 * Create test user in database for availability endpoint testing
 */

const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

const TEST_USER = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  handle: 'testuser',
  avatarUrl: 'https://example.com/avatar.jpg',
  auraColor: '#22c55e'
};

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    // Check if user already exists
    const existing = await prisma.appUser.findUnique({
      where: { id: TEST_USER.id }
    });

    if (existing) {
      console.log('✅ Test user already exists:', existing.email);
      return existing;
    }

    // Create new test user
    const user = await prisma.appUser.create({
      data: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
        handle: TEST_USER.handle,
        avatarUrl: TEST_USER.avatarUrl,
        auraColor: TEST_USER.auraColor,
        isVerified: false,
        isSuperAdmin: false,
        updatedAt: new Date()
      }
    });

    console.log('✅ Test user created successfully:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Handle:', user.handle);

    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();



