/**
 * Shared Type Utilities for Window Interface Extensions
 * 
 * Provides reusable type patterns for extending the Window interface
 * with application-specific properties and managers.
 */

/**
 * Base interface for manager classes exposed on window
 */
export interface BaseManagerWindowAPI {
  initialize: () => Promise<void> | void;
  [key: string]: unknown;
}

/**
 * Helper type for creating window API interfaces for managers
 * that have additional methods beyond initialize
 */
export type ManagerWindowAPI<T extends Record<string, unknown> = Record<string, unknown>> = 
  BaseManagerWindowAPI & T;

/**
 * Helper type for extracting constructor type from a module export
 */
export type ConstructorType<T> = T extends new (...args: unknown[]) => infer R ? R : never;

/**
 * Helper type for creating window property types that accept
 * both instance and constructor
 */
export type WindowManagerProperty<TInstance, TConstructor> = {
  instance?: TInstance;
  constructor?: TConstructor;
};

/**
 * Type guard for checking if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if a value is a record/object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Normalize chat data from array or record format to array
 */
export function normalizeChatData<T>(
  data: T[] | Record<string, T[]> | null | undefined
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.values(data).flat();
}






