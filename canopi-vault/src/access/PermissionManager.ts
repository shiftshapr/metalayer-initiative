/**
 * PermissionManager - Permission management and validation
 */

import type { Permission, PersistentPermission } from '../types/AccessTypes.js';

export interface PermissionManager {
  hasPermission(requester: string, permission: Permission): Promise<boolean>;
  checkPermissions(requester: string, permissions: Permission[]): Promise<boolean>;
  validatePermission(requester: string, permission: Permission, dataType: string): Promise<boolean>;
}

export class PermissionManagerImpl implements PermissionManager {
  private permissions: Map<string, PersistentPermission> = new Map();

  /**
   * Check if requester has specific permission
   */
  async hasPermission(requester: string, permission: Permission): Promise<boolean> {
    const persistentPermission = this.permissions.get(requester);
    if (!persistentPermission) {
      return false;
    }

    // Check if permission is granted
    if (!persistentPermission.permissions.includes(permission)) {
      return false;
    }

    // Check if expired
    if (persistentPermission.expiresAt && persistentPermission.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Check if requester has all required permissions
   */
  async checkPermissions(requester: string, permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(requester, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate permission for specific data type
   */
  async validatePermission(requester: string, permission: Permission, dataType: string): Promise<boolean> {
    // TODO: Implement data type-specific validation
    return this.hasPermission(requester, permission);
  }
}



