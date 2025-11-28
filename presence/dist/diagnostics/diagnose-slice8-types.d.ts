/**
 * Diagnostic Script: Slice 8 Type Issues
 *
 * Scans for TypeScript best practice violations in:
 * - sidepanel/Sidepanel.ts
 * - sidepanel/buildGraph.ts
 * - sidepanel/controllers/BootController.ts
 * - sidepanel/controllers/TabController.ts
 * - sidepanel/types.ts
 * - components/*.ts
 * - ui/*.ts
 *
 * Issues to detect:
 * - `as any` type assertions
 * - `@ts-ignore` / `@ts-expect-error` suppressions
 * - `(graph as any)` casting
 * - `(window as any)` casting
 * - Missing proper type definitions
 */
export {};
//# sourceMappingURL=diagnose-slice8-types.d.ts.map