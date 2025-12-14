/**
 * StateManager - Application state management
 */
class StateManager {
  private state: Record<string, unknown> = {};

  getState(key: string): unknown {
    return this.state[key];
  }

  setState(key: string, value: unknown): void {
    this.state[key] = value;
  }
}

export const stateManagerInstance = new StateManager();

// Export getState as a standalone function for convenience
export const getState = stateManagerInstance.getState.bind(stateManagerInstance);
export const setState = stateManagerInstance.setState.bind(stateManagerInstance);

// Export the class for cases where direct instantiation is needed
export { StateManager };