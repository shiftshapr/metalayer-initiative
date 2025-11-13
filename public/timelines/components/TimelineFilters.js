/**
 * Timeline Filters Component
 * Handles filter controls
 */

export class TimelineFilters {
  constructor(container, timelineManager) {
    this.container = container;
    this.timelineManager = timelineManager;
  }

  render() {
    // TODO: Replace static markup with templating that hydrates communities/activity types from TimelineManager
    this.container.innerHTML = `
      <div class="filter-group">
        <input type="text" id="search-filter" placeholder="Search timeline..." class="input-field">
        <select id="community-filter" class="select-input">
          <option value="">All Communities</option>
        </select>
        <select id="activity-type-filter" class="select-input" multiple>
          <option value="message">Messages</option>
          <option value="reaction">Reactions</option>
          <option value="bookmark">Bookmarks</option>
          <option value="profileUpdate">Profile Updates</option>
        </select>
      </div>
    `;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // TODO: Wire inputs to call `timelineManager.applyFilters` and trigger a re-render (include debounce for search).
  }
}

