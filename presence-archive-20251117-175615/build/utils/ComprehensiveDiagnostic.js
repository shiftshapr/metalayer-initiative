/**
 * COMPREHENSIVE DIAGNOSTIC TOOL
 * Root Cause Analysis for Messages and Visibility Tab Issues
 */

class ComprehensiveDiagnostic {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      urlNormalization: {},
      messageLoading: {},
      visibilityTab: {},
      apiConnectivity: {},
      databaseQueries: {},
      errors: [],
      moduleDiagnostics: {}
    };
  }

  async runFullDiagnostic() {
    console.log('🔍 === COMPREHENSIVE DIAGNOSTIC STARTING ===');
    
    try {
      await this.diagnoseUrlNormalization();
      await this.diagnoseMessageLoading();
      await this.diagnoseVisibilityTab();
      await this.diagnoseApiConnectivity();
      await this.diagnoseDatabaseQueries();
      await this.runModuleDiagnostics();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Error during diagnostic:', error);
      this.results.errors.push({
        type: 'diagnostic_error',
        message: error.message,
        stack: error.stack
      });
    }
    
    return this.results;
  }

  async diagnoseUrlNormalization() {
    console.log('🔍 DIAGNOSTIC: Checking URL normalization...');
    const section = this.results.urlNormalization;
    
    try {
      // Get current page URI
      const rawUri = await window.getCurrentPageUri?.() || window.location?.href || 'unknown';
      section.rawUri = rawUri;
      console.log('🔍 DIAGNOSTIC: Raw URI:', rawUri);
      
      // Test normalization
      if (typeof window.normalizeUrl === 'function') {
        const normalized = await window.normalizeUrl(rawUri);
        section.normalizedUrl = normalized.normalizedUrl;
        section.pageId = normalized.pageId;
        section.normalizationWorking = true;
        console.log('✅ DIAGNOSTIC: URL normalization working');
        console.log('🔍 DIAGNOSTIC: Normalized URL:', normalized.normalizedUrl);
        console.log('🔍 DIAGNOSTIC: Page ID:', normalized.pageId);
      } else {
        section.normalizationWorking = false;
        section.error = 'window.normalizeUrl not available';
        console.error('❌ DIAGNOSTIC: window.normalizeUrl not available');
      }
      
      // Check normalizeCurrentUrl
      if (typeof window.normalizeCurrentUrl === 'function') {
        const currentUrlData = await window.normalizeCurrentUrl();
        section.currentUrlData = currentUrlData;
        section.normalizeCurrentUrlWorking = true;
        console.log('✅ DIAGNOSTIC: normalizeCurrentUrl working');
        console.log('🔍 DIAGNOSTIC: Current URL data:', currentUrlData);
      } else {
        section.normalizeCurrentUrlWorking = false;
        section.error = 'window.normalizeCurrentUrl not available';
        console.error('❌ DIAGNOSTIC: window.normalizeCurrentUrl not available');
      }
      
      // Check window.currentUrlData
      section.windowCurrentUrlData = window.currentUrlData;
      console.log('🔍 DIAGNOSTIC: window.currentUrlData:', window.currentUrlData);
      
    } catch (error) {
      section.error = error.message;
      section.stack = error.stack;
      console.error('❌ DIAGNOSTIC: URL normalization error:', error);
    }
  }

  async diagnoseMessageLoading() {
    console.log('🔍 DIAGNOSTIC: Checking message loading...');
    const section = this.results.messageLoading;
    
    try {
      // Check loadChatHistory availability
      section.loadChatHistoryAvailable = typeof window.loadChatHistory === 'function';
      console.log('🔍 DIAGNOSTIC: loadChatHistory available:', section.loadChatHistoryAvailable);
      
      // Check active communities
      const communities = await window.stateManager?.get('communities') || [];
      const activeCommunities = await window.stateManager?.get('ui.activeCommunities') || [];
      section.communities = communities.length;
      section.activeCommunities = activeCommunities;
      section.activeCommunitiesCount = activeCommunities.length;
      console.log('🔍 DIAGNOSTIC: Communities:', communities.length);
      console.log('🔍 DIAGNOSTIC: Active communities:', activeCommunities);
      
      // Check API availability
      section.apiAvailable = typeof window.api !== 'undefined' && typeof window.api.getChatHistory === 'function';
      console.log('🔍 DIAGNOSTIC: API available:', section.apiAvailable);
      
      // Test API call with current URL
      if (section.apiAvailable && activeCommunities.length > 0) {
        try {
          const urlData = await window.normalizeCurrentUrl?.() || {};
          const testUri = urlData.rawUrl || urlData.normalizedUrl || 'https://www.google.com/';
          
          console.log('🔍 DIAGNOSTIC: Testing API call with URI:', testUri);
          const testResponse = await window.api.getChatHistory(
            activeCommunities[0],
            null,
            testUri
          );
          
          section.testApiCall = {
            success: true,
            conversations: testResponse?.conversations?.length || 0,
            messages: testResponse?.messages?.length || 0,
            response: testResponse
          };
          console.log('✅ DIAGNOSTIC: API call successful');
          console.log('🔍 DIAGNOSTIC: Conversations found:', section.testApiCall.conversations);
          console.log('🔍 DIAGNOSTIC: Messages found:', section.testApiCall.messages);
        } catch (apiError) {
          section.testApiCall = {
            success: false,
            error: apiError.message,
            stack: apiError.stack
          };
          console.error('❌ DIAGNOSTIC: API call failed:', apiError);
        }
      }
      
      // Check Supabase client
      section.supabaseAvailable = typeof window.supabase !== 'undefined' && window.supabase !== null;
      section.supabaseFromAvailable = section.supabaseAvailable && typeof window.supabase.from === 'function';
      console.log('🔍 DIAGNOSTIC: Supabase available:', section.supabaseAvailable);
      console.log('🔍 DIAGNOSTIC: Supabase.from available:', section.supabaseFromAvailable);
      
      // Check DOM elements
      const chatMessages = document.querySelector('.chat-messages');
      section.chatMessagesElement = !!chatMessages;
      if (chatMessages) {
        section.chatMessagesVisible = chatMessages.offsetParent !== null;
        section.chatMessagesContent = chatMessages.innerHTML.substring(0, 200);
        const messageElements = chatMessages.querySelectorAll('.message');
        section.messageElementsCount = messageElements.length;
        console.log('🔍 DIAGNOSTIC: Message elements in DOM:', messageElements.length);
      }
      
    } catch (error) {
      section.error = error.message;
      section.stack = error.stack;
      console.error('❌ DIAGNOSTIC: Message loading error:', error);
    }
  }

  async diagnoseVisibilityTab() {
    console.log('🔍 DIAGNOSTIC: Checking visibility tab...');
    const section = this.results.visibilityTab;
    
    try {
      // Check DOM elements
      const visibilityTab = document.getElementById('visibility-tab');
      section.visibilityTabElement = !!visibilityTab;
      section.visibilityTabActive = visibilityTab?.classList.contains('active') || false;
      section.visibilityTabDisplay = visibilityTab ? window.getComputedStyle(visibilityTab).display : 'not found';
      console.log('🔍 DIAGNOSTIC: Visibility tab element:', section.visibilityTabElement);
      console.log('🔍 DIAGNOSTIC: Visibility tab active:', section.visibilityTabActive);
      console.log('🔍 DIAGNOSTIC: Visibility tab display:', section.visibilityTabDisplay);
      
      // Check updateVisibleTab function
      section.updateVisibleTabAvailable = typeof window.updateVisibleTab === 'function';
      console.log('🔍 DIAGNOSTIC: updateVisibleTab available:', section.updateVisibleTabAvailable);
      
      // Check VisibilityManager registration via legacy update hook
      section.visibilityManagerAvailable = section.updateVisibleTabAvailable;
      console.log('🔍 DIAGNOSTIC: VisibilityManager legacy hook available:', section.visibilityManagerAvailable);
      
      // Check visibility data
      section.currentVisibilityData = window.currentVisibilityData;
      section.currentVisibilityDataUnfiltered = window.currentVisibilityDataUnfiltered;
      console.log('🔍 DIAGNOSTIC: Current visibility data:', window.currentVisibilityData);
      console.log('🔍 DIAGNOSTIC: Unfiltered visibility data:', window.currentVisibilityDataUnfiltered);
      
      // Check current user
      section.currentUser = window.currentUser;
      section.currentUserId = window.currentUser?.id || window.currentUser?.user_id;
      console.log('🔍 DIAGNOSTIC: Current user:', window.currentUser);
      console.log('🔍 DIAGNOSTIC: Current user ID:', section.currentUserId);
      
      // Check visibility modal
      const visibilityModal = document.getElementById('visibility-access-modal');
      section.visibilityModalElement = !!visibilityModal;
      section.visibilityModalDisplay = visibilityModal ? window.getComputedStyle(visibilityModal).display : 'not found';
      section.visibilityModalZIndex = visibilityModal ? window.getComputedStyle(visibilityModal).zIndex : 'not found';
      console.log('🔍 DIAGNOSTIC: Visibility modal element:', section.visibilityModalElement);
      console.log('🔍 DIAGNOSTIC: Visibility modal display:', section.visibilityModalDisplay);
      console.log('🔍 DIAGNOSTIC: Visibility modal z-index:', section.visibilityModalZIndex);
      
      // Check VisibilityModalHandler
      section.visibilityModalHandlerAvailable = typeof window.visibilityModalHandler !== 'undefined';
      section.visibilityModalHandlerInitialized = window.visibilityModalHandler?.isInitialized || false;
      console.log('🔍 DIAGNOSTIC: VisibilityModalHandler available:', section.visibilityModalHandlerAvailable);
      console.log('🔍 DIAGNOSTIC: VisibilityModalHandler initialized:', section.visibilityModalHandlerInitialized);
      
      // Test visibility check
      if (window.visibilityModalHandler) {
        try {
          const isVisible = await window.visibilityModalHandler.checkVisibility();
          section.visibilityCheck = {
            isVisible: isVisible,
            working: true
          };
          console.log('🔍 DIAGNOSTIC: User visibility check:', isVisible);
        } catch (error) {
          section.visibilityCheck = {
            error: error.message,
            working: false
          };
          console.error('❌ DIAGNOSTIC: Visibility check failed:', error);
        }
      }
      
      // Check visibility users
      if (window.supabaseRealtimeClient && typeof window.supabaseRealtimeClient.getPageUsers === 'function') {
        try {
          const urlData = await window.normalizeCurrentUrl?.() || {};
          const pageId = urlData.pageId || 'google_com_';
          console.log('🔍 DIAGNOSTIC: Testing getPageUsers with pageId:', pageId);
          const users = await window.supabaseRealtimeClient.getPageUsers(pageId);
          section.pageUsers = {
            count: users?.length || 0,
            users: users,
            working: true
          };
          console.log('✅ DIAGNOSTIC: getPageUsers working, found users:', users?.length || 0);
        } catch (error) {
          section.pageUsers = {
            error: error.message,
            working: false
          };
          console.error('❌ DIAGNOSTIC: getPageUsers failed:', error);
        }
      }
      
    } catch (error) {
      section.error = error.message;
      section.stack = error.stack;
      console.error('❌ DIAGNOSTIC: Visibility tab error:', error);
    }
  }

  async diagnoseApiConnectivity() {
    console.log('🔍 DIAGNOSTIC: Checking API connectivity...');
    const section = this.results.apiConnectivity;
    
    try {
      // Check API module
      section.apiModuleAvailable = typeof window.api !== 'undefined';
      section.apiGetChatHistoryAvailable = typeof window.api?.getChatHistory === 'function';
      console.log('🔍 DIAGNOSTIC: API module available:', section.apiModuleAvailable);
      console.log('🔍 DIAGNOSTIC: api.getChatHistory available:', section.apiGetChatHistoryAvailable);
      
      // Check API base URL
      section.apiBaseUrl = window.API_BASE_URL || 'not set';
      console.log('🔍 DIAGNOSTIC: API base URL:', section.apiBaseUrl);
      
      // Test API endpoint
      if (section.apiModuleAvailable) {
        try {
          const testUrl = `${section.apiBaseUrl}/health`;
          const response = await fetch(testUrl, { method: 'GET' });
          section.healthCheck = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText
          };
          console.log('🔍 DIAGNOSTIC: API health check:', section.healthCheck);
        } catch (error) {
          section.healthCheck = {
            success: false,
            error: error.message
          };
          console.error('❌ DIAGNOSTIC: API health check failed:', error);
        }
      }
      
    } catch (error) {
      section.error = error.message;
      section.stack = error.stack;
      console.error('❌ DIAGNOSTIC: API connectivity error:', error);
    }
  }

  async diagnoseDatabaseQueries() {
    console.log('🔍 DIAGNOSTIC: Checking database queries...');
    const section = this.results.databaseQueries;
    
    try {
      // Check Supabase connection
      section.supabaseAvailable = typeof window.supabase !== 'undefined' && window.supabase !== null;
      console.log('🔍 DIAGNOSTIC: Supabase available:', section.supabaseAvailable);
      
      if (section.supabaseAvailable) {
        // Test messages query
        try {
          const urlData = await window.normalizeCurrentUrl?.() || {};
          const pageId = urlData.pageId || 'google_com_';
          
          console.log('🔍 DIAGNOSTIC: Testing messages query with pageId:', pageId);
          const messagesQuery = window.supabase
            .from('messages')
            .select('*')
            .is('deleted_at', null)
            .eq('page_id', pageId)
            .limit(10);
          
          const { data: messages, error: messagesError } = await messagesQuery;
          
          section.messagesQuery = {
            success: !messagesError,
            count: messages?.length || 0,
            error: messagesError?.message,
            sample: messages?.slice(0, 3)
          };
          console.log('🔍 DIAGNOSTIC: Messages query result:', section.messagesQuery);
          
        } catch (error) {
          section.messagesQuery = {
            success: false,
            error: error.message
          };
          console.error('❌ DIAGNOSTIC: Messages query failed:', error);
        }
        
        // Test presence query
        try {
          const urlData = await window.normalizeCurrentUrl?.() || {};
          const pageId = urlData.pageId || 'google_com_';
          
          console.log('🔍 DIAGNOSTIC: Testing presence query with pageId:', pageId);
          const presenceQuery = window.supabase
            .from('presence')
            .select('*')
            .eq('page_id', pageId)
            .limit(10);
          
          const { data: presence, error: presenceError } = await presenceQuery;
          
          section.presenceQuery = {
            success: !presenceError,
            count: presence?.length || 0,
            error: presenceError?.message,
            sample: presence?.slice(0, 3)
          };
          console.log('🔍 DIAGNOSTIC: Presence query result:', section.presenceQuery);
          
        } catch (error) {
          section.presenceQuery = {
            success: false,
            error: error.message
          };
          console.error('❌ DIAGNOSTIC: Presence query failed:', error);
        }
      }
      
    } catch (error) {
      section.error = error.message;
      section.stack = error.stack;
      console.error('❌ DIAGNOSTIC: Database queries error:', error);
    }
  }

  async runModuleDiagnostics() {
    console.log('🔍 DIAGNOSTIC: Running TypeScript module diagnostics (if available)...');
    const section = this.results.moduleDiagnostics;

    const runners = [
      {
        key: 'messageDisplay',
        fn: window.runMessageDisplayDiagnostic,
        label: 'Message Display Diagnostic'
      },
      {
        key: 'formatting',
        fn: window.runComprehensiveFormattingDiagnostic,
        label: 'Comprehensive Formatting Diagnostic'
      },
      {
        key: 'rootCause',
        fn: window.runRootCauseDiagnostic,
        label: 'Root Cause Diagnostic'
      }
    ];

    for (const { key, fn, label } of runners) {
      if (typeof fn === 'function') {
        try {
          console.log(`🔧 Running ${label}...`);
          const result = await fn();
          section[key] = {
            success: true,
            timestamp: result?.timestamp,
            summary: result
          };
        } catch (error) {
          console.error(`❌ ${label} failed:`, error);
          section[key] = {
            success: false,
            error: error.message
          };
        }
      } else {
        section[key] = {
          success: false,
          error: 'Diagnostic module not registered'
        };
      }
    }
  }

  generateReport() {
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 COMPREHENSIVE DIAGNOSTIC REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Timestamp:', this.results.timestamp);
    console.log('\n');

    // Module Diagnostics Summary
    console.log('🧩 MODULE DIAGNOSTICS:');
    const moduleDiagnostics = this.results.moduleDiagnostics || {};
    Object.entries(moduleDiagnostics).forEach(([name, data]) => {
      console.log(`  ${name}: ${data.success ? '✅' : '❌'}`);
      if (!data.success && data.error) {
        console.log(`    ❌ ERROR: ${data.error}`);
      }
    });
    console.log('\n');
    
    // URL Normalization Report
    console.log('🔍 URL NORMALIZATION:');
    console.log('  Raw URI:', this.results.urlNormalization.rawUri);
    console.log('  Normalized URL:', this.results.urlNormalization.normalizedUrl);
    console.log('  Page ID:', this.results.urlNormalization.pageId);
    console.log('  Normalization Working:', this.results.urlNormalization.normalizationWorking ? '✅' : '❌');
    console.log('  normalizeCurrentUrl Working:', this.results.urlNormalization.normalizeCurrentUrlWorking ? '✅' : '❌');
    if (this.results.urlNormalization.error) {
      console.log('  ❌ ERROR:', this.results.urlNormalization.error);
    }
    console.log('\n');
    
    // Message Loading Report
    console.log('💬 MESSAGE LOADING:');
    console.log('  loadChatHistory Available:', this.results.messageLoading.loadChatHistoryAvailable ? '✅' : '❌');
    console.log('  Active Communities:', this.results.messageLoading.activeCommunitiesCount || 0);
    console.log('  API Available:', this.results.messageLoading.apiAvailable ? '✅' : '❌');
    console.log('  Supabase Available:', this.results.messageLoading.supabaseAvailable ? '✅' : '❌');
    if (this.results.messageLoading.testApiCall) {
      console.log('  Test API Call:', this.results.messageLoading.testApiCall.success ? '✅' : '❌');
      console.log('    Conversations Found:', this.results.messageLoading.testApiCall.conversations || 0);
      console.log('    Messages Found:', this.results.messageLoading.testApiCall.messages || 0);
      if (this.results.messageLoading.testApiCall.error) {
        console.log('    ❌ ERROR:', this.results.messageLoading.testApiCall.error);
      }
    }
    console.log('  Message Elements in DOM:', this.results.messageLoading.messageElementsCount || 0);
    if (this.results.messageLoading.error) {
      console.log('  ❌ ERROR:', this.results.messageLoading.error);
    }
    console.log('\n');
    
    // Visibility Tab Report
    console.log('👁️ VISIBILITY TAB:');
    console.log('  Visibility Tab Element:', this.results.visibilityTab.visibilityTabElement ? '✅' : '❌');
    console.log('  Visibility Tab Active:', this.results.visibilityTab.visibilityTabActive ? '✅' : '❌');
    console.log('  Visibility Tab Display:', this.results.visibilityTab.visibilityTabDisplay);
    console.log('  updateVisibleTab Available:', this.results.visibilityTab.updateVisibleTabAvailable ? '✅' : '❌');
    console.log('  VisibilityModalHandler Initialized:', this.results.visibilityTab.visibilityModalHandlerInitialized ? '✅' : '❌');
    console.log('  Visibility Modal Element:', this.results.visibilityTab.visibilityModalElement ? '✅' : '❌');
    console.log('  Visibility Modal Display:', this.results.visibilityTab.visibilityModalDisplay);
    console.log('  Visibility Modal Z-Index:', this.results.visibilityTab.visibilityModalZIndex);
    if (this.results.visibilityTab.pageUsers) {
      console.log('  Page Users Found:', this.results.visibilityTab.pageUsers.count || 0);
      console.log('  getPageUsers Working:', this.results.visibilityTab.pageUsers.working ? '✅' : '❌');
    }
    if (this.results.visibilityTab.error) {
      console.log('  ❌ ERROR:', this.results.visibilityTab.error);
    }
    console.log('\n');
    
    // API Connectivity Report
    console.log('🌐 API CONNECTIVITY:');
    console.log('  API Module Available:', this.results.apiConnectivity.apiModuleAvailable ? '✅' : '❌');
    console.log('  API Base URL:', this.results.apiConnectivity.apiBaseUrl);
    if (this.results.apiConnectivity.healthCheck) {
      console.log('  Health Check:', this.results.apiConnectivity.healthCheck.success ? '✅' : '❌');
      console.log('    Status:', this.results.apiConnectivity.healthCheck.status);
    }
    console.log('\n');
    
    // Database Queries Report
    console.log('🗄️ DATABASE QUERIES:');
    console.log('  Supabase Available:', this.results.databaseQueries.supabaseAvailable ? '✅' : '❌');
    if (this.results.databaseQueries.messagesQuery) {
      console.log('  Messages Query:', this.results.databaseQueries.messagesQuery.success ? '✅' : '❌');
      console.log('    Messages Found:', this.results.databaseQueries.messagesQuery.count || 0);
      if (this.results.databaseQueries.messagesQuery.error) {
        console.log('    ❌ ERROR:', this.results.databaseQueries.messagesQuery.error);
      }
    }
    if (this.results.databaseQueries.presenceQuery) {
      console.log('  Presence Query:', this.results.databaseQueries.presenceQuery.success ? '✅' : '❌');
      console.log('    Presence Records Found:', this.results.databaseQueries.presenceQuery.count || 0);
      if (this.results.databaseQueries.presenceQuery.error) {
        console.log('    ❌ ERROR:', this.results.databaseQueries.presenceQuery.error);
      }
    }
    console.log('\n');
    
    // Root Cause Analysis
    console.log('🔍 ROOT CAUSE ANALYSIS:');
    const issues = [];
    
    if (!this.results.urlNormalization.normalizationWorking) {
      issues.push('❌ URL normalization is not working');
    }
    
    if (!this.results.messageLoading.loadChatHistoryAvailable) {
      issues.push('❌ loadChatHistory function is not available');
    }
    
    if (this.results.messageLoading.activeCommunitiesCount === 0) {
      issues.push('❌ No active communities - messages cannot load');
    }
    
    if (this.results.messageLoading.testApiCall && !this.results.messageLoading.testApiCall.success) {
      issues.push('❌ API call is failing: ' + (this.results.messageLoading.testApiCall.error || 'Unknown error'));
    }
    
    if (this.results.messageLoading.testApiCall && this.results.messageLoading.testApiCall.conversations === 0) {
      issues.push('⚠️ API call succeeds but returns 0 conversations - may be no messages in database');
    }
    
    if (!this.results.visibilityTab.visibilityTabElement) {
      issues.push('❌ Visibility tab DOM element not found');
    }
    
    if (!this.results.visibilityTab.updateVisibleTabAvailable) {
      issues.push('❌ updateVisibleTab function is not available');
    }
    
    if (!this.results.visibilityTab.visibilityModalHandlerInitialized) {
      issues.push('❌ VisibilityModalHandler is not initialized');
    }
    
    if (this.results.visibilityTab.visibilityModalDisplay === 'none') {
      issues.push('⚠️ Visibility modal is hidden (display: none)');
    }
    
    if (issues.length === 0) {
      console.log('  ✅ No critical issues found');
    } else {
      issues.forEach(issue => console.log('  ' + issue));
    }
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 Full diagnostic data available in window.comprehensiveDiagnosticResults');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Store results globally
    window.comprehensiveDiagnosticResults = this.results;
    
    return this.results;
  }
}

// Export for global access
window.ComprehensiveDiagnostic = ComprehensiveDiagnostic;

// Auto-run if called directly
if (typeof window !== 'undefined') {
  window.runComprehensiveDiagnostic = async () => {
    const diagnostic = new ComprehensiveDiagnostic();
    return await diagnostic.runFullDiagnostic();
  };
  
  console.log('✅ ComprehensiveDiagnostic loaded. Call runComprehensiveDiagnostic() to run full diagnostic.');
}

