import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Diagnostics: Validates that sendMessageViaSupabase in MessagesModule.ts
 * exposes the normalized helper signature plus null-safe guards.
 * Run from repo root via `npx tsx presence/src/scripts/diagnostics/send-message-helper-audit.ts`.
 */

const repoRoot = process.cwd();
const messagesModulePath = path.resolve(repoRoot, 'presence/src/features/MessagesModule.ts');
const source = readFileSync(messagesModulePath, 'utf8');

const issues: string[] = [];

const requiredMarkers: Array<{ marker: string; message: string }> = [
    {
        marker: 'type SendMessageViaSupabaseInput',
        message: 'Missing `SendMessageViaSupabaseInput` union type declaration.'
    },
    {
        marker: 'function normalizeSendMessageInput',
        message: 'Missing `normalizeSendMessageInput` helper to enforce nullable guards.'
    }
];

requiredMarkers.forEach(({ marker, message }) => {
    if (!source.includes(marker)) {
        issues.push(message);
    }
});

const signatureMatch = source.match(/function sendMessageViaSupabase\s*\(([^)]*)\)/);
if (!signatureMatch) {
    issues.push('sendMessageViaSupabase definition not found.');
}
else {
    const parameterSegment = signatureMatch[1] ?? '';
    const firstParam = parameterSegment.split(',')[0]?.trim() ?? '';
    if (!firstParam.includes('SendMessageViaSupabaseInput')) {
        issues.push('sendMessageViaSupabase must accept `SendMessageViaSupabaseInput` as its first parameter.');
    }
}

if (issues.length > 0) {
    console.error('❌ send-message-helper-audit: normalization requirements not met:');
    issues.forEach((issue, index) => {
        console.error(`  ${index + 1}. ${issue}`);
    });
    process.exit(1);
}

console.log('✅ send-message-helper-audit: sendMessageViaSupabase normalization verified.');
