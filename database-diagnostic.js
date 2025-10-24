// 🔍 DATABASE DIAGNOSTIC SCRIPT
// Check database state and recreate missing triggers

const { PrismaClient } = require('./generated/prisma');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zwxomzkmncwzwryvudwu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runDatabaseDiagnostic() {
  console.log('🔍 DATABASE DIAGNOSTIC: Starting comprehensive database check...');
  console.log('===========================================');
  
  try {
    // 1. Check Prisma connection and presenceEvent table
    console.log('📊 STEP 1: Checking Prisma connection and presenceEvent table...');
    try {
      const presenceEvents = await prisma.presenceEvent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      console.log(`✅ Prisma connection: OK`);
      console.log(`✅ presenceEvent table: Found ${presenceEvents.length} recent events`);
      if (presenceEvents.length > 0) {
        console.log(`   Latest event: ${presenceEvents[0].kind} by user ${presenceEvents[0].userId} at ${presenceEvents[0].createdAt}`);
      }
    } catch (error) {
      console.error('❌ Prisma connection failed:', error.message);
      return;
    }

    // 2. Check Supabase connection and user_presence table
    console.log('\n📊 STEP 2: Checking Supabase connection and user_presence table...');
    try {
      const { data: userPresence, error } = await supabase
        .from('user_presence')
        .select('*')
        .limit(5)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase user_presence table error:', error.message);
        console.error('   This suggests the table might not exist or have wrong schema');
      } else {
        console.log(`✅ Supabase connection: OK`);
        console.log(`✅ user_presence table: Found ${userPresence?.length || 0} records`);
        if (userPresence && userPresence.length > 0) {
          console.log(`   Latest record: ${userPresence[0].user_email} on ${userPresence[0].page_id}`);
        }
      }
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }

    // 3. Check for database triggers
    console.log('\n📊 STEP 3: Checking for database triggers...');
    try {
      // Check if triggers exist by querying information_schema
      const triggers = await prisma.$queryRaw`
        SELECT trigger_name, event_manipulation, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('presenceEvent', 'user_presence')
        ORDER BY event_object_table, trigger_name;
      `;
      
      console.log(`✅ Found ${triggers.length} triggers:`);
      if (triggers.length === 0) {
        console.log('❌ NO TRIGGERS FOUND! This is the problem!');
        console.log('   Triggers are needed to sync presenceEvent → user_presence');
      } else {
        triggers.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`);
        });
      }
    } catch (error) {
      console.error('❌ Error checking triggers:', error.message);
    }

    // 4. Test data sync
    console.log('\n📊 STEP 4: Testing data sync between tables...');
    try {
      // Get recent presence events from Prisma
      const recentEvents = await prisma.presenceEvent.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              avatarUrl: true,
              auraColor: true
            }
          }
        }
      });

      console.log(`Found ${recentEvents.length} recent presence events in Prisma:`);
      recentEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.kind} by ${event.user?.email || event.userId} on ${event.pageId} at ${event.createdAt}`);
      });

      // Check if these events exist in Supabase user_presence
      if (recentEvents.length > 0) {
        const event = recentEvents[0];
        const { data: supabaseRecord, error } = await supabase
          .from('user_presence')
          .select('*')
          .eq('user_email', event.user?.email || event.userId)
          .eq('page_id', event.pageId)
          .limit(1);

        if (error) {
          console.error('❌ Error querying user_presence:', error.message);
        } else if (!supabaseRecord || supabaseRecord.length === 0) {
          console.log('❌ SYNC ISSUE: Recent Prisma event not found in Supabase user_presence!');
          console.log('   This confirms the sync is broken');
        } else {
          console.log('✅ SYNC OK: Recent Prisma event found in Supabase user_presence');
        }
      }
    } catch (error) {
      console.error('❌ Error testing data sync:', error.message);
    }

    // 5. Provide fix recommendations
    console.log('\n📊 STEP 5: Fix Recommendations...');
    console.log('===========================================');
    
    if (triggers.length === 0) {
      console.log('🔧 FIX NEEDED: Create database triggers to sync presenceEvent → user_presence');
      console.log('   This will automatically update user_presence when presenceEvent changes');
    } else {
      console.log('🔧 FIX NEEDED: Check if triggers are working correctly');
      console.log('   Triggers exist but sync might be broken');
    }

    console.log('\n✅ DATABASE DIAGNOSTIC COMPLETE!');
    
  } catch (error) {
    console.error('❌ Database diagnostic failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnostic
runDatabaseDiagnostic();
