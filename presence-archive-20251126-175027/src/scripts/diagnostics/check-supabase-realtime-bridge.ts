import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SRC_ROOT = path.resolve(__dirname, '..', '..');

const allowList = new Set<string>([
  path.join(SRC_ROOT, 'types', 'global.d.ts'),
  path.join(SRC_ROOT, 'types', 'realtime.ts')
]);

function walkDir(dir: string, bucket: string[]): void {
  for (const entry of readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    const stats = statSync(entryPath);
    if (stats.isDirectory()) {
      walkDir(entryPath, bucket);
    } else if (stats.isFile()) {
      bucket.push(entryPath);
    }
  }
}

const files: string[] = [];
walkDir(SRC_ROOT, files);

const offenders: string[] = [];

for (const file of files) {
  if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
  if (allowList.has(file)) continue;

  const contents = readFileSync(file, 'utf-8');
  if (!contents.includes('supabaseRealtimeClient')) continue;

  const hasBridgeReference = contents.includes('SupabaseRealtimeClientBridge');
  if (!hasBridgeReference) {
    offenders.push(path.relative(SRC_ROOT, file));
  }
}

if (offenders.length > 0) {
  console.error('❌ SupabaseRealtimeClientBridge usage check failed.');
  console.error('The following files reference window.supabaseRealtimeClient without importing SupabaseRealtimeClientBridge:');
  offenders.forEach(file => console.error(`  - ${file}`));
  console.error('\nFix by importing SupabaseRealtimeClientBridge from src/types/realtime.js (or using a shared helper that references it).');
  process.exit(1);
}

console.log('✅ SupabaseRealtimeClientBridge diagnostics passed – all references are typed via the shared bridge.');



