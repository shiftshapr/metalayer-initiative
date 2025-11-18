/**
 * AGENT MODULE - AI Agent Functionality
 * Handles all AI agent and automation functionality
 */
declare class AgentModule {
    private logLevel;
    private isInitialized;
    /**
     * Initialize AgentModule
     */
    initialize(): Promise<void>;
    /**
     * Logging utility
     */
    private log;
}
declare function testAgent(message: string): Promise<void>;
declare function initializeAgentTab(): void;
export { AgentModule, initializeAgentTab, testAgent };
//# sourceMappingURL=AgentModule.d.ts.map