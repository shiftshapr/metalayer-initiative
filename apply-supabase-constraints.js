#!/usr/bin/env node

/**
 * Apply missing UNIQUE constraints to Supabase tables
 * This fixes the "there is no unique or exclusion constraint matching the ON CONFLICT specification" error
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

async function applyConstraints() {
  console.log('🔧 Applying UNIQUE constraints to Supabase tables...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // SQL to add constraints
  const constraints = [
    {
      name: 'user_presence_user_page_unique',
      table: 'user_presence',
      sql: `
        ALTER TABLE user_presence 
        ADD CONSTRAINT user_presence_user_page_unique 
        UNIQUE (user_email, page_id);
      `
    },
    {
      name: 'user_visibility_user_page_unique',
      table: 'user_visibility',
      sql: `
        ALTER TABLE user_visibility 
        ADD CONSTRAINT user_visibility_user_page_unique 
        UNIQUE (user_email, page_id);
      `
    }
  ];
  
  for (const constraint of constraints) {
    console.log(`📝 Adding constraint ${constraint.name} to ${constraint.table}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: constraint.sql
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Constraint ${constraint.name} already exists\n`);
        } else {
          console.error(`❌ Error adding constraint ${constraint.name}:`, error.message);
          console.error(`   Details:`, error);
          console.log(`\n⚠️  You may need to add this constraint manually via the Supabase dashboard:`);
          console.log(`   SQL: ${constraint.sql}\n`);
        }
      } else {
        console.log(`✅ Successfully added constraint ${constraint.name}\n`);
      }
    } catch (err) {
      console.error(`❌ Exception adding constraint ${constraint.name}:`, err.message);
      console.log(`\n⚠️  You may need to add this constraint manually via the Supabase dashboard:`);
      console.log(`   SQL: ${constraint.sql}\n`);
    }
  }
  
  console.log('\n🎉 Constraint application complete!');
  console.log('\n📋 Summary:');
  console.log('   - user_presence: UNIQUE (user_email, page_id)');
  console.log('   - user_visibility: UNIQUE (user_email, page_id)');
  console.log('\n💡 These constraints enable upsert operations with ON CONFLICT clauses.');
}

applyConstraints().catch(console.error);





