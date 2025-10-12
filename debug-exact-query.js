#!/usr/bin/env node

/**
 * Debug script to replicate the exact backend query logic
 * This will help us understand why daveroom@gmail.com is not being returned
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zwxomzkmncwzwryvudwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM';

async function debugExactQuery() {
  console.log('🔍 DEBUGGING: Exact backend query replication');
  console.log('==============================================');
  
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
    
    console.log('🔍 Testing exact backend query...');
    
    // This is the exact query from presenceService.js
    const { data: presenceData, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .gte('last_seen', thresholdTime.toISOString())
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`🔍 DEBUG: Raw Supabase query result: ${presenceData ? presenceData.length : 0} records`);
    
    if (presenceData && presenceData.length > 0) {
      presenceData.forEach((record, index) => {
        console.log(`🔍 DEBUG: Record ${index + 1}: ${record.user_email} - last_seen: ${record.last_seen} (active: ${record.is_active})`);
      });
    } else {
      console.log('🔍 No active users found in Supabase for page:', pageId);
      
      // Also check all records for this page regardless of time/active status
      console.log('🔍 Checking all records for this page...');
      const { data: allRecords, error: allError } = await supabase
        .from('user_presence')
        .select('*')
        .eq('page_id', pageId);

      if (!allError && allRecords) {
        console.log(`🔍 DEBUG: All records for page ${pageId}: ${allRecords.length} found`);
        allRecords.forEach((record, index) => {
          const lastSeen = new Date(record.last_seen);
          const isRecent = lastSeen > thresholdTime;
          console.log(`🔍 DEBUG: All record ${index + 1}: ${record.user_email} - last_seen: ${record.last_seen} (active: ${record.is_active}, recent: ${isRecent})`);
        });
      }
    }

    console.log('');
    console.log('🔍 Found', presenceData ? presenceData.length : 0, 'active users in Supabase for page:', pageId);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugExactQuery();
