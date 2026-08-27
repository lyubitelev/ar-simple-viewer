---
name: web-xr-engineer
description: Implement and refactor ar-simple-viewer browser, Three.js, model-viewer, WebXR, storage and small backend changes while preserving public-link, environment and security invariants.
---

# Web/XR Engineer

Use this skill for implementation and refactoring tasks.

## Start

1. Read root `AGENTS.md`.
2. Read relevant docs, especially `docs/product/pricing-policy.md` for landing/pricing work.
3. Identify the HTML page(s), webpack entry, shared helpers, environment config and persistence path affected by the task.
4. Read adjacent code before editing.
5. Keep the requested task boundary explicit; do not solve unrelated legacy problems unless they block correctness.

## Implementation order

1. Define the observable behavior that must change.
2. Identify the current owner of that behavior.
3. Reuse or minimally extend the current mechanism.
4. Keep environment/business values in configuration or the documented product policy, not duplicated in handlers.
5. Keep private credentials server-side.
6. Preserve public/fresh-browser flows before adding creator-local conveniences.
7. Add targeted validation/error handling at actual boundaries.
8. Verify the changed flow and the shared consumers of modified bundles/helpers.

## Frontend rules

- Treat all bundled JavaScript/configuration as public.
- Never add a private API key or SMTP credential to `src/config/envs/*.js` or any browser-imported module.
- Guard page-specific DOM lookups in shared bundles.
- Prefer page-specific entry points when behavior is genuinely page-specific rather than accumulating conditional DOM assumptions.
- Check non-2xx HTTP responses before showing success.
- Keep mobile and desktop flows explicit where behavior differs.
- Do not make a public link depend on pre-existing `localStorage` from the creator's browser.

## Storage/model rules

- Keep `local`, `dev` and `prod` namespaces isolated.
- Resolve content from explicit URL/project/model identity when available.
- Do not broaden S3-compatible storage permissions as a shortcut.
- Treat persisted JSON shapes and URL parameters as contracts.
- When compatibility matters, support old data deliberately rather than by accidental fallback.

## WebXR rules

- Do not assume XR world coordinates survive a new session.
- Persistent placement needs a room-local coordinate frame plus re-calibration/relocalization.
- Saved layouts require room/project identity.
- Avoid globals on `window` unless required by existing HTML/event integration; when used, keep ownership obvious.
- Verify load/save behavior with missing, malformed and unrelated saved state.

## Verification

Run the narrowest useful checks:

- relevant webpack build;
- affected page smoke behavior;
- every page consuming a changed shared bundle;
- fresh-browser/public-link flow for share/QR changes;
- non-2xx behavior for network forms;
- environment mapping for config changes;
- room isolation/reload behavior for persistence changes.

Do not add/run live external integration tests without explicit owner approval.

Before completion, inspect the diff for unrelated cleanup, duplicated constants, secrets, environment mixing and stale product copy.
