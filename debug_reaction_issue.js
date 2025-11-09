const { PrismaClient } = require('./generated/prisma');

async function debugReactionIssue() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 DEBUGGING: Reaction duplicate detection issue');
    
    const messageId = '43dbb2d7-669e-464b-a227-38afb063492d';
    const userEmail = 'themetalayer@gmail.com';
    
    console.log('\n📊 CHECKING: All reactions for this message');
    const allReactions = await prisma.reactions.findMany({
      where: { message_id: messageId }
    });
    
    console.log('All reactions:', allReactions.map(r => ({
      id: r.id,
      emoji: r.emoji,
      user_email: r.user_email,
      created_at: r.created_at
    })));
    
    console.log('\n🔍 CHECKING: Specific user reaction lookup');
    const userReaction = await prisma.reactions.findFirst({
      where: {
        user_email: userEmail,
        message_id: messageId
      }
    });
    
    console.log('User reaction found:', userReaction);
    
    if (userReaction) {
      console.log('\n✅ FOUND: User has existing reaction');
      console.log('Reaction details:', {
        id: userReaction.id,
        emoji: userReaction.emoji,
        user_email: userReaction.user_email,
        message_id: userReaction.message_id
      });
    } else {
      console.log('\n❌ NOT FOUND: No existing reaction for user');
    }
    
    console.log('\n🔍 CHECKING: Database connection and table access');
    const reactionCount = await prisma.reactions.count();
    console.log('Total reactions in database:', reactionCount);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReactionIssue();

