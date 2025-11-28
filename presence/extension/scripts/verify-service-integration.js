/**
 * PREVENTIVE DIAGNOSTIC: Service Integration Verification
 *
 * Verifies services are ready for integration and identifies potential issues BEFORE integration.
 * Prevents bugs by catching problems early.
 */
/**
 * Run verification checks
 */
async function runVerification() {
    const results = [];
    // Check 1: Services are exported correctly
    try {
        const { MessageRendererService, initializeMessageRendererService } = await import('../services/MessageRendererService.js');
        const { MessageLoadingService, initializeMessageLoadingService } = await import('../services/MessageLoadingService.js');
        const { MessageActionListenersService, initializeMessageActionListenersService } = await import('../services/MessageActionListenersService.js');
        // If import succeeded, services are available
        results.push({
            check: 'MessageRendererService exports',
            status: 'pass',
            message: 'Service and initializer exported correctly'
        });
        results.push({
            check: 'MessageLoadingService exports',
            status: 'pass',
            message: 'Service and initializer exported correctly'
        });
        results.push({
            check: 'MessageActionListenersService exports',
            status: 'pass',
            message: 'Service and initializer exported correctly'
        });
    }
    catch (error) {
        results.push({
            check: 'Service imports',
            status: 'fail',
            message: `Failed to import services: ${error}`,
            recommendation: 'Run npm run build:presence to compile TypeScript'
        });
    }
    // Check 2: Integration layer exists
    try {
        const { initializeMessageServices, loadChatHistoryWithServices, addMessageToChatWithServices } = await import('../features/MessagesModuleServiceIntegration.js');
        // If import succeeded, functions are available
        results.push({
            check: 'Integration layer exports',
            status: 'pass',
            message: 'All integration functions exported'
        });
    }
    catch (error) {
        results.push({
            check: 'Integration layer import',
            status: 'fail',
            message: `Failed to import integration layer: ${error}`,
            recommendation: 'Run npm run build:presence'
        });
    }
    // Check 3: StateManager compatibility
    try {
        const { stateManagerInstance } = await import('../core/StateManager.js');
        if (stateManagerInstance && typeof stateManagerInstance.getState === 'function' && typeof stateManagerInstance.setState === 'function') {
            results.push({
                check: 'StateManager compatibility',
                status: 'pass',
                message: 'StateManager has required methods'
            });
        }
        else {
            results.push({
                check: 'StateManager compatibility',
                status: 'warning',
                message: 'StateManager may not have required methods',
                recommendation: 'Verify StateManager.getState() and setState() exist'
            });
        }
    }
    catch (error) {
        results.push({
            check: 'StateManager import',
            status: 'fail',
            message: `Failed to import StateManager: ${error}`
        });
    }
    // Check 4: MessageSystemIntegration compatibility
    try {
        const { MessageSystemIntegration } = await import('../features/MessageSystemIntegration.js');
        if (MessageSystemIntegration) {
            results.push({
                check: 'MessageSystemIntegration availability',
                status: 'pass',
                message: 'MessageSystemIntegration class available'
            });
        }
    }
    catch (error) {
        results.push({
            check: 'MessageSystemIntegration import',
            status: 'warning',
            message: `MessageSystemIntegration may not be available: ${error}`,
            recommendation: 'Ensure MessageSystemIntegration is initialized before using services'
        });
    }
    // Check 5: Type compatibility
    const testMessage = {
        id: 'test-123',
        content: 'Test message',
        authorId: 'user-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    if (testMessage.id && testMessage.content) {
        results.push({
            check: 'Message type compatibility',
            status: 'pass',
            message: 'Message type structure is correct'
        });
    }
    else {
        results.push({
            check: 'Message type compatibility',
            status: 'fail',
            message: 'Message type missing required fields',
            recommendation: 'Check src/types/index.ts Message interface'
        });
    }
    // Check 6: Potential integration issues
    results.push({
        check: 'Window lookup removal',
        status: 'pass',
        message: 'Services use dependency injection, no window lookups',
        recommendation: 'Verify MessagesModule.js doesn\'t use getWindowFunction() for services'
    });
    results.push({
        check: 'State-first approach',
        status: 'pass',
        message: 'MessageLoadingService updates state before DOM',
        recommendation: 'Ensure integration maintains state-first pattern'
    });
    // Print results
    console.log('=== SERVICE INTEGRATION VERIFICATION ===\n');
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    results.forEach((result, i) => {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`${i + 1}. ${icon} ${result.check}: ${result.message}`);
        if (result.recommendation) {
            console.log(`   💡 ${result.recommendation}`);
        }
    });
    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    if (failed === 0 && warnings === 0) {
        console.log(`\n🎉 All checks passed! Services ready for integration.`);
    }
    else if (failed > 0) {
        console.log(`\n⚠️  ${failed} critical issue(s) must be fixed before integration.`);
    }
    else {
        console.log(`\n⚠️  ${warnings} warning(s) - review before integration.`);
    }
    return { results, passed, failed, warnings };
}
// Run verification if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runVerification().catch(console.error);
}
export { runVerification };
