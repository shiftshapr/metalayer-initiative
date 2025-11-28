/**
 * Right Sidebar Component (Column C)
 * Handles Search, Top Timelines, Top Posts, Top Canopies
 */

import { TopDisplay, type TopDisplayItem, type TopDisplayConfig } from './TopDisplay.js';

interface Timeline {
  id: string;
  title: string;
  description?: string;
  entryCount?: number;
  contributorCount?: number;
  [key: string]: any;
}

interface Post {
  id: string;
  content: string;
  author?: string;
  timestamp?: string;
  reactionCount?: number;
  [key: string]: any;
}

interface Canopy {
  id: string;
  name: string;
  memberCount?: number;
  messageCount?: number;
  [key: string]: any;
}

interface Bridger {
  id: string;
  name: string;
  bridgeCount?: number;
  [key: string]: any;
}

interface Reward {
  id: string;
  title: string;
  description?: string;
  points?: number;
  [key: string]: any;
}

export class SidebarRight {
  private searchInput: HTMLInputElement | null = null;
  private rewardsContainer: HTMLElement | null = null;
  private topCanopiesContainer: HTMLElement | null = null;
  private topTimelineContainer: HTMLElement | null = null;
  private topPostsContainer: HTMLElement | null = null;
  private topBridgersContainer: HTMLElement | null = null;
  private getAuthHeaders: (() => Record<string, string>) | null = null;
  private onSearch: ((query: string) => void) | null = null;

  constructor(
    searchInputId: string,
    rewardsId: string,
    topCanopiesId: string,
    topTimelineId: string,
    topPostsId: string,
    topBridgersId: string,
    getAuthHeaders?: () => Record<string, string>,
    onSearch?: (query: string) => void
  ) {
    this.searchInput = document.getElementById(searchInputId) as HTMLInputElement | null;
    this.rewardsContainer = document.getElementById(rewardsId);
    this.topCanopiesContainer = document.getElementById(topCanopiesId);
    this.topTimelineContainer = document.getElementById(topTimelineId);
    this.topPostsContainer = document.getElementById(topPostsId);
    this.topBridgersContainer = document.getElementById(topBridgersId);
    this.getAuthHeaders = getAuthHeaders || null;
    this.onSearch = onSearch || null;
  }

  async init(): Promise<void> {
    // Set up search
    if (this.searchInput) {
      let searchTimeout: NodeJS.Timeout | null = null;
      
      this.searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.trim();
        
        // Debounce search
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        
        searchTimeout = setTimeout(() => {
          if (this.onSearch && query.length > 0) {
            this.onSearch(query);
          }
        }, 300);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = (e.target as HTMLInputElement).value.trim();
          if (this.onSearch && query.length > 0) {
            this.onSearch(query);
          }
        }
      });
    }

    // Load all sidebar sections
    await Promise.all([
      this.loadRewards(),
      this.loadTopCanopies(),
      this.loadTopTimeline(),
      this.loadTopPosts(),
      this.loadTopBridgers()
    ]);
  }

  private async loadRewards(): Promise<void> {
    if (!this.rewardsContainer) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.getAuthHeaders) {
        Object.assign(headers, this.getAuthHeaders());
      }

      const response = await fetch('/api/rewards?limit=5', { headers });
      if (response.ok) {
        const data = await response.json();
        const rewards: Reward[] = data.rewards || [];
        this.renderRewards(rewards);
      } else {
        this.rewardsContainer.innerHTML = '<div class="loading-state">No rewards available</div>';
      }
    } catch (error) {
      console.warn('SidebarRight: Failed to load rewards', error);
      this.rewardsContainer.innerHTML = '<div class="loading-state">Failed to load</div>';
    }
  }

  private async loadTopCanopies(): Promise<void> {
    if (!this.topCanopiesContainer) return;

    // Use unified TopDisplay component
    const topCanopiesDisplay = new TopDisplay(
      this.topCanopiesContainer,
      '/api/canopies/top',
      {
        algorithm: 'simple', // Start with simple, can be changed over time
        limit: 5,
        showMetadata: true
      },
      this.getAuthHeaders || undefined,
      (item: TopDisplayItem) => {
        window.location.href = `/canopies/${item.id}`;
      }
    );

    await topCanopiesDisplay.load();
  }

  private async loadTopTimeline(): Promise<void> {
    if (!this.topTimelineContainer) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.getAuthHeaders) {
        Object.assign(headers, this.getAuthHeaders());
      }

      const response = await fetch('/api/timelines/leaderboard?limit=1', { headers });
      if (response.ok) {
        const data = await response.json();
        const timelines: Timeline[] = data.timelines || [];
        if (timelines.length > 0) {
          this.renderTopTimeline(timelines[0]);
        } else {
          this.topTimelineContainer.innerHTML = '<div class="loading-state">No timeline available</div>';
        }
      } else {
        this.topTimelineContainer.innerHTML = '<div class="loading-state">No timeline available</div>';
      }
    } catch (error) {
      console.warn('SidebarRight: Failed to load top timeline', error);
      this.topTimelineContainer.innerHTML = '<div class="loading-state">Failed to load</div>';
    }
  }

  private async loadTopPosts(): Promise<void> {
    if (!this.topPostsContainer) return;

    // Use unified TopDisplay component
    const topPostsDisplay = new TopDisplay(
      this.topPostsContainer,
      '/api/posts/top',
      {
        algorithm: 'simple', // Start with simple, can be changed over time
        limit: 5,
        showMetadata: true
      },
      this.getAuthHeaders || undefined,
      (item: TopDisplayItem) => {
        // Navigate to post (implementation depends on routing)
        console.log('Navigate to post:', item.id);
      }
    );

    await topPostsDisplay.load();
  }

  private renderRewards(rewards: Reward[]): void {
    if (!this.rewardsContainer) return;

    if (rewards.length === 0) {
      this.rewardsContainer.innerHTML = '<div class="loading-state">No rewards available</div>';
      return;
    }

    const html = rewards.map(reward => `
      <div class="sidebar-item" data-reward-id="${reward.id}">
        <div class="sidebar-item-title">${this.escapeHtml(reward.title)}</div>
        <div class="sidebar-item-meta">
          ${reward.points || 0} points
        </div>
      </div>
    `).join('');

    this.rewardsContainer.innerHTML = html;
  }

  private renderTopCanopies(canopies: Canopy[]): void {
    if (!this.topCanopiesContainer) return;

    if (canopies.length === 0) {
      this.topCanopiesContainer.innerHTML = '<div class="loading-state">No canopies available</div>';
      return;
    }

    const html = canopies.map(canopy => `
      <div class="sidebar-item" data-canopy-id="${canopy.id}">
        <div class="sidebar-item-title">${this.escapeHtml(canopy.name)}</div>
        <div class="sidebar-item-meta">
          ${canopy.memberCount || 0} members • ${canopy.messageCount || 0} messages
        </div>
      </div>
    `).join('');

    this.topCanopiesContainer.innerHTML = html;

    // Add click handlers
    this.topCanopiesContainer.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const canopyId = item.getAttribute('data-canopy-id');
        if (canopyId) {
          window.location.href = `/canopies/${canopyId}`;
        }
      });
    });
  }

  private renderTopTimeline(timeline: Timeline): void {
    if (!this.topTimelineContainer) return;

    const html = `
      <div class="sidebar-item" data-timeline-id="${timeline.id}">
        <div class="sidebar-item-title">${this.escapeHtml(timeline.title)}</div>
        <div class="sidebar-item-meta">
          ${timeline.entryCount || 0} entries • ${timeline.contributorCount || 0} contributors
        </div>
      </div>
    `;

    this.topTimelineContainer.innerHTML = html;

    // Add click handler
    const item = this.topTimelineContainer.querySelector('.sidebar-item');
    if (item) {
      item.addEventListener('click', () => {
        const timelineId = item.getAttribute('data-timeline-id');
        if (timelineId) {
          window.location.href = `/timelines/${timelineId}`;
        }
      });
    }
  }

  private renderTopPosts(posts: Post[]): void {
    if (!this.topPostsContainer) return;

    if (posts.length === 0) {
      this.topPostsContainer.innerHTML = '<div class="loading-state">No posts available</div>';
      return;
    }

    const html = posts.map(post => `
      <div class="sidebar-item" data-post-id="${post.id}">
        <div class="sidebar-item-title">${this.escapeHtml(post.content.substring(0, 100))}${post.content.length > 100 ? '...' : ''}</div>
        <div class="sidebar-item-meta">
          ${post.author || 'Unknown'} • ${post.reactionCount || 0} reactions
        </div>
      </div>
    `).join('');

    this.topPostsContainer.innerHTML = html;

    // Add click handlers
    this.topPostsContainer.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const postId = item.getAttribute('data-post-id');
        if (postId) {
          // Navigate to post (implementation depends on routing)
          console.log('Navigate to post:', postId);
        }
      });
    });
  }

  private async loadTopBridgers(): Promise<void> {
    if (!this.topBridgersContainer) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.getAuthHeaders) {
        Object.assign(headers, this.getAuthHeaders());
      }

      const response = await fetch('/api/bridgers/top?limit=5', { headers });
      if (response.ok) {
        const data = await response.json();
        const bridgers: Bridger[] = data.bridgers || [];
        this.renderTopBridgers(bridgers);
      } else {
        this.topBridgersContainer.innerHTML = '<div class="loading-state">No bridgers available</div>';
      }
    } catch (error) {
      console.warn('SidebarRight: Failed to load top bridgers', error);
      this.topBridgersContainer.innerHTML = '<div class="loading-state">Failed to load</div>';
    }
  }

  private renderTopBridgers(bridgers: Bridger[]): void {
    if (!this.topBridgersContainer) return;

    if (bridgers.length === 0) {
      this.topBridgersContainer.innerHTML = '<div class="loading-state">No bridgers available</div>';
      return;
    }

    const html = bridgers.map(bridger => `
      <div class="sidebar-item" data-bridger-id="${bridger.id}">
        <div class="sidebar-item-title">${this.escapeHtml(bridger.name)}</div>
        <div class="sidebar-item-meta">
          ${bridger.bridgeCount || 0} bridges
        </div>
      </div>
    `).join('');

    this.topBridgersContainer.innerHTML = html;

    // Add click handlers
    this.topBridgersContainer.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const bridgerId = item.getAttribute('data-bridger-id');
        if (bridgerId) {
          window.location.href = `/bridgers/${bridgerId}`;
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

