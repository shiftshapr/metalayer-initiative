// TE2 COMPREHENSIVE DIAGNOSTIC: Visibility Timing & Ghost Presence
// This script provides detailed diagnostics for the remaining issues

(async () => {
  console.log('🧪 TE2: === COMPREHENSIVE VISIBILITY TIMING & GHOST PRESENCE DIAGNOSTIC ===');
  console.log('');

  // ===== TEST 1: Monitor enter_time stability =====
  window.testEnterTimeStability = async function(durationSeconds = 120) {
    console.log(`🧪 TE2: === TEST 1: ENTER_TIME STABILITY (${durationSeconds}s) ===`);
    console.log('🧪 TE2: This test monitors if enter_time is being reset incorrectly');
    console.log('');

    const userEmail = window.currentUser?.email;
    if (!userEmail) {
      console.error('❌ TE2: No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;

    console.log(`🧪 TE2: Monitoring user: ${userEmail}`);
    console.log(`🧪 TE2: On page: ${pageId}`);
    console.log('');

    const snapshots = [];
    const startTime = Date.now();

    const intervalId = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      // Query Supabase directly
      const { data: presenceRecords, error } = await window.supabase
        .from('user_presence')
        .select('enter_time, last_seen, is_active')
        .eq('user_email', userEmail)
        .eq('page_id', pageId);

      if (error) {
        console.error(`❌ TE2: Error querying Supabase at ${elapsed}s:`, error);
        return;
      }

      if (!presenceRecords || presenceRecords.length === 0) {
        console.warn(`⚠️ TE2: No presence record found at ${elapsed}s`);
        return;
      }

      const record = presenceRecords[0];
      const enterTime = new Date(record.enter_time);
      const lastSeen = new Date(record.last_seen);
      const now = new Date();

      const timeSinceEnter = Math.floor((now - enterTime) / 1000);
      const timeSinceLastSeen = Math.floor((now - lastSeen) / 1000);

      const snapshot = {
        elapsed: elapsed,
        enter_time: record.enter_time,
        last_seen: record.last_seen,
        is_active: record.is_active,
        timeSinceEnter: timeSinceEnter,
        timeSinceLastSeen: timeSinceLastSeen
      };

      snapshots.push(snapshot);

      console.log(`📊 TE2: Snapshot at ${elapsed}s:`);
      console.log(`   enter_time: ${record.enter_time} (${timeSinceEnter}s ago)`);
      console.log(`   last_seen: ${record.last_seen} (${timeSinceLastSeen}s ago)`);
      console.log(`   is_active: ${record.is_active}`);

      // CRITICAL CHECK: Has enter_time changed?
      if (snapshots.length > 1) {
        const prevSnapshot = snapshots[snapshots.length - 2];
        if (prevSnapshot.enter_time !== snapshot.enter_time) {
          console.error(`❌ TE2: ENTER_TIME RESET DETECTED!`);
          console.error(`   Previous: ${prevSnapshot.enter_time}`);
          console.error(`   Current:  ${snapshot.enter_time}`);
          console.error(`   This is the root cause of "Now" resets!`);
        }
      }

      if (elapsed >= durationSeconds) {
        clearInterval(intervalId);
        console.log('');
        console.log(`✅ TE2: Test complete. Collected ${snapshots.length} snapshots.`);
        console.log('');
        console.log('📊 TE2: ANALYSIS:');
        
        // Check if enter_time ever changed
        const enterTimeChanges = snapshots.filter((s, i) => 
          i > 0 && s.enter_time !== snapshots[i-1].enter_time
        );

        if (enterTimeChanges.length > 0) {
          console.error(`❌ TE2: CRITICAL BUG: enter_time was reset ${enterTimeChanges.length} times during test!`);
          console.error(`   This explains why visibility always shows "Now"`);
          enterTimeChanges.forEach((change, idx) => {
            console.error(`   Reset ${idx + 1}: at ${change.elapsed}s`);
          });
        } else {
          console.log(`✅ TE2: enter_time remained stable throughout test`);
        }

        // Check last_seen update frequency
        const lastSeenUpdates = snapshots.filter((s, i) => 
          i > 0 && s.last_seen !== snapshots[i-1].last_seen
        );
        console.log(`📊 TE2: last_seen was updated ${lastSeenUpdates.length} times`);
        console.log(`   Average update frequency: ${Math.floor(durationSeconds / lastSeenUpdates.length)}s`);
      }
    }, 5000); // Check every 5 seconds

    return { success: true, message: `Monitoring for ${durationSeconds} seconds...` };
  };

  // ===== TEST 2: Monitor visibility state flipping =====
  window.testVisibilityStateFlipping = async function(durationSeconds = 120) {
    console.log(`🧪 TE2: === TEST 2: VISIBILITY STATE FLIPPING (${durationSeconds}s) ===`);
    console.log('🧪 TE2: This test monitors if visibility status text flips between states');
    console.log('');

    const snapshots = [];
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      // Get all visible user elements
      const userElements = document.querySelectorAll('.user-item');
      
      userElements.forEach((element) => {
        const userId = element.getAttribute('data-user-id');
        const userName = element.getAttribute('data-user-name');
        const statusElement = element.querySelector('.item-status');
        
        if (statusElement) {
          const statusText = statusElement.textContent;
          
          const snapshot = {
            elapsed: elapsed,
            userId: userId,
            userName: userName,
            statusText: statusText
          };

          snapshots.push(snapshot);

          console.log(`📊 TE2: ${userName} at ${elapsed}s: "${statusText}"`);
        }
      });

      if (elapsed >= durationSeconds) {
        clearInterval(intervalId);
        console.log('');
        console.log(`✅ TE2: Test complete. Collected ${snapshots.length} snapshots.`);
        console.log('');
        console.log('📊 TE2: ANALYSIS:');

        // Group by user
        const userSnapshots = {};
        snapshots.forEach(s => {
          if (!userSnapshots[s.userId]) {
            userSnapshots[s.userId] = [];
          }
          userSnapshots[s.userId].push(s);
        });

        // Check for flipping
        Object.keys(userSnapshots).forEach(userId => {
          const userSnaps = userSnapshots[userId];
          const userName = userSnaps[0].userName;
          
          // Detect flips (e.g., "Online for 1 minute" -> "Now" -> "Online for 1 minute")
          const flips = [];
          for (let i = 1; i < userSnaps.length; i++) {
            const prev = userSnaps[i-1].statusText;
            const curr = userSnaps[i].statusText;
            
            // Check if it went from "Online for X" back to "Now"
            if (prev.startsWith('Online for') && curr === 'Now') {
              flips.push({
                elapsed: userSnaps[i].elapsed,
                from: prev,
                to: curr
              });
            }
          }

          if (flips.length > 0) {
            console.error(`❌ TE2: ${userName} had ${flips.length} state flips:`);
            flips.forEach((flip, idx) => {
              console.error(`   Flip ${idx + 1} at ${flip.elapsed}s: "${flip.from}" -> "${flip.to}"`);
            });
          } else {
            console.log(`✅ TE2: ${userName} had no state flips`);
          }
        });
      }
    }, 5000); // Check every 5 seconds

    return { success: true, message: `Monitoring for ${durationSeconds} seconds...` };
  };

  // ===== TEST 3: Test ghost presence on tab switch =====
  window.testGhostPresence = async function() {
    console.log('🧪 TE2: === TEST 3: GHOST PRESENCE ON TAB SWITCH ===');
    console.log('🧪 TE2: MANUAL TEST - Follow these instructions:');
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('   1. Open TWO browser profiles (e.g., daveroom and themetalayer)');
    console.log('   2. In Profile A, open sidepanel on Page 1 (e.g., google.com)');
    console.log('   3. In Profile B, open sidepanel on Page 1 (same page)');
    console.log('   4. Verify Profile B sees Profile A in the "Visible" list');
    console.log('   5. In Profile A, switch to Page 2 (e.g., youtube.com)');
    console.log('   6. IMMEDIATELY check Profile B\'s "Visible" list');
    console.log('   7. Profile A should DISAPPEAR from Profile B\'s list within 5 seconds');
    console.log('   8. If Profile A still shows as visible on Page 1 after 30+ seconds, GHOST PRESENCE BUG EXISTS');
    console.log('');
    console.log('🔍 WHAT TO LOOK FOR:');
    console.log('   ✅ GOOD: Profile A disappears from Page 1 visibility list within 5-10 seconds');
    console.log('   ❌ BAD: Profile A still shows on Page 1 for 30+ seconds (ghost presence)');
    console.log('');
    console.log('📝 LOGGING TO MONITOR:');
    console.log('   In Profile A console, look for:');
    console.log('     - "🚪 TAB_CHANGE: Leaving current page before switching..."');
    console.log('     - "🚪 PRESENCE_EXIT: === LEAVING PAGE ==="');
    console.log('     - "✅ TAB_CHANGE: Left current page successfully"');
    console.log('');
    console.log('   In Profile B console, look for:');
    console.log('     - Real-time updates removing Profile A from visibility list');
    console.log('');

    return { success: true, message: 'Manual test instructions provided' };
  };

  // ===== TEST 4: Monitor heartbeat frequency =====
  window.testHeartbeatFrequency = async function(durationSeconds = 60) {
    console.log(`🧪 TE2: === TEST 4: HEARTBEAT FREQUENCY (${durationSeconds}s) ===`);
    console.log('🧪 TE2: This test monitors how often presence heartbeats are sent');
    console.log('');

    const userEmail = window.currentUser?.email;
    if (!userEmail) {
      console.error('❌ TE2: No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    const urlData = await window.normalizeCurrentUrl();
    const pageId = urlData.pageId;

    console.log(`🧪 TE2: Monitoring heartbeats for: ${userEmail}`);
    console.log(`🧪 TE2: On page: ${pageId}`);
    console.log('');

    const heartbeats = [];
    const startTime = Date.now();

    const intervalId = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      // Query Supabase directly
      const { data: presenceRecords, error } = await window.supabase
        .from('user_presence')
        .select('last_seen')
        .eq('user_email', userEmail)
        .eq('page_id', pageId);

      if (error || !presenceRecords || presenceRecords.length === 0) {
        return;
      }

      const lastSeen = presenceRecords[0].last_seen;
      
      // Check if last_seen changed since last check
      if (heartbeats.length === 0 || heartbeats[heartbeats.length - 1].last_seen !== lastSeen) {
        const heartbeat = {
          elapsed: elapsed,
          last_seen: lastSeen,
          timestamp: new Date().toISOString()
        };
        heartbeats.push(heartbeat);
        console.log(`💓 TE2: Heartbeat detected at ${elapsed}s - last_seen: ${lastSeen}`);
      }

      if (elapsed >= durationSeconds) {
        clearInterval(intervalId);
        console.log('');
        console.log(`✅ TE2: Test complete. Detected ${heartbeats.length} heartbeats.`);
        console.log('');
        console.log('📊 TE2: ANALYSIS:');
        
        if (heartbeats.length < 2) {
          console.error(`❌ TE2: Not enough heartbeats detected to analyze frequency`);
        } else {
          // Calculate intervals between heartbeats
          const intervals = [];
          for (let i = 1; i < heartbeats.length; i++) {
            const interval = heartbeats[i].elapsed - heartbeats[i-1].elapsed;
            intervals.push(interval);
          }

          const avgInterval = Math.floor(intervals.reduce((a, b) => a + b, 0) / intervals.length);
          const minInterval = Math.min(...intervals);
          const maxInterval = Math.max(...intervals);

          console.log(`📊 TE2: Heartbeat statistics:`);
          console.log(`   Total heartbeats: ${heartbeats.length}`);
          console.log(`   Average interval: ${avgInterval}s`);
          console.log(`   Min interval: ${minInterval}s`);
          console.log(`   Max interval: ${maxInterval}s`);
          console.log('');

          if (avgInterval > 30) {
            console.warn(`⚠️ TE2: Heartbeat interval is HIGH (${avgInterval}s)`);
            console.warn(`   This may cause slow visibility updates`);
            console.warn(`   Consider increasing heartbeat frequency in startPresenceTracking()`);
          } else if (avgInterval < 10) {
            console.warn(`⚠️ TE2: Heartbeat interval is LOW (${avgInterval}s)`);
            console.warn(`   This may cause unnecessary database load`);
          } else {
            console.log(`✅ TE2: Heartbeat interval is reasonable (${avgInterval}s)`);
          }
        }
      }
    }, 2000); // Check every 2 seconds

    return { success: true, message: `Monitoring for ${durationSeconds} seconds...` };
  };

  // ===== TEST 5: Test real-time subscription updates =====
  window.testRealtimeSubscription = async function(durationSeconds = 60) {
    console.log(`🧪 TE2: === TEST 5: REAL-TIME SUBSCRIPTION UPDATES (${durationSeconds}s) ===`);
    console.log('🧪 TE2: This test monitors if Supabase real-time updates are working');
    console.log('');

    if (!window.supabaseRealtimeClient) {
      console.error('❌ TE2: SupabaseRealtimeClient not initialized');
      return { success: false, error: 'SupabaseRealtimeClient not available' };
    }

    console.log('🧪 TE2: Monitoring real-time updates...');
    console.log('🧪 TE2: Open another profile and switch tabs to trigger updates');
    console.log('');

    const updates = [];
    const startTime = Date.now();

    // Hook into the real-time update handler
    const originalHandler = window.supabaseRealtimeClient.handlePresenceUpdate;
    if (originalHandler) {
      window.supabaseRealtimeClient.handlePresenceUpdate = function(...args) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updates.push({
          elapsed: elapsed,
          timestamp: new Date().toISOString(),
          args: args
        });
        console.log(`🔔 TE2: Real-time update received at ${elapsed}s`);
        return originalHandler.apply(this, args);
      };
    }

    setTimeout(() => {
      // Restore original handler
      if (originalHandler) {
        window.supabaseRealtimeClient.handlePresenceUpdate = originalHandler;
      }

      console.log('');
      console.log(`✅ TE2: Test complete. Received ${updates.length} real-time updates.`);
      console.log('');
      console.log('📊 TE2: ANALYSIS:');

      if (updates.length === 0) {
        console.error(`❌ TE2: NO real-time updates received!`);
        console.error(`   This explains slow visibility updates`);
        console.error(`   Check Supabase real-time subscription setup`);
      } else {
        console.log(`✅ TE2: Real-time updates are working`);
        console.log(`   Received ${updates.length} updates in ${durationSeconds} seconds`);
        console.log(`   Average: ${Math.floor(durationSeconds / updates.length)}s per update`);
      }
    }, durationSeconds * 1000);

    return { success: true, message: `Monitoring for ${durationSeconds} seconds...` };
  };

  // ===== RUN ALL TESTS =====
  window.runAllVisibilityTimingTests = async function() {
    console.log('🚀 TE2: === RUNNING ALL VISIBILITY TIMING & GHOST PRESENCE TESTS ===');
    console.log('');
    console.log('📋 TEST SUITE:');
    console.log('   1. Enter Time Stability (120s) - Monitors if enter_time is reset');
    console.log('   2. Visibility State Flipping (120s) - Monitors if status text flips');
    console.log('   3. Ghost Presence (Manual) - Instructions for manual testing');
    console.log('   4. Heartbeat Frequency (60s) - Monitors heartbeat intervals');
    console.log('   5. Real-time Subscription (60s) - Monitors real-time updates');
    console.log('');
    console.log('⚠️  NOTE: Tests 1, 2, 4, and 5 will run automatically.');
    console.log('⚠️  Test 3 (Ghost Presence) requires manual testing.');
    console.log('');
    console.log('🔍 RECOMMENDATION: Run tests individually for better focus:');
    console.log('   - window.testEnterTimeStability(120)');
    console.log('   - window.testVisibilityStateFlipping(120)');
    console.log('   - window.testGhostPresence()');
    console.log('   - window.testHeartbeatFrequency(60)');
    console.log('   - window.testRealtimeSubscription(60)');
    console.log('');
  };

  console.log('✅ TE2: Comprehensive Visibility Timing & Ghost Presence test suite loaded!');
  console.log('');
  console.log('📋 Available Commands:');
  console.log('   - window.testEnterTimeStability(120) - Monitor enter_time stability');
  console.log('   - window.testVisibilityStateFlipping(120) - Monitor status text flipping');
  console.log('   - window.testGhostPresence() - Manual ghost presence test instructions');
  console.log('   - window.testHeartbeatFrequency(60) - Monitor heartbeat frequency');
  console.log('   - window.testRealtimeSubscription(60) - Monitor real-time updates');
  console.log('   - window.runAllVisibilityTimingTests() - Show all test info');
  console.log('');
  console.log('🎯 RECOMMENDED: Start with window.testEnterTimeStability(120)');
})();

