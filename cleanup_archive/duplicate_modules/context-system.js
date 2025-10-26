/**
 * System Context Awareness Registry
 * 
 * This system tracks what components exist, their current state, and prevents
 * unnecessary recreation of working systems.
 */

class SystemContextRegistry {
  constructor() {
    this.components = new Map();
    this.changeHistory = [];
    this.workingFeatures = new Set();
    this.knownIssues = new Map();
    
    this.initializeKnownComponents();
  }

  /**
   * Initialize with currently known working components
   */
  initializeKnownComponents() {
    // Server Components
    this.registerComponent('server', {
      name: 'canopi2-server.js',
      status: 'working',
      description: 'Main backend server with PostgreSQL database',
      location: '/home/ubuntu/metalayer-initiative/canopi2-server.js',
      dependencies: ['PostgreSQL', 'Prisma'],
      lastVerified: new Date().toISOString(),
      features: ['message persistence', 'reaction system', 'user authentication', 'community filtering']
    });

    // Database Components
    this.registerComponent('database', {
      name: 'PostgreSQL with Prisma',
      status: 'working',
      description: 'Database with proper schema and migrations',
      location: 'postgresql://postgres:postgres@localhost:5432/canopi',
      dependencies: ['Prisma Client'],
      lastVerified: new Date().toISOString(),
      features: ['message storage', 'reaction storage', 'user management', 'conversation threading']
    });

    // Reaction System
    this.registerComponent('reaction-system', {
      name: 'Semantic Reaction Mapping',
      status: 'working',
      description: 'Complete reaction system with semantic mapping and emoji persistence',
      location: '/home/ubuntu/metalayer-initiative/presence/sidepanel.js',
      dependencies: ['database', 'server'],
      lastVerified: new Date().toISOString(),
      features: ['6 reaction types', 'emoji persistence', 'semantic mapping', 'API integration'],
      mapping: {
        '👍': 'AGREE',
        '❓': 'QUESTION',
        '🔁': 'CLARIFY',
        '🔗': 'CITE',
        '⚠️': 'FLAG',
        '🙅': 'DISAGREE'
      }
    });

    // Frontend Components
    this.registerComponent('frontend', {
      name: 'Chrome Extension Sidepanel',
      status: 'working',
      description: 'Complete frontend with message display, reactions, and threading',
      location: '/home/ubuntu/metalayer-initiative/presence/',
      dependencies: ['server', 'reaction-system'],
      lastVerified: new Date().toISOString(),
      features: ['message display', 'reaction UI', 'thread navigation', 'dark/light mode', 'inline editing']
    });

    // Authentication System
    this.registerComponent('auth', {
      name: 'User Authentication',
      status: 'working',
      description: 'UUID-based user authentication with email mapping',
      location: 'canopi2-server.js (auth middleware)',
      dependencies: ['database'],
      lastVerified: new Date().toISOString(),
      features: ['email-based auth', 'UUID generation', 'user persistence']
    });
  }

  /**
   * Register a component in the system
   */
  registerComponent(id, component) {
    this.components.set(id, {
      ...component,
      registeredAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
    
    if (component.status === 'working') {
      this.workingFeatures.add(id);
    }
    
    this.logChange('register', id, `Registered component: ${component.name}`);
  }

  /**
   * Check if a component exists and is working
   */
  checkComponent(id) {
    const component = this.components.get(id);
    if (!component) {
      console.warn(`⚠️  Component '${id}' not found in registry`);
      return false;
    }
    
    if (component.status === 'working') {
      console.log(`✅ ${component.name} is working`);
      return true;
    } else {
      console.warn(`❌ ${component.name} has status: ${component.status}`);
      return false;
    }
  }

  /**
   * Get component information
   */
  getComponent(id) {
    return this.components.get(id);
  }

  /**
   * List all working components
   */
  getWorkingComponents() {
    return Array.from(this.components.entries())
      .filter(([id, component]) => component.status === 'working')
      .map(([id, component]) => ({ id, ...component }));
  }

  /**
   * Check if a change is necessary
   */
  isChangeNecessary(componentId, proposedChange) {
    const component = this.components.get(componentId);
    if (!component) {
      console.log(`🆕 Component '${componentId}' doesn't exist - change is necessary`);
      return true;
    }

    if (component.status === 'working') {
      console.log(`⚠️  Component '${componentId}' is already working - consider if change is necessary`);
      console.log(`   Current: ${component.description}`);
      console.log(`   Proposed: ${proposedChange}`);
      return false;
    }

    return true;
  }

  /**
   * Record a change to the system
   */
  recordChange(componentId, change, reason) {
    const changeRecord = {
      timestamp: new Date().toISOString(),
      componentId,
      change,
      reason,
      before: this.components.get(componentId)?.status || 'unknown',
      after: 'modified'
    };
    
    this.changeHistory.push(changeRecord);
    this.logChange('modify', componentId, `${change} - Reason: ${reason}`);
  }

  /**
   * Add a known issue
   */
  addKnownIssue(componentId, issue, severity = 'medium') {
    if (!this.knownIssues.has(componentId)) {
      this.knownIssues.set(componentId, []);
    }
    
    this.knownIssues.get(componentId).push({
      issue,
      severity,
      reportedAt: new Date().toISOString()
    });
    
    console.log(`🐛 Added issue to ${componentId}: ${issue} (${severity})`);
  }

  /**
   * Get system health report
   */
  getSystemHealth() {
    const totalComponents = this.components.size;
    const workingComponents = this.getWorkingComponents().length;
    const totalIssues = Array.from(this.knownIssues.values()).flat().length;
    
    return {
      totalComponents,
      workingComponents,
      healthPercentage: Math.round((workingComponents / totalComponents) * 100),
      totalIssues,
      lastChange: this.changeHistory[this.changeHistory.length - 1]?.timestamp,
      workingFeatures: Array.from(this.workingFeatures)
    };
  }

  /**
   * Log changes for debugging
   */
  logChange(action, componentId, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      componentId,
      details
    };
    
    console.log(`📝 [${action.toUpperCase()}] ${componentId}: ${details}`);
  }

  /**
   * Export system state for backup
   */
  exportState() {
    return {
      components: Object.fromEntries(this.components),
      changeHistory: this.changeHistory,
      workingFeatures: Array.from(this.workingFeatures),
      knownIssues: Object.fromEntries(this.knownIssues),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import system state from backup
   */
  importState(state) {
    this.components = new Map(Object.entries(state.components));
    this.changeHistory = state.changeHistory || [];
    this.workingFeatures = new Set(state.workingFeatures || []);
    this.knownIssues = new Map(Object.entries(state.knownIssues || {}));
    
    console.log(`📥 Imported system state from ${state.exportedAt}`);
  }
}

// Create global instance
const systemContext = new SystemContextRegistry();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SystemContextRegistry, systemContext };
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.systemContext = systemContext;
}

// Log system health on initialization
console.log('🏥 System Health:', systemContext.getSystemHealth());
console.log('✅ Working Components:', systemContext.getWorkingComponents().map(c => c.name));
