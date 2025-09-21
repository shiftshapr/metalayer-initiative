/**
 * Example of how to use the Context System
 * 
 * This demonstrates how to check existing components before making changes
 * and how to record changes for future reference.
 */

const { systemContext } = require('./context-system.js');

// Example 1: Check if a component exists before making changes
function checkBeforeModifying(componentId, proposedChange) {
  console.log(`\n🔍 Checking component: ${componentId}`);
  
  if (!systemContext.checkComponent(componentId)) {
    console.log(`❌ Component '${componentId}' not found or not working`);
    return false;
  }
  
  const component = systemContext.getComponent(componentId);
  console.log(`✅ Component found: ${component.name}`);
  console.log(`   Status: ${component.status}`);
  console.log(`   Description: ${component.description}`);
  
  // Check if change is necessary
  if (!systemContext.isChangeNecessary(componentId, proposedChange)) {
    console.log(`⚠️  Change may not be necessary - component is already working`);
    return false;
  }
  
  console.log(`✅ Change appears necessary`);
  return true;
}

// Example 2: Record a change after making it
function recordChange(componentId, change, reason) {
  console.log(`\n📝 Recording change to ${componentId}`);
  systemContext.recordChange(componentId, change, reason);
  
  // Update component status if needed
  const component = systemContext.getComponent(componentId);
  if (component) {
    component.lastModified = new Date().toISOString();
    console.log(`✅ Component updated: ${component.name}`);
  }
}

// Example 3: Add a known issue
function reportIssue(componentId, issue, severity = 'medium') {
  console.log(`\n🐛 Reporting issue for ${componentId}`);
  systemContext.addKnownIssue(componentId, issue, severity);
}

// Example 4: Get system overview
function showSystemOverview() {
  console.log(`\n📊 System Overview`);
  const health = systemContext.getSystemHealth();
  console.log(`   Health: ${health.healthPercentage}% (${health.workingComponents}/${health.totalComponents} components)`);
  console.log(`   Issues: ${health.totalIssues}`);
  console.log(`   Working Features: ${health.workingFeatures.join(', ')}`);
  
  console.log(`\n✅ Working Components:`);
  systemContext.getWorkingComponents().forEach(component => {
    console.log(`   - ${component.name}: ${component.description}`);
  });
}

// Example 5: Simulate a development scenario
function simulateDevelopmentScenario() {
  console.log(`\n🎭 Simulating Development Scenario`);
  console.log(`Scenario: User reports reaction system issue`);
  
  // Step 1: Check if reaction system exists
  if (checkBeforeModifying('reaction-system', 'Fix missing CLARIFY reaction type')) {
    console.log(`\n🔧 Making targeted fix...`);
    
    // Step 2: Record the change
    recordChange('reaction-system', 'Added CLARIFY to ReactionKind enum', 'User requested missing reaction type');
    
    // Step 3: Verify the fix worked
    console.log(`\n✅ Fix applied successfully`);
    
    // Step 4: Show updated system state
    showSystemOverview();
  } else {
    console.log(`\n❌ No changes made - component check failed`);
  }
}

// Run examples
console.log(`🚀 Context System Usage Examples\n`);

// Show current system state
showSystemOverview();

// Simulate a development scenario
simulateDevelopmentScenario();

// Example of checking a non-existent component
console.log(`\n🔍 Testing with non-existent component:`);
checkBeforeModifying('non-existent-component', 'Create new component');

// Example of reporting an issue
reportIssue('frontend', 'Dark mode toggle sometimes does not persist', 'low');

// Show final system state
console.log(`\n📊 Final System State:`);
showSystemOverview();
