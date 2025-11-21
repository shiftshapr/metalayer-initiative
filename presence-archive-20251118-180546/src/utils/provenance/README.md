# Digital Provenance Implementation (TypeScript)

Non-invasive digital provenance system for Canopi messages, fully typed with TypeScript.

## TypeScript Structure

All files are in TypeScript with full type safety:

- **`types/provenance.ts`** - Type definitions for all provenance structures
- **`utils/provenance/ProvenanceService.ts`** - Core service (typed)
- **`utils/provenance/verify.ts`** - Verification utility (typed)
- **`utils/provenance/ProvenanceDiagnostic.ts`** - UI overlay (typed)
- **`utils/provenance/ProvenanceLinkInjector.ts`** - DOM link injector (typed)
- **`utils/provenance/init.ts`** - Initialization script (typed)

## Type Definitions

All types are exported from `types/provenance.ts`:

```typescript
import type {
  ProvenanceArtifact,
  ProvenanceCollection,
  ProvenanceMessage,
  VerificationResult
} from '../../types/provenance';
```

### Key Types

- **`ProvenanceArtifact`** - Complete JSON-LD provenance record
- **`ProvenanceCollection`** - Response format for `.well-known/provenance`
- **`ProvenanceMessage`** - Message structure for provenance capture
- **`VerificationResult`** - Signature verification result
- **`ProvenanceScope`** - What the provenance applies to
- **`ProvenanceClaim`** - The assertion being made
- **`ProvenanceActor`** - Who or what made the claim

## Usage

### Enable Provenance

```typescript
// In browser console or code
localStorage.setItem('provenance_enabled', 'true');
// Then reload the page or call:
(window as any).provenanceService.initialize(true);
```

### Type-Safe Access

```typescript
// Get service (typed)
const service = (window as any).provenanceService as ProvenanceService;

// Capture provenance (typed)
const artifact = await service.captureMessageProvenance('create', message);

// Get provenance (typed)
const artifacts: ProvenanceArtifact[] = await service.getMessageProvenance('message-id');

// Verify (typed)
const verifier = (window as any).provenanceVerifier as ProvenanceVerifier;
const results = await verifier.verifyArtifactChain(artifacts);
```

## Building

The TypeScript files are compiled to JavaScript in the `dist/` directory:

```bash
# Compile TypeScript
npm run build

# Or watch mode
npm run watch
```

## Type Safety Benefits

1. **Compile-time checks** - Catch errors before runtime
2. **IntelliSense support** - Full autocomplete in IDEs
3. **Refactoring safety** - Rename and find references safely
4. **Documentation** - Types serve as inline documentation
5. **Interface contracts** - Clear contracts between modules

## Migration from JavaScript

The old `.js` files in `presence/utils/provenance/` can be removed once TypeScript compilation is set up. The TypeScript versions are drop-in replacements with full type safety.






