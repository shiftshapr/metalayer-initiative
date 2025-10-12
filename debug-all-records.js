#!/usr/bin/env node

/**
 * Debug script to check ALL records in Supabase for the specific page
 * This will help us understand what's actually in the database
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

async function debugAllRecords() {
  console.log('🔍 DEBUGGING: All records in Supabase for the page');
  console.log('==================================================');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const pageId = 'chrome___extensions__errors_dbdjamnflfecdnioehkdmlhnmajffijl';
    const minutesThreshold = 5;
    const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);
    
    console.log(`📊 Query parameters:`);
    console.log(`  pageId: ${pageId}`);
    console.log(`  minutesThreshold: ${minutesThreshold}`);
    console.log(`  thresholdTime: ${thresholdTime.toISOString()}`);
    console.log(`  current time: ${new Date().toISOString()}`);
    console.log('');
    
    // Get ALL records for this page (no filters)
    console.log('🔍 Getting ALL records for this page...');
    const { data: allRecords, error: allError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('page_id', pageId);

    if (allError) {
      console.error('❌ Error getting all records:', allError);
      return;
    }

    console.log(`📊 Found ${allRecords ? allRecords.length : 0} total records for page ${pageId}`);
    console.log('');
    
    if (allRecords && allRecords.length > 0) {
      allRecords.forEach((record, index) => {
        const lastSeen = new Date(record.last_seen);
        const isRecent = lastSeen > thresholdTime;
        const isActive = record.is_active;
        const meetsCriteria = isActive && isRecent;
        
        console.log(`📋 Record ${index + 1}:`);
        console.log(`   User: ${record.user_email}`);
        console.log(`   Page: ${record.page_id}`);
        console.log(`   Active: ${isActive}`);
        console.log(`   Last Seen: ${record.last_seen}`);
        console.log(`   Recent (within 5min): ${isRecent}`);
        console.log(`   Meets Backend Criteria: ${meetsCriteria}`);
        console.log('');
      });
    } else {
      console.log('❌ No records found for this page');
    }

    // Also check for daveroom@gmail.com specifically
    console.log('🔍 Checking for daveroom@gmail.com specifically...');
    const { data: daveroomRecords, error: daveroomError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_email', 'daveroom@gmail.com');

    if (daveroomError) {
      console.error('❌ Error getting daveroom records:', daveroomError);
    } else {
      console.log(`📊 Found ${daveroomRecords ? daveroomRecords.length : 0} records for daveroom@gmail.com`);
      if (daveroomRecords && daveroomRecords.length > 0) {
        daveroomRecords.forEach((record, index) => {
          console.log(`📋 daveroom Record ${index + 1}:`);
          console.log(`   Page: ${record.page_id}`);
          console.log(`   Active: ${record.is_active}`);
          console.log(`   Last Seen: ${record.last_seen}`);
          console.log(`   Matches target page: ${record.page_id === pageId}`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAllRecords();




