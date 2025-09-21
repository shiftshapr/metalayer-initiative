const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding Canopi 2 database...');

    // Create test user
    const user = await prisma.appUser.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440000' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        handle: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        isVerified: true
      }
    });

    console.log('✅ Created test user:', user.handle);

    // Create a default space
    const space = await prisma.space.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440001' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Default Space',
        description: 'Default space for testing'
      }
    });

    console.log('✅ Created default space:', space.name);

    // Add user to space as owner
    await prisma.spaceMember.upsert({
      where: {
        spaceId_userId: {
          spaceId: space.id,
          userId: user.id
        }
      },
      update: {},
      create: {
        spaceId: space.id,
        userId: user.id,
        role: 'OWNER'
      }
    });

    console.log('✅ Added user to space as owner');

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();







