/**
 * DIAGNOSTIC: Check if Reactive Loading System & Flow Refactor are Active
 *
 * Run this in browser console to verify:
 * 1. Reactive coordination system (MutationObserver vs polling)
 * 2. New flow architecture (load/display separation, tab coordination)
 * 3. CommunitiesModule initialization
 * 4. TabController event-based coordination
 * 5. MessageLoadingService tab-aware loading
 */

(function() {
  console.log('🔍 CANOPI REACTIVE SYSTEM DIAGNOSTIC');
  console.log('=====================================');

  const results = {
    reactiveSystem: false,
    flowArchitecture: false,
    communitiesModule: false,
    tabController: false,
    messageLoadingService: false
  };

  // 1. Check Reactive Coordination System
  console.log('\n1. 🔄 REACTIVE COORDINATION SYSTEM:');
  try {
    // Check for MutationObserver instances (reactive system)
    const observers = window.__CANOPI_MODULE_GRAPH__?.reactiveCoordinator?._observers || [];
    const mutationObservers = Array.from(observers).filter(obs => obs instanceof MutationObserver);

    if (mutationObservers.length > 0) {
      console.log('✅ MutationObserver-based coordination ACTIVE');
      console.log(`   Found ${mutationObservers.length} active observers`);
      results.reactiveSystem = true;
    } else {
      console.log('❌ NO MutationObserver found - reactive system NOT active');
    }

    // Check for setInterval/setTimeout polling (old system)
    const timers = [];
    for (let i = 1; i < 10000; i++) {
      try {
        const timer = window.setTimeout(() => {}, 1000);
        window.clearTimeout(timer);
        timers.push(timer);
      } catch (e) { break; }
    }

    if (timers.length > 100) { // Arbitrary threshold
      console.log('⚠️  HIGH number of timers detected - possible polling system');
    }

  } catch (e) {
    console.log('❌ Error checking reactive system:', e.message);
  }

  // 2. Check Flow Architecture (Load/Display Separation)
  console.log('\n2. 🔀 FLOW ARCHITECTURE (Load/Display Separation):');
  try {
    const graph = window.__CANOPI_MODULE_GRAPH__;
    if (graph) {
      // Check for PageDataManager (load operations)
      if (graph.pageDataManager) {
        console.log('✅ PageDataManager found - load operations separated');
      } else {
        console.log('❌ PageDataManager missing - load/display not separated');
      }

      // Check for SidepanelTabManager (display operations)
      if (graph.sidepanelTabManager) {
        console.log('✅ SidepanelTabManager found - display operations separated');
      } else {
        console.log('❌ SidepanelTabManager missing - display operations not separated');
      }

      // Check for LoadingStateCoordinator
      if (graph.loadingStateCoordinator) {
        console.log('✅ LoadingStateCoordinator found - coordinated loading states');
        results.flowArchitecture = true;
      } else {
        console.log('❌ LoadingStateCoordinator missing - no loading coordination');
      }

      // Check for tab registry system
      if (window.tabRegistry && typeof window.tabRegistry.get === 'function') {
        console.log('✅ Tab registry system found - dynamic tab handling');
      } else {
        console.log('❌ Tab registry missing - static tab handling only');
      }
    } else {
      console.log('❌ Module graph not found');
    }
  } catch (e) {
    console.log('❌ Error checking flow architecture:', e.message);
  }

  // 3. Check CommunitiesModule
  console.log('\n3. 🏘️ COMMUNITIES MODULE:');
  try {
    const graph = window.__CANOPI_MODULE_GRAPH__;
    if (graph?.communitiesModule) {
      console.log('✅ CommunitiesModule found in module graph');

      if (typeof graph.communitiesModule.initialize === 'function') {
        console.log('✅ CommunitiesModule has initialize() method');
      }

      if (typeof graph.communitiesModule.isInitialized === 'function') {
        const initialized = graph.communitiesModule.isInitialized();
        console.log(`📊 CommunitiesModule initialized: ${initialized}`);
        if (initialized) results.communitiesModule = true;
      }

      if (typeof graph.communitiesModule.getCommunities === 'function') {
        const communities = graph.communitiesModule.getCommunities();
        console.log(`📊 Communities loaded: ${communities.length}`);
      }
    } else {
      console.log('❌ CommunitiesModule not found in module graph');
    }
  } catch (e) {
    console.log('❌ Error checking CommunitiesModule:', e.message);
  }

  // 4. Check TabController Event-Based Coordination
  console.log('\n4. 📑 TAB CONTROLLER (Event-Based Coordination):');
  try {
    // Check for TabManager with new event-based methods
    const graph = window.__CANOPI_MODULE_GRAPH__;
    if (graph?.tabManager) {
      console.log('✅ TabManager found');

      // Check for new coordination methods
      const hasWaitForTabManager = typeof graph.tabManager.waitForTabManager === 'function';
      const hasEnsureCommunitiesReady = typeof graph.tabManager.ensureCommunitiesReady === 'function';
      const hasProcessUrl = typeof graph.tabManager.processUrl === 'function';

      if (hasWaitForTabManager) {
        console.log('✅ Event-based TabManager coordination (waitForTabManager)');
      } else {
        console.log('❌ Missing event-based coordination (waitForTabManager)');
      }

      if (hasEnsureCommunitiesReady) {
        console.log('✅ Community readiness coordination (ensureCommunitiesReady)');
      } else {
        console.log('❌ Missing community readiness coordination');
      }

      if (hasProcessUrl) {
        console.log('✅ URL processing with guards (processUrl)');
        results.tabController = true;
      } else {
        console.log('❌ Missing URL processing with guards');
      }

      // Check for old polling patterns
      if (graph.tabManager._onUpdated && graph.tabManager._onActivated) {
        console.log('✅ Event listeners active (Chrome tabs API)');
      }
    } else {
      console.log('❌ TabManager not found');
    }
  } catch (e) {
    console.log('❌ Error checking TabController:', e.message);
  }

  // 5. Check MessageLoadingService Tab-Aware Loading
  console.log('\n5. 💬 MESSAGE LOADING SERVICE (Tab-Aware):');
  try {
    const graph = window.__CANOPI_MODULE_GRAPH__;
    if (graph?.messageLoadingService) {
      console.log('✅ MessageLoadingService found');

      if (typeof graph.messageLoadingService.canLoadMessages === 'function') {
        const canLoad = graph.messageLoadingService.canLoadMessages();
        console.log(`📊 Can load messages: ${canLoad} (tab-aware)`);
      }

      if (typeof graph.messageLoadingService.getActiveTab === 'function') {
        const activeTab = graph.messageLoadingService.getActiveTab();
        console.log(`📊 Active tab detection: ${activeTab}`);
        results.messageLoadingService = true;
      }

      // Check for loadChatHistory function availability
      if (graph.messageLoadingService.loadChatHistory &&
          typeof graph.messageLoadingService.loadChatHistory === 'function') {
        console.log('✅ Tab-aware loadChatHistory available');
      } else {
        console.log('❌ Missing tab-aware loadChatHistory');
      }
    } else {
      console.log('❌ MessageLoadingService not found');
    }
  } catch (e) {
    console.log('❌ Error checking MessageLoadingService:', e.message);
  }

  // SUMMARY
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('====================');
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${name}`);
  });

  const activeCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n🎯 OVERALL SCORE: ${activeCount}/${totalCount} systems active`);

  if (activeCount === totalCount) {
    console.log('🎉 ALL SYSTEMS ACTIVE - Reactive loading system is running!');
  } else if (activeCount >= 3) {
    console.log('⚠️  PARTIALLY ACTIVE - Some systems active, others may be fallback');
  } else {
    console.log('❌ MOSTLY INACTIVE - Likely using old polling/fallback systems');
  }

  // Quick test actions
  console.log('\n🧪 QUICK TESTS:');
  console.log('===============');

  // Test community functionality
  try {
    const graph = window.__CANOPI_MODULE_GRAPH__;
    if (graph?.communitiesModule?.getCommunities) {
      const communities = graph.communitiesModule.getCommunities();
      console.log(`🧪 Communities test: ${communities.length} communities loaded`);
    }
  } catch (e) {
    console.log('🧪 Communities test failed:', e.message);
  }

  // Test tab state
  try {
    const activeTab = document.querySelector('.main-nav-tab.active');
    const tabId = activeTab?.getAttribute('data-tab');
    console.log(`🧪 Active tab: ${tabId || 'none'}`);
  } catch (e) {
    console.log('🧪 Tab test failed:', e.message);
  }

  console.log('\n💡 If systems are NOT active, check:');
  console.log('   1. Extension reloaded after build?');
  console.log('   2. Build completed successfully?');
  console.log('   3. Console errors on page load?');
  console.log('   4. Module graph initialized?');

})();