/**
 * Migration Script: Monolithic to Modular Architecture
 * 
 * This script helps migrate from the monolithic sidepanel.js to the new modular architecture
 * It provides backward compatibility while gradually moving functionality to the new system
 */

class ModularMigration {
  constructor() {
    this.logger = window.Logger || console;
    this.legacyFunctions = new Map();
    this.migrationStatus = {
      logger: false,
      supabase: false,
      visibility: false,
      core: false
    };
  }

  /**
   * Initialize migration
   */
  async initialize() {
    try {
      this.logger.startFlow('MIGRATION_INIT');
      
      // Check if new architecture is available
      await this.checkNewArchitecture();
      
      // Set up legacy function mapping
      this.setupLegacyMapping();
      
      // Initialize new architecture
      await this.initializeNewArchitecture();
      
      this.logger.endFlow('MIGRATION_INIT', true);
    } catch (error) {
      this.logger.endFlow('MIGRATION_INIT', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Check if new architecture components are available
   */
  async checkNewArchitecture() {
    const checks = {
      Logger: typeof window.Logger !== 'undefined',
      SupabaseService: typeof window.SupabaseService !== 'undefined',
      VisibilityManager: typeof window.VisibilityManager !== 'undefined',
      SidepanelCore: typeof window.SidepanelCore !== 'undefined'
    };

    this.logger.info('MIGRATION', 'New architecture availability', checks);
    
    const missing = Object.entries(checks).filter(([name, available]) => !available);
    if (missing.length > 0) {
      throw new Error(`Missing new architecture components: ${missing.map(([name]) => name).join(', ')}`);
    }
  }

  /**
   * Set up legacy function mapping
   */
  setupLegacyMapping() {
    // Map legacy functions to new architecture
    this.legacyFunctions.set('refreshVisibilityAvatars', () => {
      if (window.sidepanelCore && window.sidepanelCore.getFeature('visibility')) {
        const currentPage = window.currentUrlData?.pageId;
        if (currentPage) {
          return window.sidepanelCore.getFeature('visibility').refreshVisibilityAvatars(currentPage);
        }
      }
      this.logger.warn('MIGRATION', 'refreshVisibilityAvatars called but no current page');
    });

    this.legacyFunctions.set('testExtensionHealth', () => {
      if (window.sidepanelCore) {
        const status = window.sidepanelCore.getStatus();
        return {
          status: 'COMPLETE',
          newArchitecture: true,
          services: status.services,
          features: status.features
        };
      }
      return { status: 'FAILED', error: 'New architecture not available' };
    });
  }

  /**
   * Initialize new architecture
   */
  async initializeNewArchitecture() {
    try {
      // Initialize SidepanelCore
      window.sidepanelCore = new window.SidepanelCore();
      
      const config = {
        logger: {
          level: window.Logger.LOG_LEVELS.DEBUG,
          production: false
        },
        services: {
          supabase: {
            url: 'https://zwxomzkmncwzwryvudwu.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM'
          }
        }
      };
      
      await window.sidepanelCore.initialize(config);
      
      this.logger.info('MIGRATION', 'New architecture initialized successfully');
    } catch (error) {
      this.logger.error('MIGRATION', 'Failed to initialize new architecture', { error: error.message });
      throw error;
    }
  }

  /**
   * Create legacy function wrappers
   */
  createLegacyWrappers() {
    // Wrap legacy functions to use new architecture
    if (typeof window.refreshVisibilityAvatars === 'undefined') {
      window.refreshVisibilityAvatars = this.legacyFunctions.get('refreshVisibilityAvatars');
    }

    if (typeof window.testExtensionHealth === 'undefined') {
      window.testExtensionHealth = this.legacyFunctions.get('testExtensionHealth');
    }
  }

  /**
   * Get migration status
   */
  getStatus() {
    return {
      newArchitecture: {
        Logger: typeof window.Logger !== 'undefined',
        SupabaseService: typeof window.SupabaseService !== 'undefined',
        VisibilityManager: typeof window.VisibilityManager !== 'undefined',
        SidepanelCore: typeof window.SidepanelCore !== 'undefined'
      },
      coreInitialized: !!window.sidepanelCore,
      legacyWrappers: this.legacyFunctions.size,
      migrationComplete: this.isMigrationComplete()
    };
  }

  /**
   * Check if migration is complete
   */
  isMigrationComplete() {
    return window.sidepanelCore && 
           window.sidepanelCore.isInitialized &&
           window.sidepanelCore.getFeature('visibility') &&
           window.sidepanelCore.getService('supabase');
  }

  /**
   * Test new architecture
   */
  async testNewArchitecture() {
    try {
      this.logger.startFlow('ARCHITECTURE_TEST');
      
      if (!window.sidepanelCore) {
        throw new Error('SidepanelCore not initialized');
      }

      // Test services
      const supabaseStatus = window.sidepanelCore.getService('supabase').getStatus();
      this.logger.debug('MIGRATION', 'Supabase service status', supabaseStatus);

      // Test features
      const visibilityStatus = window.sidepanelCore.getFeature('visibility').getStatus();
      this.logger.debug('MIGRATION', 'Visibility feature status', visibilityStatus);

      this.logger.endFlow('ARCHITECTURE_TEST', true);
      return { success: true, supabaseStatus, visibilityStatus };
    } catch (error) {
      this.logger.endFlow('ARCHITECTURE_TEST', false, { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

// Initialize migration when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🔄 MIGRATION: Starting modular architecture migration...');
    
    window.modularMigration = new ModularMigration();
    await window.modularMigration.initialize();
    
    // Create legacy wrappers
    window.modularMigration.createLegacyWrappers();
    
    console.log('✅ MIGRATION: Modular architecture migration complete');
    console.log('📊 MIGRATION STATUS:', window.modularMigration.getStatus());
  } catch (error) {
    console.error('❌ MIGRATION: Migration failed:', error);
  }
});

// Export for testing
if (typeof window !== 'undefined') {
  window.ModularMigration = ModularMigration;
}

console.log('✅ Migration script loaded');

