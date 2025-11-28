/**
 * Automated Error Handling Migration Script
 *
 * Migrates error handling patterns across the codebase to use the standardized
 * ErrorHandler utilities and proper TypeScript error typing.
 *
 * Features:
 * - Converts `catch (error)` to `catch (error: unknown)`
 * - Replaces console.log/error/warn with handleError/Logger
 * - Adds proper error context
 * - Adds necessary imports
 * - Dry-run mode for safety
 *
 * Usage:
 *   npx tsx src/scripts/migrate-error-handling.ts --dry-run  # Preview changes
 *   npx tsx src/scripts/migrate-error-handling.ts            # Apply changes
 */
interface MigrationResult {
    file: string;
    changes: number;
    errors: string[];
    warnings: string[];
}
interface MigrationStats {
    totalFiles: number;
    filesModified: number;
    totalChanges: number;
    errors: number;
    warnings: number;
}
/**
 * Migrate a single file
 */
declare function migrateFile(filePath: string): MigrationResult;
/**
 * Main migration function
 */
declare function runMigration(): void;
export { runMigration, migrateFile, type MigrationResult, type MigrationStats };
//# sourceMappingURL=migrate-error-handling.d.ts.map