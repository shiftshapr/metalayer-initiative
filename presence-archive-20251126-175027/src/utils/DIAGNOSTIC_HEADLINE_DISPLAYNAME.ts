/**
 * DIAGNOSTIC SCRIPT: Headline and DisplayName Save Issues
 * 
 * This script diagnoses why headline and displayName are not persisting to the database
 * despite successful API responses.
 */

// Type definitions
interface ChromeStorage {
  settingsHeadline?: string;
  displayName?: string;
}

interface UserData {
  id?: string;
  headline?: string;
  displayName?: string;
  display_name?: string;
}

interface ApiResponse extends UserData {
  error?: string;
}

// Declare window globals
declare const window: Window & {
  currentUser?: UserData;
  userPreferencesManager?: {
    getPreference: (key: string) => Promise<string | null>;
    savePreference: (key: string, value: string, options?: { batch?: boolean }) => Promise<boolean>;
  };
  api?: {
    request: (url: string, options: { method: string }) => Promise<ApiResponse>;
  };
};

/**
 * Diagnoses headline and displayName save issues
 */
export async function diagnoseHeadlineDisplayName(): Promise<void> {
  console.log('🔍 DIAGNOSTIC: Starting headline and displayName diagnostic...');
  
  const userId = window.currentUser?.id;
  if (!userId) {
    console.error('❌ DIAGNOSTIC: No user ID available');
    return;
  }
  
  console.log('🔍 DIAGNOSTIC: User ID:', userId);
  
  // Check Chrome storage
  const chromeStorage = await chrome.storage.local.get(['settingsHeadline', 'displayName']) as ChromeStorage;
  console.log('🔍 DIAGNOSTIC: Chrome storage:', chromeStorage);
  
  // Check window.currentUser
  console.log('🔍 DIAGNOSTIC: window.currentUser.headline:', window.currentUser?.headline);
  console.log('🔍 DIAGNOSTIC: window.currentUser.displayName:', window.currentUser?.displayName);
  
  // Check UserPreferencesManager
  if (window.userPreferencesManager) {
    const headline = await window.userPreferencesManager.getPreference('headline');
    const displayName = await window.userPreferencesManager.getPreference('displayName');
    console.log('🔍 DIAGNOSTIC: UserPreferencesManager headline:', headline);
    console.log('🔍 DIAGNOSTIC: UserPreferencesManager displayName:', displayName);
  }
  
  // Try to fetch from API
  try {
    if (window.api) {
      const response = await window.api.request(`/v1/users/${userId}`, {
        method: 'GET'
      });
      console.log('🔍 DIAGNOSTIC: API response:', response);
      const responseData = response as Record<string, unknown> | undefined;
      console.log('🔍 DIAGNOSTIC: API headline:', responseData?.headline);
      console.log('🔍 DIAGNOSTIC: API displayName:', responseData?.displayName);
      console.log('🔍 DIAGNOSTIC: API display_name (snake_case):', responseData?.display_name);
    }
  } catch (error) {
    console.error('❌ DIAGNOSTIC: API fetch failed:', error);
  }
  
  // Test save operation with detailed logging
  console.log('🔍 DIAGNOSTIC: Testing save operation...');
  if (window.userPreferencesManager && window.api) {
    try {
      const testHeadline = 'Test headline for diagnostic purposes - this should be saved';
      
      console.log('🔍 DIAGNOSTIC: Attempting to save headline:', testHeadline);
      const headlineResult = await window.userPreferencesManager.savePreference('headline', testHeadline, { batch: false });
      console.log('🔍 DIAGNOSTIC: Headline save result:', headlineResult);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify it was saved
      const verifyResponse = await window.api.request(`/v1/users/${userId}`, {
        method: 'GET'
      });
      const verifyData = verifyResponse as Record<string, unknown> | undefined;
      console.log('🔍 DIAGNOSTIC: After save - API headline:', verifyData?.headline);
      console.log('🔍 DIAGNOSTIC: After save - API displayName:', verifyData?.displayName);
      
      if (verifyData?.headline !== testHeadline) {
        console.error('❌ DIAGNOSTIC: Headline was not saved correctly!');
        console.error('❌ DIAGNOSTIC: Expected:', testHeadline);
        console.error('❌ DIAGNOSTIC: Got:', verifyData?.headline);
      } else {
        console.log('✅ DIAGNOSTIC: Headline save verified successfully');
      }
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Save test failed:', error);
    }
  }
  
  console.log('🔍 DIAGNOSTIC: Diagnostic complete');
}

// Auto-attach to window if in browser environment (for backward compatibility)
if (typeof window !== 'undefined') {
  (window as Window & { diagnoseHeadlineDisplayName?: typeof diagnoseHeadlineDisplayName }).diagnoseHeadlineDisplayName = diagnoseHeadlineDisplayName;
  console.log('✅ DIAGNOSTIC: Call diagnoseHeadlineDisplayName() to run diagnostic');
}

