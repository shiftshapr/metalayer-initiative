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
export type ManagerWindowAPI<T extends Record<string, unknown> = Record<string, unknown>> = BaseManagerWindowAPI & T;
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
export declare function isArray<T>(value: unknown): value is T[];
/**
 * Type guard for checking if a value is a record/object
 */
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/**
 * Normalize chat data from array or record format to array
 */
export declare function normalizeChatData<T>(data: T[] | Record<string, T[]> | null | undefined): T[];
//# sourceMappingURL=window-utils.d.ts.map