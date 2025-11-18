/**
 * Create test data for reply chain scoring
 * 
 * This script creates:
 * - A parent message
 * - Multiple child replies with varying reactions
 * - Nested reply chains
 * 
 * Usage:
 *   node prisma/create-test-reply-chains.js
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🧪 Creating test data for reply chain scoring...\n');

    // Get or create a test user using raw SQL
    console.log('📝 Getting or creating test user...');
    let testUserId;
    const existingUser = await prisma.$queryRaw`
      SELECT id FROM "AppUser" WHERE email = 'test@example.com' LIMIT 1
    `;

    if (!existingUser || existingUser.length === 0) {
      testUserId = '00000000-0000-0000-0000-000000000001';
      await prisma.$executeRaw`
        INSERT INTO "AppUser" (id, handle, email, name, "avatarUrl", "createdAt", "updatedAt")
        VALUES (
          ${testUserId}::UUID,
          'testuser',
          'test@example.com',
          'Test User',
          'https://via.placeholder.com/150',
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `;
      console.log('✅ Test user created\n');
    } else {
      testUserId = existingUser[0].id;
      console.log(`✅ Using existing test user: ${testUserId}\n`);
    }

    // Create a test page ID
    const testPageId = 'test-page-reply-chains';
    const testCommunityId = 'comm-001';

    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await prisma.$executeRaw`
      DELETE FROM message_deletions 
      WHERE message_id::UUID IN (
        SELECT id FROM messages 
        WHERE page_id = ${testPageId}
      )
    `;
    await prisma.$executeRaw`
      DELETE FROM reactions 
      WHERE message_id IN (
        SELECT id FROM messages 
        WHERE page_id = ${testPageId}
      )
    `;
    await prisma.$executeRaw`
      DELETE FROM messages 
      WHERE page_id = ${testPageId}
    `;
    console.log('✅ Cleanup complete\n');

    // Create parent message
    console.log('📝 Creating parent message...');
    const parentResult = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'This is a parent message for testing reply chains',
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const parentMessageId = parentResult[0].id;
    console.log(`✅ Parent message created: ${parentMessageId}\n`);

    // Create child replies with different scenarios
    console.log('📝 Creating child replies...');

    // Child 1: High score (3 reactions + 2 nested replies)
    const child1Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Child 1: This reply has 3 reactions and 2 nested replies',
        ${parentMessageId}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const child1Id = child1Result[0].id;

    // Add 3 reactions to child1
    for (let i = 0; i < 3; i++) {
      await prisma.$executeRaw`
        INSERT INTO reactions (message_id, emoji, user_id, created_at)
        VALUES (${child1Id}::UUID, '❤️', ${testUserId}::UUID, NOW())
      `;
    }

    // Create nested replies for child1
    const nested1_1Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Nested reply 1-1: First nested reply',
        ${child1Id}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const nested1_1Id = nested1_1Result[0].id;

    const nested1_2Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Nested reply 1-2: Second nested reply with 2 reactions',
        ${child1Id}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const nested1_2Id = nested1_2Result[0].id;

    // Add 2 reactions to nested1_2
    for (let i = 0; i < 2; i++) {
      await prisma.$executeRaw`
        INSERT INTO reactions (message_id, emoji, user_id, created_at)
        VALUES (${nested1_2Id}::UUID, '👍', ${testUserId}::UUID, NOW())
      `;
    }

    // Create a deeply nested reply (nested1_2 -> nested1_2_1)
    const nested1_2_1Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Deeply nested: Reply to nested1_2',
        ${nested1_2Id}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const nested1_2_1Id = nested1_2_1Result[0].id;

    // Add 1 reaction to deeply nested
    await prisma.$executeRaw`
      INSERT INTO reactions (message_id, emoji, user_id, created_at)
      VALUES (${nested1_2_1Id}::UUID, '🔥', ${testUserId}::UUID, NOW())
    `;

    console.log(`✅ Child 1 created with chain (expected score: ~15)`);

    // Child 2: Medium score (2 reactions + 1 nested = 5 points)
    const child2Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Child 2: This reply has 2 reactions and 1 nested reply',
        ${parentMessageId}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const child2Id = child2Result[0].id;

    // Add 2 reactions
    for (let i = 0; i < 2; i++) {
      await prisma.$executeRaw`
        INSERT INTO reactions (message_id, emoji, user_id, created_at)
        VALUES (${child2Id}::UUID, '👍', ${testUserId}::UUID, NOW())
      `;
    }

    // Create 1 nested reply
    const nested2_1Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Nested reply 2-1: Single nested reply',
        ${child2Id}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    console.log(`✅ Child 2 created with chain (expected score: 5)`);

    // Child 3: Low score (1 reaction, no nested = 1 point)
    const child3Result = await prisma.$queryRaw`
      INSERT INTO messages (page_id, user_id, content, parent_id, community_id, created_at, updated_at)
      VALUES (
        ${testPageId},
        ${testUserId}::UUID,
        'Child 3: This reply has only 1 reaction, no nested replies',
        ${parentMessageId}::UUID,
        ${testCommunityId},
        NOW(),
        NOW()
      )
      RETURNING id
    `;
    const child3Id = child3Result[0].id;

    // Add 1 reaction
    await prisma.$executeRaw`
      INSERT INTO reactions (message_id, emoji, user_id, created_at)
      VALUES (${child3Id}::UUID, '👍', ${testUserId}::UUID, NOW())
    `;

    console.log(`✅ Child 3 created (expected score: 1)\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Data Summary:');
    console.log(`   Parent Message ID: ${parentMessageId}`);
    console.log(`   Page ID: ${testPageId}`);
    console.log(`   Community ID: ${testCommunityId}`);
    console.log('');
    console.log('   Child Replies:');
    console.log(`   1. Child 1: 3 reactions + 2 nested (1 with 2 reactions + 1 deep nested with 1 reaction)`);
    console.log(`      Expected chain score: ~15`);
    console.log(`   2. Child 2: 2 reactions + 1 nested`);
    console.log(`      Expected chain score: 5`);
    console.log(`   3. Child 3: 1 reaction, no nested`);
    console.log(`      Expected chain score: 1`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Test data created successfully!');
    console.log('');
    console.log('🧪 Now run the test:');
    console.log(`   node prisma/test-reply-chain-scoring.js ${parentMessageId} ${testPageId} ${testCommunityId} 5`);
    console.log('');
    console.log('   Or with lower threshold to see all chains:');
    console.log(`   node prisma/test-reply-chain-scoring.js ${parentMessageId} ${testPageId} ${testCommunityId} 1`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestData();
