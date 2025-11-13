/**
 * Profile Selector Component
 * Handles profile search and selection
 */

export class ProfileSelector {
  constructor(modalElement, app) {
    this.modal = modalElement;
    this.app = app;
    this.searchInput = modalElement.querySelector('#profile-search-input');
    this.resultsContainer = modalElement.querySelector('#profile-search-results');
    this.listeners = new Map();
  }

  show() {
    this.modal.classList.remove('hidden');
    this.searchInput.focus();
    this.setupEventListeners();
  }

  hide() {
    this.modal.classList.add('hidden');
    this.searchInput.value = '';
    this.resultsContainer.innerHTML = '';
  }

  setupEventListeners() {
    // TODO: Hook up search to `TimelineQuery.searchUsers()` with 300ms debounce and render results list.
    // TODO: Handle selection (click + keyboard) to emit `profile:selected` with the chosen UUID/handle.
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

