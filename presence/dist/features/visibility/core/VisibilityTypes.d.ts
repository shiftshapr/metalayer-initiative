/**
 * VISIBILITY TYPES - Type Definitions
 *
 * Centralized type definitions for the visibility module.
 * Phase 1: Foundation - Type Definitions
 */
import type { User } from '../../../types/index.js';
/**
 * Extended user interface for visibility system
 * Includes presence and page-specific data
 */
export interface VisibilityUser extends Partial<User> {
    id: string;
    email?: string;
    name?: string;
    handle?: string;
    avatarUrl?: string;
    auraColor?: string;
    communityId?: string;
    lastSeen?: string;
    isActive?: boolean;
    status?: string;
    pageId?: string;
    [key: string]: unknown;
}
/**
 * Service interface for Supabase/realtime operations
 */
export interface IVisibilityRealtime {
    on(event: string, handler: (eventType: string, newRecord: unknown, oldRecord: unknown) => void): void;
    getPageUsers(pageId: string): Promise<VisibilityUser[]>;
    getUserProfile(userId: string): Promise<Partial<User> | null>;
}
/**
 * Storage service interface for visibility settings
 */
export interface IVisibilityStorage {
    getVisibility(): Promise<boolean>;
    saveVisibility(value: boolean): Promise<void>;
    getStatus(): Promise<string>;
    saveStatus(value: string): Promise<void>;
    getAuraColor(): Promise<string>;
    saveAuraColor(value: string): Promise<void>;
    getAuraIntensity(): Promise<number>;
    saveAuraIntensity(value: number): Promise<void>;
    getDisplayName(): Promise<string>;
    saveDisplayName(value: string): Promise<void>;
}
/**
 * Visibility state snapshot
 */
export interface VisibilityStateSnapshot {
    users: VisibilityUser[];
    currentPageId: string | null;
    currentUserEmail: string | null;
    isActive: boolean;
    timestamp: number;
}
/**
 * Visibility event types
 */
export type VisibilityEventType = 'user-joined' | 'user-left' | 'user-updated' | 'page-changed' | 'visibility-changed' | 'status-changed';
/**
 * Visibility event payload
 */
export interface VisibilityEvent {
    type: VisibilityEventType;
    userId?: string;
    pageId?: string;
    data?: unknown;
    timestamp: number;
}
/**
 * Page ID resolution result
 */
export interface PageIdResolution {
    pageId: string | null;
    source: 'tab-container' | 'current-url-data' | 'dom-attribute' | 'null';
}
/**
 * Visibility manager status
 */
export interface VisibilityManagerStatus {
    isActive: boolean;
    currentUserEmail: string | null;
    currentPageId: string | null;
    visibleUsers: number;
    lastUpdate?: number;
}
//# sourceMappingURL=VisibilityTypes.d.ts.map