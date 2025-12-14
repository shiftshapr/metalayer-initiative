/**
 * Runtime Type Guards and Validation Utilities
 *
 * Provides runtime type checking and validation for TypeScript safety.
 * These guards complement compile-time checks with runtime validation.
 */

import type { Message, User, RawMessagePayload, TabConfig } from '../types/index.js';

// Node.js process global for environment checks
declare const process: { env: { NODE_ENV?: string } };

/**
 * Core type guard utilities
 */
export class TypeGuards {
  /**
   * Check if value is a non-empty string
   */
  static isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Check if value is a valid string ID (non-empty, reasonable length)
   */
  static isValidId(value: unknown): value is string {
    return this.isNonEmptyString(value) && value.length <= 100;
  }

  /**
   * Check if value is a valid ISO date string or Date object
   */
  static isValidDate(value: unknown): boolean {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date.toISOString() === value;
    }
    return false;
  }

  /**
   * Check if value is a valid email format
   */
  static isValidEmail(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}

/**
 * Message type guards and validation
 */
export class MessageValidators {
  /**
   * Runtime type guard for Message interface
   */
  static isValidMessage(obj: unknown): obj is Message {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const msg = obj as any;

    return (
      TypeGuards.isValidId(msg.id) &&
      TypeGuards.isNonEmptyString(msg.content) &&
      TypeGuards.isValidId(msg.authorId) &&
      TypeGuards.isNonEmptyString(msg.conversationId) &&
      TypeGuards.isValidDate(msg.createdAt) &&
      TypeGuards.isValidDate(msg.updatedAt) &&
      UserValidators.isValidUser(msg.author)
    );
  }

  /**
   * Runtime type guard for RawMessagePayload interface
   */
  static isValidRawMessagePayload(obj: unknown): obj is RawMessagePayload {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const payload = obj as any;

    // At minimum, should have an ID and some content
    return (
      (payload.id === undefined || TypeGuards.isValidId(payload.id)) &&
      (payload.messageId === undefined || TypeGuards.isValidId(payload.messageId)) &&
      (payload.uuid === undefined || TypeGuards.isValidId(payload.uuid)) &&
      (payload.content === undefined || typeof payload.content === 'string') &&
      (payload.message === undefined || typeof payload.message === 'string') &&
      (payload.body === undefined || typeof payload.body === 'string')
    );
  }

  /**
   * Validate message for UI rendering requirements
   */
  static isValidForRendering(obj: unknown): obj is Message {
    return (
      this.isValidMessage(obj) &&
      obj.author !== undefined &&
      TypeGuards.isNonEmptyString(obj.author.name || obj.author.handle)
    );
  }

  /**
   * Safe message content extraction
   */
  static extractContent(message: unknown): string {
    if (this.isValidMessage(message)) {
      return message.content;
    }

    if (this.isValidRawMessagePayload(message)) {
      return message.content || message.message || message.body || '[Invalid Content]';
    }

    return '[Invalid Message]';
  }

  /**
   * Safe message to string conversion
   */
  static toDisplayString(message: unknown): string {
    try {
      if (this.isValidMessage(message)) {
        const author = message.author.name || message.author.handle || 'Unknown';
        const timestamp = message.createdAt && typeof message.createdAt === 'object' && (message.createdAt as any) instanceof Date
          ? (message.createdAt as Date).toLocaleString()
          : String(message.createdAt || '');
        return `${author}: ${message.content} (${timestamp})`;
      }

      if (this.isValidRawMessagePayload(message)) {
        return this.extractContent(message);
      }

      return '[Invalid Message Format]';
    } catch (error) {
      console.warn('Message to string conversion failed:', error);
      return '[Message Conversion Error]';
    }
  }
}

/**
 * User type guards and validation
 */
export class UserValidators {
  /**
   * Runtime type guard for User interface
   */
  static isValidUser(obj: unknown): obj is User {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const user = obj as any;

    return (
      TypeGuards.isValidId(user.id) &&
      (user.email === undefined || TypeGuards.isValidEmail(user.email)) &&
      (user.name === undefined || TypeGuards.isNonEmptyString(user.name)) &&
      (user.handle === undefined || TypeGuards.isNonEmptyString(user.handle))
    );
  }

  /**
   * Validate user for display requirements
   */
  static isValidForDisplay(obj: unknown): obj is User {
    return (
      this.isValidUser(obj) &&
      Boolean(obj.name || obj.handle)
    );
  }

  /**
   * Safe user name extraction
   */
  static extractDisplayName(user: unknown): string {
    if (this.isValidForDisplay(user)) {
      return user.name || user.handle || 'Unknown User';
    }
    return 'Unknown User';
  }
}

/**
 * Tab configuration type guards
 */
export class TabValidators {
  /**
   * Runtime type guard for TabConfig interface
   */
  static isValidTabConfig(obj: unknown): obj is TabConfig {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const tab = obj as any;

    return (
      TypeGuards.isValidId(tab.id) &&
      TypeGuards.isNonEmptyString(tab.label) &&
      typeof tab.visible === 'boolean' &&
      (tab.icon === undefined || typeof tab.icon === 'string') &&
      (tab.builtIn === undefined || typeof tab.builtIn === 'boolean')
    );
  }
}

/**
 * API Response validation utilities
 */
export class ApiValidators {
  /**
   * Generic API response validator with type guard
   */
  static validateApiResponse<T>(
    data: unknown,
    validator: (obj: unknown) => obj is T,
    context: string = 'API response'
  ): T {
    if (validator(data)) {
      return data;
    }

    // Log validation failure for debugging
    console.warn(`${context} validation failed:`, data);

    // In development, throw error for immediate feedback
    if (process.env.NODE_ENV === 'development') {
      throw new TypeError(`Invalid ${context}: ${JSON.stringify(data)}`);
    }

    // In production, return fallback or throw
    throw new Error(`${context} validation failed`);
  }

  /**
   * Safe API response validation with fallback
   */
  static validateApiResponseWithFallback<T>(
    data: unknown,
    validator: (obj: unknown) => obj is T,
    fallback: T,
    context: string = 'API response'
  ): T {
    try {
      return this.validateApiResponse(data, validator, context);
    } catch (error) {
      console.warn(`${context} validation failed, using fallback:`, error);
      return fallback;
    }
  }

  /**
   * Validate array of items
   */
  static validateApiResponseArray<T>(
    data: unknown,
    validator: (obj: unknown) => obj is T,
    context: string = 'API response array'
  ): T[] {
    if (!Array.isArray(data)) {
      throw new TypeError(`${context} is not an array`);
    }

    return data.map((item, index) =>
      this.validateApiResponse(item, validator, `${context}[${index}]`)
    );
  }
}

/**
 * Error boundary utilities for type safety
 */
export class ErrorBoundaries {
  /**
   * Safe type operation with fallback
   */
  static safeTypeOperation<T>(
    operation: () => T,
    fallback: T,
    context: string = 'type operation'
  ): T {
    try {
      return operation();
    } catch (error) {
      console.warn(`${context} failed, using fallback:`, error);
      return fallback;
    }
  }

  /**
   * Safe property access with type checking
   */
  static safePropertyAccess<T>(
    obj: unknown,
    property: string,
    validator?: (value: unknown) => value is T,
    fallback?: T
  ): T | undefined {
    try {
      if (typeof obj === 'object' && obj !== null) {
        const value = (obj as any)[property];
        if (validator) {
          return validator(value) ? value : fallback;
        }
        return value;
      }
    } catch (error) {
      console.warn(`Property access failed for ${property}:`, error);
    }
    return fallback;
  }
}

/**
 * Interface contract validation
 */
export class InterfaceValidators {
  /**
   * Validate object implements required interface methods
   */
  static validateInterface<T>(
    obj: unknown,
    requiredMethods: (keyof T)[],
    optionalMethods: (keyof T)[] = [],
    interfaceName: string = 'interface'
  ): obj is T {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const target = obj as any;

    // Check required methods
    const hasRequired = requiredMethods.every(method =>
      typeof target[method] === 'function'
    );

    if (!hasRequired) {
      console.warn(`${interfaceName} missing required methods:`,
        requiredMethods.filter(method => typeof target[method] !== 'function')
      );
      return false;
    }

    // Check optional methods (should be functions if present)
    const hasValidOptional = optionalMethods.every(method =>
      target[method] === undefined || typeof target[method] === 'function'
    );

    if (!hasValidOptional) {
      console.warn(`${interfaceName} has invalid optional methods:`,
        optionalMethods.filter(method =>
          target[method] !== undefined && typeof target[method] !== 'function'
        )
      );
      return false;
    }

    return true;
  }

  /**
   * Version-aware interface validation
   */
  static validateInterfaceVersion<T>(
    obj: unknown,
    versionChecks: Array<{
      version: string;
      validator: (obj: unknown) => obj is T;
    }>,
    interfaceName: string = 'interface'
  ): obj is T {
    for (const check of versionChecks) {
      if (check.validator(obj)) {
        console.debug(`${interfaceName} validated as ${check.version}`);
        return true;
      }
    }

    console.warn(`${interfaceName} failed all version checks`);
    return false;
  }
}

// Export convenience functions for common validations
export const isValidMessage = MessageValidators.isValidMessage;
export const isValidUser = UserValidators.isValidUser;
export const isValidTabConfig = TabValidators.isValidTabConfig;
export const validateApiResponse = ApiValidators.validateApiResponse;
export const safeTypeOperation = ErrorBoundaries.safeTypeOperation;


