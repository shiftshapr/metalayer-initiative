# Canopi Go-Live Status — 2025‑01‑24 (Evening)

## 1. Current Readiness

- ✅ `npm run type-check` — passes with zero diagnostics after the agent refactors.
- ✅ `npm run build:presence` — succeeds (Build #252) and syncs the compiled bundle into `presence/extension/`.
- ⚠️ `npm run test:diagnostics` — fails on 3 suites because Vitest cannot resolve `@presence` imports that end with `.js` while source files are `.ts`:

```
presence/tests/diagnostics/messageDisplayDiagnostic.test.ts
presence/tests/diagnostics/rootCauseDiagnostic.test.ts
presence/tests/utils/chatLoadingOverlayPatch.test.ts
```

Example failure:

```2:4:presence/tests/diagnostics/messageDisplayDiagnostic.test.ts
import { runMessageDisplayDiagnostic } from "@presence/utils/diagnostics/MessageDisplayDiagnostic.js";
```

Source lives at `presence/src/utils/diagnostics/MessageDisplayDiagnostic.ts`, so Vite cannot find the `.js` target during testing. The runtime build is fine because the TS compiler emits `.js` to `dist/`, but Vitest operates directly on `src`.

- 🔍 Browser verification still outstanding for three features the agents flagged (exact features not specified in the automations). No local server/browser session has been run yet, so we still need to manually load:
  1. **Share Message flow** (`/share-message?message=<id>`)
  2. **Timelines page** (`/timelines`)
  3. **Extension sidepanel messaging** (Chrome extension with build #252)

## 2. Immediate Next Steps (Before Declaring Go-Live)

1. **Fix Vitest path resolution (ETA: < 1 hr)**
   - Change the test imports to omit the `.js` suffix or add `extensions: ['.ts', '.js']` to `resolve.alias` in `vitest.config.ts`.
   - Example fix:
     ```diff
     -import { runMessageDisplayDiagnostic } from "@presence/utils/diagnostics/MessageDisplayDiagnostic.js";
     +import { runMessageDisplayDiagnostic } from "@presence/utils/diagnostics/MessageDisplayDiagnostic";
     ```
   - Re-run `npm run test:diagnostics` to ensure the diagnostics suite is green.

2. **Browser smoke tests (ETA: 1 hr)**
   - Start backend with real env vars (now enforced by `config/validateEnv.js` requiring Supabase + CORS settings).
   - Load the extension (build #252) and verify:
     - Communities toggle updates `ui.activeCommunities` and chat history loads.
     - Share-message deep links redirect correctly.
     - Timelines page fetches data without console errors.
   - Capture console/network logs for each of the three features so regressions are documented.

3. **Record release tag + checklist**
   - Tag commit `25d9016` (the build source) as the baseline once tests + browser checks pass.
   - Document required env vars: `SESSION_SECRET`, Google OAuth trio, Supabase URL/key, `ALLOWED_ORIGINS`.
   - Note post-deploy verification steps for ops on the release notes.

## 3. Post-Go-Live Incremental Improvements

These can run in parallel with new feature work once the above is complete:

| Area | What to improve | Rationale |
|------|-----------------|-----------|
| Vitest coverage | Add smoke tests for `CommunityHelpers` & `loadChatHistory` to guard the `ui.activeCommunities` flow | Prevent future regressions after refactors |
| Logging policy | Now that SD1 debug logs served their purpose, add a prod log filter (e.g., `Logger.setLevel('INFO')` in prod) | Keeps bundles lighter and console cleaner |
| Error handling | `handleError()` is wired everywhere; follow-up PR can standardize user-facing toasts/messages per module | Avoids silent failures during future feature launches |
| Browser automation | Add a Playwright smoke script for the three critical flows so we don’t rely solely on manual checks | Saves time each release |

## 4. TL;DR

- Builds are healthy; the refactor milestone slices are effectively complete.
- Remaining blockers to call go-live ready: fix the Vitest alias/import mismatch and run/record the three browser checks.
- Once those two tasks are done, ship the build, then continue improving incrementally (logging, automation, QoL tooling) while features move forward.



