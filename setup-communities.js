#!/usr/bin/env node

// Setup script for the new community management system
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function setupCommunities() {
  try {
    console.log('🚀 Setting up community management system...');
    
    // 1. Create super admin user if it doesn't exist
    console.log('📧 Setting up super admin user...');
    const superAdmin = await prisma.user.upsert({
      where: { email: 'themetalayer@gmail.com' },
      update: { isSuperAdmin: true },
      create: {
        email: 'themetalayer@gmail.com',
        name: 'Metalayer Admin',
        isSuperAdmin: true,
        isVerified: true
      }
    });
    console.log(`✅ Super admin user: ${superAdmin.email} (ID: ${superAdmin.id})`);
    
    // 2. Create some sample communities
    console.log('🏘️ Creating sample communities...');
    
    const sampleCommunities = [
      {
        name: 'Public Square',
        description: 'A general discussion space for all topics',
        codeOfConduct: 'Be respectful and constructive. No spam or harassment.',
        logo: 'https://via.placeholder.com/100x100/4ECDC4/white?text=PS',
        daoLink: 'https://example.com/public-square-dao',
        onboardingInstructions: 'Welcome to Public Square! This is a space for open discussion.',
        ownerId: superAdmin.id
      },
      {
        name: 'Governance Circle',
        description: 'Discussion and decision-making for community governance',
        codeOfConduct: 'Focus on governance topics. Provide evidence for claims.',
        logo: 'https://via.placeholder.com/100x100/45B7D1/white?text=GC',
        daoLink: 'https://example.com/governance-dao',
        onboardingInstructions: 'Join governance discussions and help shape our community.',
        ownerId: superAdmin.id
      },
      {
        name: 'Developer Hub',
        description: 'Technical discussions and collaboration',
        codeOfConduct: 'Keep discussions technical and helpful. Share code responsibly.',
        logo: 'https://via.placeholder.com/100x100/96CEB4/white?text=DH',
        daoLink: 'https://example.com/dev-dao',
        onboardingInstructions: 'Share your projects, ask questions, and collaborate with other developers.',
        ownerId: superAdmin.id
      }
    ];
    
    for (const communityData of sampleCommunities) {
      const community = await prisma.community.upsert({
        where: { name: communityData.name },
        update: communityData,
        create: communityData
      });
      console.log(`✅ Created community: ${community.name} (ID: ${community.id})`);
    }
    
    // 3. Create some sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      {
        email: 'alice@example.com',
        name: 'Alice Developer',
        isVerified: true
      },
      {
        email: 'bob@example.com',
        name: 'Bob Governance',
        isVerified: true
      },
      {
        email: 'charlie@example.com',
        name: 'Charlie Public',
        isVerified: true
      }
    ];
    
    for (const userData of sampleUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }
    
    // 4. Add users to communities
    console.log('🔗 Adding users to communities...');
    const communities = await prisma.community.findMany();
    const users = await prisma.user.findMany({
      where: { email: { not: 'themetalayer@gmail.com' } }
    });
    
    for (const community of communities) {
      for (const user of users) {
        await prisma.communityMember.upsert({
          where: {
            userId_communityId: {
              userId: user.id,
              communityId: community.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            communityId: community.id
          }
        });
      }
      console.log(`✅ Added users to ${community.name}`);
    }
    
    console.log('🎉 Community management system setup complete!');
    console.log('\n📋 Summary:');
    console.log(`- Super admin: themetalayer@gmail.com`);
    console.log(`- Communities: ${communities.length}`);
    console.log(`- Users: ${users.length + 1} (including super admin)`);
    console.log(`- Community memberships: ${communities.length * users.length}`);
    
  } catch (error) {
    console.error('❌ Error setting up communities:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupCommunities();









