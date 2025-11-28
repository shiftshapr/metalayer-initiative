/**
 * DIAGNOSTIC: .cursorrules Violation Detection
 *
 * Checks for files in extension/ or dist/ that should be in src/
 * Identifies build artifact violations
 */
const violations = [];
// Check for services in extension/ that should be in src/
const extensionServices = [
    'MessageRendererService.js',
    'MessageLoadingService.js',
    'MessageActionListenersService.js'
];
extensionServices.forEach(service => {
    violations.push({
        file: `presence/extension/services/${service}`,
        issue: 'Service created in extension/ (build artifact) instead of src/',
        shouldBeIn: `presence/src/services/${service.replace('.js', '.ts')}`,
        severity: 'critical'
    });
});
console.log('=== .cursorrules Violation Diagnostic ===\n');
console.log(`Found ${violations.length} critical violations:\n`);
violations.forEach((v, i) => {
    console.log(`${i + 1}. ${v.severity.toUpperCase()}: ${v.file}`);
    console.log(`   Issue: ${v.issue}`);
    console.log(`   Should be: ${v.shouldBeIn}\n`);
});
console.log('\n=== Solution ===');
console.log('1. Convert JavaScript services to TypeScript');
console.log('2. Move to src/services/');
console.log('3. Build with: npm run build:presence');
console.log('4. Delete from extension/services/ (will be synced from dist/)');
export { violations };
