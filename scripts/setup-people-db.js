const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function setupPeopleDatabase() {
  try {
    console.log('Setting up people management database...');

    // Create some demo users
    const demoUsers = [
      {
        email: 'john@example.com',
        name: 'John Doe',
        avatarUrl: '/images/avatar-j.png',
        bio: 'Software developer passionate about AI and web technologies',
        status: 'online'
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        avatarUrl: '/images/avatar-k.png',
        bio: 'UX designer creating beautiful user experiences',
        status: 'away'
      },
      {
        email: 'mike@example.com',
        name: 'Mike Johnson',
        avatarUrl: '/images/avatar-d.png',
        bio: 'Product manager focused on innovation',
        status: 'offline'
      },
      {
        email: 'sarah@example.com',
        name: 'Sarah Wilson',
        avatarUrl: '/images/avatar-bethilhem.png',
        bio: 'Data scientist exploring machine learning',
        status: 'online'
      },
      {
        email: 'alex@example.com',
        name: 'Alex Chen',
        avatarUrl: null,
        bio: 'Full-stack developer and open source contributor',
        status: 'online'
      }
    ];

    console.log('Creating demo users...');
    const users = [];
    for (const userData of demoUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
      users.push(user);
      console.log(`Created/updated user: ${user.name} (${user.email})`);
    }

    // Create some friendships
    console.log('Creating friendships...');
    const john = users.find(u => u.email === 'john@example.com');
    const jane = users.find(u => u.email === 'jane@example.com');
    const sarah = users.find(u => u.email === 'sarah@example.com');
    const mike = users.find(u => u.email === 'mike@example.com');

    if (john && jane) {
      await prisma.friendship.createMany({
        data: [
          { userId: john.id, friendId: jane.id },
          { userId: jane.id, friendId: john.id }
        ],
        skipDuplicates: true
      });
      console.log('Created friendship: John ↔ Jane');
    }

    if (john && sarah) {
      await prisma.friendship.createMany({
        data: [
          { userId: john.id, friendId: sarah.id },
          { userId: sarah.id, friendId: john.id }
        ],
        skipDuplicates: true
      });
      console.log('Created friendship: John ↔ Sarah');
    }

    // Create a friend request
    console.log('Creating friend request...');
    if (mike && john) {
      await prisma.friendRequest.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId: mike.id,
            toUserId: john.id
          }
        },
        update: {},
        create: {
          fromUserId: mike.id,
          toUserId: john.id,
          status: 'pending'
        }
      });
      console.log('Created friend request: Mike → John');
    }

    console.log('✅ People management database setup complete!');
    console.log('\nDemo data created:');
    console.log('- 5 users with profiles');
    console.log('- 2 friendships (John ↔ Jane, John ↔ Sarah)');
    console.log('- 1 pending friend request (Mike → John)');
    console.log('\nYou can now test the people management features!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupPeopleDatabase()
    .then(() => {
      console.log('Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupPeopleDatabase;
