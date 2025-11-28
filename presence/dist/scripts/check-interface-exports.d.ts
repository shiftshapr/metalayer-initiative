#!/usr/bin/env ts-node
/**
 * Pre-commit hook: Check for missing interface exports
 * Detects when a class implements an interface but the interface is not exported
 *
 * Pattern: When a class uses "implements InterfaceName", verify that InterfaceName
 * is exported from the imported module.
 *
 * Usage:
 *   npx tsx presence/src/scripts/check-interface-exports.ts [files...]
 *   npx tsx presence/src/scripts/check-interface-exports.ts --help
 */
interface Violation {
    file: string;
    line: number;
    interfaceName: string;
    importPath: string;
    message: string;
}
interface ImplementsClause {
    line: number;
    interface: string;
    importPath: string;
}
declare function findImplementsClauses(filePath: string): ImplementsClause[];
declare function checkFiles(files: string[], projectRoot: string): Violation[];
export { checkFiles, findImplementsClauses };
//# sourceMappingURL=check-interface-exports.d.ts.map