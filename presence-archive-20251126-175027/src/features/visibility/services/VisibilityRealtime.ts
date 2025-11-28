/**
 * VISIBILITY REALTIME SERVICE - Real-time Data Service Abstraction
 * 
 * Abstracts Supabase realtime operations for visibility system.
 * Phase 2: Core Logic Separation - Service Abstraction
 */

import type { IVisibilityRealtime, VisibilityUser } from '../core/VisibilityTypes.js';
import type { User } from '../../../types/index.js';

/**
 * VisibilityRealtime service implementation
 * Wraps Supabase realtime client to provide abstraction
 */
export class VisibilityRealtime implements IVisibilityRealtime {
  private supabaseClient: {
    on: (event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void) => void;
    getPageUsers: (pageId: string) => Promise<VisibilityUser[]>;
    getUserProfile: (userId: string) => Promise<Partial<User> | null>; // UUID ONLY
  };

  constructor(supabaseClient: {
    on: (event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void) => void;
    getPageUsers: (pageId: string) => Promise<VisibilityUser[]>;
    getUserProfile: (userId: string) => Promise<Partial<User> | null>; // UUID ONLY
  }) {
    this.supabaseClient = supabaseClient;
  }

  /**
   * Subscribe to realtime events
   */
  on(event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void): void {
    this.supabaseClient.on(event, handler);
  }

  /**
   * Get users for a specific page
   */
  async getPageUsers(pageId: string): Promise<VisibilityUser[]> {
    return this.supabaseClient.getPageUsers(pageId);
  }

  /**
   * Get user profile by UUID
   * UUID ONLY - no email lookups
   */
  async getUserProfile(userId: string): Promise<Partial<User> | null> {
    return this.supabaseClient.getUserProfile(userId);
  }
}

